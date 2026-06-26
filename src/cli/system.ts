import { existsSync } from "fs";
import { withDb } from "../db/with-db";
import { runMigrations } from "../db/migrate";
import { getSql } from "../db/connection";
import { Message } from "../db/models";
import { localTime } from "../utils/time";
import { getPaths } from "../utils/paths";
import { runHealthChecks } from "../core/health";
import { errMsg } from "../utils/errors";
import { fail, pass, ICON_PASS, ICON_FAIL } from "../utils/cli";

export async function dbSetup(): Promise<void> {
  console.log("Database setup requires PostgreSQL. Run `clara db migrate` after ensuring DATABASE_URL is set.");
}

export async function dbMigrate(): Promise<void> {
  await withDb(async () => {
    await runMigrations();
    pass("Migrations complete.");
  });
}

export async function dbStatus(): Promise<void> {
  await withDb(async () => {
    try {
      const sql = getSql();
      await sql`SELECT 1`;
      pass("Database connected.");
    } catch (err) {
      fail(`Database error: ${errMsg(err)}`);
    }
  });
}

export async function healthCheck(): Promise<void> {
  const checks = await runHealthChecks();
  for (const c of checks) {
    console.log(`  ${c.ok ? ICON_PASS : ICON_FAIL} ${c.name}: ${c.detail}`);
  }
}

export async function showHistory(room?: string): Promise<void> {
  await withDb(async () => {
    const messages = await Message.getRecent(20, room);
    if (messages.length === 0) { console.log("No messages yet."); return; }
    for (const m of messages) {
      const time = localTime(new Date(m.createdAt));
      const prefix = m.sender === "user" ? "you" : m.sender;
      const roomTag = room ? "" : `[${m.room}] `;
      console.log(`  ${roomTag}${time}  ${prefix} > ${m.content.slice(0, 120).replace(/\n/g, " ")}`);
    }
  });
}

export async function backupCreate(silent = false): Promise<void> {
  const paths = getPaths();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = `${paths.home}/backups/clara-${timestamp}`;

  const { mkdirSync, cpSync } = await import("fs");
  mkdirSync(backupPath, { recursive: true });

  const dirsToBackup = ["self", "jobs", "images", "tmp", "watches"];
  for (const dir of dirsToBackup) {
    const src = `${paths.home}/${dir}`;
    if (existsSync(src)) {
      cpSync(src, `${backupPath}/${dir}`, { recursive: true });
    }
  }

  const { copyFileSync } = await import("fs");
  if (existsSync(paths.config)) {
    copyFileSync(paths.config, `${backupPath}/config.yaml`);
  }

  if (!silent) pass(`Backup created: ${backupPath}`);
}

export async function backupList(): Promise<void> {
  const backupDir = `${getPaths().home}/backups`;
  if (!existsSync(backupDir)) { console.log("No backups found."); return; }
  const { readdirSync } = await import("fs");
  const backups = readdirSync(backupDir).sort().reverse();
  for (const b of backups) {
    console.log(`  ${b}`);
  }
}

export async function runTests(verbose: boolean, extraArgs: string[]): Promise<void> {
  const args = ["test", ...extraArgs];
  const proc = Bun.spawn(["bun", ...args], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, LOG_LEVEL: "silent" },
  });

  const [stdout, stderr] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
  const exitCode = await proc.exited;
  const output = stdout + stderr;

  if (verbose) { process.stdout.write(output); }
  else {
    for (const line of output.split("\n")) {
      if (/^\s*\d+ pass/.test(line) || /^\s*\d+ fail/.test(line) || /^Ran \d+ tests/.test(line) || /expect\(\) calls/.test(line)) {
        console.log(line);
      } else if (/FAIL|error:/i.test(line.trim())) {
        console.log(line);
      }
    }
  }
  process.exit(exitCode);
}
