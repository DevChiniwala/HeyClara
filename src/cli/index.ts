#!/usr/bin/env bun
import { Command } from "commander";
import { mkdirSync } from "fs";
import { readFileSync } from "fs";
import { join } from "path";
import { getClaraHome } from "../utils/paths";
import { getConfig } from "../utils/config";

const program = new Command();
const pkg = readPackageJson();

program
  .name("clara")
  .description("HeyClara \u2014 your personal AI assistant daemon")
  .version(pkg.version, "-v, --version");

// Ensure ~/.clara/ exists for commands that need it
setupHomeDir();

// Set log level early
try { const config = getConfig(); if (config.log_level) process.env.LOG_LEVEL = config.log_level; } catch {}

// ---------------------------------------------------------------------------
// Daemon commands
// ---------------------------------------------------------------------------
program
  .command("start")
  .description("Start the daemon")
  .action(async () => {
    const { daemonStart } = await import("./daemon");
    await daemonStart();
  });

program
  .command("stop")
  .description("Stop the daemon")
  .option("--wait <minutes>", "Wait N minutes for active engines", parseInt)
  .option("--force", "Force stop without waiting")
  .action(async (options) => {
    const { daemonStop } = await import("./daemon");
    await daemonStop(options);
  });

program
  .command("restart")
  .description("Restart the daemon")
  .option("--wait <minutes>", "Wait N minutes for active engines", parseInt)
  .option("--force", "Force restart without waiting")
  .action(async (options) => {
    const { daemonRestart } = await import("./daemon");
    await daemonRestart(options);
  });

program
  .command("status")
  .description("Show daemon status")
  .action(async () => {
    const { daemonStatus } = await import("./daemon");
    await daemonStatus();
  });

program
  .command("logs")
  .description("View daemon logs")
  .option("-f, --follow", "Follow log output")
  .option("--channel <name>", "Filter by channel")
  .action(async (options) => {
    const { daemonLogs } = await import("./daemon");
    await daemonLogs(options.follow, options.channel);
  });

// ---------------------------------------------------------------------------
// Chat commands
// ---------------------------------------------------------------------------
program
  .command("chat")
  .description("Start an interactive chat session")
  .option("-c, --continue", "Continue last session")
  .option("-r, --resume", "Pick a session to resume")
  .option("--channel <name>", "Simulate a channel")
  .option("--employee <name>", "Chat in employee context")
  .option("--agent <name>", "Chat in agent context")
  .option("--job <name>", "Chat in job context")
  .action(async (options) => {
    const { startRepl } = await import("../chat/repl");
    const mode = options.continue ? "continue" as const : options.resume ? "pick" as const : "new" as const;
    await startRepl(mode, options.channel, { employee: options.employee, agent: options.agent, job: options.job });
  });

program
  .command("run")
  .description("Run a one-shot prompt")
  .argument("<prompt...>", "Prompt to execute")
  .action(async (promptArgs: string[]) => {
    const { runOneShot } = await import("./chat");
    await runOneShot(promptArgs.join(" "));
  });

program
  .command("history")
  .description("View recent messages")
  .argument("[room]", "Filter by room")
  .action(async (room) => {
    const m = await import("./system");
    await m.showHistory(room);
  });

// ---------------------------------------------------------------------------
// Job commands
// ---------------------------------------------------------------------------
const jobCmd = program
  .command("job")
  .description("Manage scheduled jobs");

jobCmd.command("list").description("List all jobs").action(async () => {
  const { jobList } = await import("./jobs");
  await jobList();
});

jobCmd.command("show").argument("<name>", "Job name").description("Show job details").action(async (name) => {
  const { jobShow } = await import("./jobs");
  await jobShow(name);
});

jobCmd.command("add")
  .argument("<name>", "Job name")
  .argument("<schedule>", "Schedule (cron, interval, or timestamp)")
  .argument("<prompt>", "Job prompt")
  .option("--type <type>", "Schedule type (cron|interval|once)")
  .option("--always", "Run 24/7 ignoring active hours")
  .option("--agent <name>", "Agent name")
  .option("--employee <name>", "Employee name")
  .option("--model <model>", "Model override")
  .option("--stateless", "Disable working memory")
  .description("Add a new job")
  .action(async (name, schedule, prompt, options) => {
    const { jobAdd } = await import("./jobs");
    await jobAdd(name, schedule, prompt, options);
  });

jobCmd.command("update")
  .argument("<name>", "Job name")
  .option("--schedule <schedule>", "New schedule")
  .option("--prompt <prompt>", "New prompt")
  .option("--type <type>", "Schedule type")
  .option("--always", "Run 24/7")
  .option("--no-always", "Respect active hours")
  .option("--agent <name>", "Agent name")
  .option("--employee <name>", "Employee name")
  .option("--model <model>", "Model override")
  .option("--stateless", "Disable working memory")
  .option("--no-stateless", "Enable working memory")
  .description("Update an existing job")
  .action(async (name, options) => {
    const { jobUpdate } = await import("./jobs");
    await jobUpdate(name, options);
  });

jobCmd.command("remove").argument("<name>", "Job name").description("Remove a job").action(async (name) => {
  const { jobRemove } = await import("./jobs");
  await jobRemove(name);
});

jobCmd.command("enable").argument("<name>", "Job name").description("Enable a job").action(async (name) => {
  const { jobEnable } = await import("./jobs");
  await jobEnable(name);
});

jobCmd.command("disable").argument("<name>", "Job name").description("Disable a job").action(async (name) => {
  const { jobDisable } = await import("./jobs");
  await jobDisable(name);
});

jobCmd.command("run").argument("<name>", "Job name").description("Run a job immediately").action(async (name) => {
  const { jobRunNow } = await import("./jobs");
  await jobRunNow(name);
});

// ---------------------------------------------------------------------------
// Persona commands
// ---------------------------------------------------------------------------
const personaCmd = program.command("persona").description("Manage persona");

personaCmd.command("rules").argument("[action]", "show or reset").action(async (action) => {
  const m = await import("./persona");
  if (action === "reset") m.rulesReset();
  else m.rulesShow();
});

personaCmd.command("memory").argument("[action]", "show or reset").action(async (action) => {
  const m = await import("./persona");
  if (action === "reset") m.memoryReset();
  else m.memoryShow();
});

personaCmd.command("agents").argument("[action]", "list or show").argument("[name]", "Agent name").action(async (action, name) => {
  const m = await import("./persona");
  if (action === "show" && name) m.agentShow(name);
  else m.agentsList();
});

personaCmd.command("employees").description("List employees").action(async () => {
  const m = await import("./persona");
  m.employeesList();
});

personaCmd.command("skills").argument("[source]", "Filter by source").description("List skills").action(async (source) => {
  const m = await import("./persona");
  m.skillsList(source);
});

// ---------------------------------------------------------------------------
// Config commands
// ---------------------------------------------------------------------------
const configCmd = program.command("config").description("Manage configuration");

configCmd.command("list").description("Show all config").action(async () => {
  const m = await import("./config");
  m.configList();
});

configCmd.command("get").argument("<key>", "Config key (dot notation)").description("Get a config value").action(async (key) => {
  const m = await import("./config");
  m.configGet(key);
});

configCmd.command("set").argument("<key>", "Config key").argument("<value>", "Config value").description("Set a config value").action(async (key, value) => {
  const m = await import("./config");
  m.configSet(key, value);
});

// ---------------------------------------------------------------------------
// Channel commands
// ---------------------------------------------------------------------------
program.command("channels")
  .description("Toggle channels")
  .argument("<action>", "on or off")
  .argument("[channel]", "Channel name (telegram, slack, sms, whatsapp)")
  .action(async (action, channel) => {
    const m = await import("./channels");
    m.channelsToggle(action, channel);
  });

// ---------------------------------------------------------------------------
// System commands
// ---------------------------------------------------------------------------
const dbCmd = program.command("db").description("Database operations");

dbCmd.command("setup").description("Setup database").action(async () => {
  const m = await import("./system");
  await m.dbSetup();
});

dbCmd.command("migrate").description("Run database migrations").action(async () => {
  const m = await import("./system");
  await m.dbMigrate();
});

dbCmd.command("status").description("Check database connection").action(async () => {
  const m = await import("./system");
  await m.dbStatus();
});

program.command("health").description("Run health checks").action(async () => {
  const m = await import("./system");
  await m.healthCheck();
});

const backupCmd = program.command("backup").description("Manage backups");

backupCmd.command("create").description("Create a backup").action(async () => {
  const m = await import("./system");
  await m.backupCreate();
});

backupCmd.command("list").description("List backups").action(async () => {
  const m = await import("./system");
  await m.backupList();
});

program.command("test")
  .description("Run tests")
  .option("-v, --verbose", "Verbose output")
  .allowUnknownOption(true)
  .action(async (options) => {
    const m = await import("./system");
    const extra = process.argv.slice(3).filter((a) => a !== "-v" && a !== "--verbose");
    await m.runTests(options.verbose, extra);
  });

program.command("init").description("Run setup wizard").action(async () => {
  console.log("Init wizard \u2014 coming in Phase 3");
});

program.parse(process.argv);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readPackageJson(): { version: string; name: string } {
  try {
    const p = join(import.meta.dir, "..", "..", "package.json");
    return JSON.parse(readFileSync(p, "utf8"));
  } catch { return { version: "0.0.0", name: "heyclara" }; }
}

function setupHomeDir(): void {
  const skip = new Set(["init", "help", "version", "-v", "--version", "-h", "--help"]);
  const cmd = process.argv[2];
  if (cmd && !skip.has(cmd)) {
    mkdirSync(getClaraHome(), { recursive: true });
  }
}
