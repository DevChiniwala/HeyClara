import { existsSync, readFileSync, statSync, openSync, readSync, closeSync } from "fs";
import { isRunning, readPid, removePid } from "../utils/pid";
import { getConfig } from "../utils/config";
import { getPaths } from "../utils/paths";
import { withDb } from "../db/with-db";
import { ActiveEngine } from "../db/models";
import { guardActiveEngines, parseGuardFlags, withDefaultWait } from "../core/engine-guard";
import { ICON_PASS, ICON_WARN, fail } from "../utils/cli";

const STARTUP_MARKERS: Record<string, string> = {
  telegram: "telegram bot polling started",
  slack: "slack bot started",
  scheduler: "scheduler started",
};

async function awaitStartup(timeout = 60_000): Promise<void> {
  const { daemonLog } = getPaths();
  const config = getConfig();
  const expecting = new Set<string>();
  if (config.channels.enabled) {
    if (config.channels.telegram.enabled && config.channels.telegram.bot_token) expecting.add("telegram");
    if (config.channels.slack.enabled && config.channels.slack.bot_token && config.channels.slack.app_token) {
      expecting.add("slack");
    }
  }
  expecting.add("scheduler");

  if (expecting.size === 0) return;

  const { readFileSync } = await import("fs");
  const ready = new Set<string>();
  let logOffset = 0;
  try { logOffset = readFileSync(daemonLog, "utf8").length; } catch {}

  const startTime = Date.now();
  while (ready.size < expecting.size && Date.now() - startTime < timeout) {
    await new Promise((r) => setTimeout(r, 500));
    let content = "";
    try { content = readFileSync(daemonLog, "utf8").slice(logOffset); } catch { continue; }
    for (const name of expecting) {
      if (ready.has(name)) continue;
      if (content.includes(STARTUP_MARKERS[name])) ready.add(name);
    }
  }

  for (const name of expecting) {
    if (ready.has(name)) console.log(`  ${ICON_PASS} ${name}`);
  }
  const pending = [...expecting].filter((e) => !ready.has(e));
  if (pending.length > 0) console.log(`  ${ICON_WARN} timed out: ${pending.join(", ")}`);
}

export async function daemonStart(): Promise<void> {
  if (isRunning()) fail(`clara is already running (pid: ${readPid()})`);
  const { registerService } = await import("../commands/service");
  await registerService();
  await new Promise((r) => setTimeout(r, 1000));
  if (!isRunning()) {
    const { startDaemon } = await import("../core/daemon");
    startDaemon();
  }
  const pid = readPid();
  console.log(`clara starting${pid ? ` (pid: ${pid})` : ""}...`);
  await awaitStartup();
  console.log("clara started");
}

export async function daemonStop(flags: ReturnType<typeof parseGuardFlags>): Promise<void> {
  if (!isRunning()) fail("clara is not running");
  if (!(await guardActiveEngines("stop", flags))) process.exit(1);
  const { unregisterService } = await import("../commands/service");
  await unregisterService({ force: flags.force });
  const { stopDaemon } = await import("../core/daemon");
  stopDaemon({ force: flags.force });
  console.log("clara stopped");
}

export async function daemonRestart(flags: ReturnType<typeof parseGuardFlags>): Promise<void> {
  if (!(await guardActiveEngines("restart", flags))) process.exit(1);
  const { isServiceInstalled, restartService } = await import("../commands/service");
  if (isServiceInstalled()) {
    await restartService({ force: flags.force });
  } else {
    const { stopDaemon, startDaemon } = await import("../core/daemon");
    stopDaemon({ force: flags.force });
    startDaemon();
  }
  const pid = readPid();
  console.log(`clara restarting${pid ? ` (pid: ${pid})` : ""}...`);
  await awaitStartup();
  console.log("clara restarted");
}

export async function daemonStatus(): Promise<void> {
  await withDb(async () => {
    const running = isRunning();
    const pid = readPid();
    console.log(`Daemon: ${running ? `${ICON_PASS} running (pid: ${pid})` : `${ICON_WARN} not running`}`);

    const engines = await ActiveEngine.list();
    if (engines.length > 0) {
      console.log(`\nActive engines (${engines.length}):`);
      for (const e of engines) {
        console.log(`  ${e.room} (${e.channel}) since ${e.startedAt}`);
      }
    }

    const { Job } = await import("../db/models");
    const jobs = await Job.list();
    const activeJobs = jobs.filter((j) => j.status === "active");
    const disabledJobs = jobs.filter((j) => j.status === "disabled");
    console.log(`\nJobs: ${activeJobs.length} active, ${disabledJobs.length} disabled`);
  });
}

export async function daemonLogs(follow: boolean, channelFilter?: string): Promise<void> {
  const { daemonLog } = getPaths();
  if (!existsSync(daemonLog)) fail("No daemon log found. Is clara running?");

  const filterLines = (lines: string[]) => {
    if (!channelFilter) return lines;
    return lines.filter((l) => l.toLowerCase().includes(channelFilter.toLowerCase()));
  };

  if (!follow) {
    const lines = readFileSync(daemonLog, "utf8").split("\n").slice(-200);
    for (const line of filterLines(lines)) console.log(line);
    return;
  }

  let { size } = statSync(daemonLog);
  while (true) {
    const newSize = statSync(daemonLog).size;
    if (newSize > size) {
      const fd = openSync(daemonLog, "r");
      const buf = Buffer.alloc(newSize - size);
      readSync(fd, buf, 0, buf.length, size);
      closeSync(fd);
      const newLines = buf.toString("utf8").split("\n");
      for (const line of filterLines(newLines)) {
        if (line) console.log(line);
      }
      size = newSize;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
}
