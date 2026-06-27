import { existsSync, mkdirSync, readFileSync, writeFileSync, closeSync, openSync } from "fs";
import { dirname, resolve as pathResolve } from "path";
import { fileURLToPath } from "url";
import { getPaths } from "../utils/paths";
import { getConfig, resetConfig } from "../utils/config";
import { log } from "../utils/log";
import { isRunning, readPid, removePid, writePid } from "../utils/pid";
import { ActiveEngine, Job } from "../db/models";
import { runMigrations } from "../db/migrate";
import { closeDb, getSql } from "../db/connection";
import { registerAllChannels, startChannels, stopChannels, getStarted, getConfiguredChannelNames } from "../channels";
import type { Channel } from "../types/channel";
import { startScheduler, stopScheduler, recomputeAllNextRuns } from "./scheduler";
import { startAlive, stopAlive } from "./alive";
import { createClaraMcpServer } from "../mcp/server";
import { setMcpFactory } from "../mcp";
import { startMcpEndpoint, stopMcpEndpoint } from "../agent/mcp-endpoint";
import { CLARA_TOOLS } from "../mcp/tools/table";
import { processPending, cleanupOldRequests } from "./finalizer";
import { closeAllActiveHandles } from "./active-handles";
import { clearForceShutdownRequest, consumeForceShutdownRequest, requestForceShutdown } from "./force-shutdown";

export { isRunning, readPid, removePid, writePid };

export function startDaemon(): number {
  const { daemonLog } = getPaths();
  mkdirSync(dirname(daemonLog), { recursive: true });
  const logFd = openSync(daemonLog, "a");

  const execPath = process.execPath;
  const scriptPath = process.argv[1];

  const cleanEnv = { ...process.env };
  delete cleanEnv.CLAUDECODE;
  delete cleanEnv.CLAUDE_CODE_ENTRYPOINT;
  delete cleanEnv.CLAUDE_AGENT_SDK_VERSION;

  const proc = Bun.spawn([execPath, scriptPath, "run"], {
    stdio: ["ignore", logFd, logFd],
    env: cleanEnv,
    detached: true,
  });

  proc.unref();
  closeSync(logFd);
  const pid = proc.pid;
  writePid(pid);
  return pid;
}

export function stopDaemon(opts: { force?: boolean } = {}): boolean {
  const pidfilePid = readPid();
  if (opts.force) {
    requestForceShutdown([...(pidfilePid ? [pidfilePid] : []), ...findDaemonPids()]);
  }
  removePid();

  const killed = killAllDaemons(pidfilePid);
  if (killed === 0 && pidfilePid === null) {
    if (opts.force) clearForceShutdownRequest();
    return false;
  }

  waitForExit(opts.force ? 30_000 : 310_000);
  if (opts.force) clearForceShutdownRequest();
  return true;
}

function waitForExit(timeoutMs: number): void {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (findDaemonPids().length === 0) return;
    Bun.sleepSync(100);
  }
  for (const pid of findDaemonPids()) {
    try { process.kill(pid, "SIGKILL"); } catch {}
  }
  const killDeadline = Date.now() + 2_000;
  while (Date.now() < killDeadline) {
    if (findDaemonPids().length === 0) return;
    Bun.sleepSync(50);
  }
}

export function findDaemonPids(): number[] {
  try {
    const result = Bun.spawnSync(["pgrep", "-f", "src/cli/index\\.ts run$"]);
    const stdout = new TextDecoder().decode(result.stdout).trim();
    if (!stdout) return [];
    return stdout.split("\n").map((l) => parseInt(l, 10)).filter((pid) => !isNaN(pid) && pid !== process.pid);
  } catch { return []; }
}

function killAllDaemons(knownPid?: number | null): number {
  const toKill = new Set<number>(findDaemonPids());
  if (knownPid && knownPid !== process.pid) toKill.add(knownPid);
  for (const pid of toKill) {
    try { process.kill(pid, "SIGTERM"); } catch {}
  }
  return toKill.size;
}

async function bootstrapSystemJobs(): Promise<void> {
  const here = dirname(fileURLToPath(import.meta.url));
  const systemJobs = [
    {
      name: "memory-promoter",
      schedule: "0 3 * * *",
      scheduleType: "cron" as const,
      always: true,
      stateless: true,
      promptPath: pathResolve(here, "../../defaults/memory-promoter.md"),
    },
  ];

  for (const j of systemJobs) {
    const existing = await Job.get(j.name);
    if (existing) continue;
    if (!existsSync(j.promptPath)) {
      log.warn({ job: j.name, promptPath: j.promptPath }, "system job prompt missing, skipping bootstrap");
      continue;
    }
    const prompt = readFileSync(j.promptPath, "utf8");
    await Job.create(j.name, j.schedule, prompt, j.always, j.scheduleType, undefined, undefined, j.stateless);
    log.info({ job: j.name }, "bootstrapped system job");
  }
}

export async function runDaemon(): Promise<void> {
  delete process.env.CLAUDECODE;
  delete process.env.CLAUDE_CODE_ENTRYPOINT;
  delete process.env.CLAUDE_AGENT_SDK_VERSION;

  const existingPid = readPid();
  if (existingPid !== null && existingPid !== process.pid) {
    const alive = findDaemonPids();
    if (alive.includes(existingPid)) {
      log.debug({ existingPid, myPid: process.pid }, "another daemon already running, exiting");
      process.exit(0);
    }
    log.warn({ stalePid: existingPid }, "taking over from stale pid");
    removePid();
  }

  process.on("uncaughtException", (err) => {
    log.fatal({ err }, "uncaught exception");
    removePid();
    process.exit(1);
  });
  process.on("unhandledRejection", (reason) => {
    const err = reason instanceof Error ? reason : new Error(String(reason));
    log.fatal({ err }, "unhandled rejection");
    removePid();
    process.exit(1);
  });

  writePid(process.pid);
  log.info({ pid: process.pid }, "daemon started");

  try { mkdirSync(getPaths().watchesDir, { recursive: true }); } catch {}
  try { mkdirSync(getPaths().selfDir, { recursive: true }); } catch {}

  try {
    await runMigrations();
    await ActiveEngine.clearAll();
    log.info("cleared stale active engines");
  } catch (err) {
    log.warn({ err }, "startup recovery: postgres unavailable");
  }

  try {
    await bootstrapSystemJobs();
  } catch (err) {
    log.warn({ err }, "failed to bootstrap system jobs");
  }

  // Clear stale running states
  const { readState, writeState } = await import("../utils/logger");
  const state = readState();
  let recovered = 0;
  for (const [name, info] of Object.entries(state)) {
    if (info.status === "running") {
      state[name] = { ...info, status: "error", error: "daemon crashed during execution" };
      recovered++;
    }
  }
  if (recovered > 0) { writeState(state); log.info({ recovered }, "recovered stale running jobs"); }

  setMcpFactory((ctx) => ({ clara: createClaraMcpServer(ctx as Record<string, unknown> | undefined) }));
  log.info("MCP server factory initialized");

  await startMcpEndpoint(CLARA_TOOLS);

  registerAllChannels();
  let channels: Channel[] = [];
  const config = getConfig();
  if (config.channels.enabled) {
    const result = await startChannels();
    channels = result.started;
  }

  try { await recomputeAllNextRuns(); } catch (err) { log.warn({ err }, "failed to recompute next runs"); }

  startScheduler();
  startAlive();

  try {
    const sql = getSql();
    await sql.listen("clara_jobs", async () => {
      log.info("job change detected via NOTIFY, recomputing next runs");
      await recomputeAllNextRuns().catch((err) => log.warn({ err }, "recompute failed on notify"));
    });
  } catch (err) {
    log.warn({ err }, "could not subscribe to clara_jobs");
  }

  try {
    const sql = getSql();
    await sql.listen("clara_finalize", async () => {
      log.info("finalization request received via NOTIFY");
      await processPending().catch((err) => log.warn({ err }, "finalize failed on notify"));
    });
  } catch (err) {
    log.warn({ err }, "could not subscribe to clara_finalize");
  }

  processPending().catch((err) => log.warn({ err }, "startup: failed to drain pending finalizations"));

  setInterval(() => {
    cleanupOldRequests().catch((err) => log.warn({ err }, "cleanup failed"));
  }, 24 * 60 * 60 * 1000);

  process.on("SIGHUP", async () => {
    log.info("received SIGHUP, reloading config");
    resetConfig();
    const running = getStarted();
    const wantedNames = getConfiguredChannelNames();
    if (wantedNames.length > 0 && running.length === 0) {
      const result = await startChannels();
      channels = result.started;
    } else if (wantedNames.length === 0 && running.length > 0) {
      await stopChannels(running);
      channels = [];
    }
    await recomputeAllNextRuns().catch(() => {});
  });

  let shuttingDown = false;

  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    const force = consumeForceShutdownRequest(process.pid);
    log.info({ force }, "shutting down...");

    stopAlive();
    stopScheduler();
    stopMcpEndpoint();
    await stopChannels(channels);

    try {
      if (force) closeAllActiveHandles("force shutdown");
      const engines = await ActiveEngine.list();
      if (engines.length > 0 && !force) {
        log.info({ count: engines.length }, "waiting for active engines to finish");
        const deadline = Date.now() + 300_000;
        while (Date.now() < deadline) {
          if ((await ActiveEngine.list()).length === 0) break;
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
      await ActiveEngine.clearAll();
    } catch {}

    try { await closeDb(); } catch {}

    removePid();
    log.info("shutdown complete");
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  await new Promise(() => {});
}
