#!/usr/bin/env bun
import { Command } from "commander";
import { mkdirSync } from "fs";
import { getClaraHome } from "../utils/paths";
import { getConfig } from "../utils/config";
import { log } from "../utils/log";
import { readFileSync } from "fs";
import { join } from "path";

const program = new Command();

program
  .name("clara")
  .description("HeyClara — your personal AI assistant daemon")
  .version(readPackageJson().version, "-v, --version");

// Set log level early
try {
  const config = getConfig();
  if (config.log_level) process.env.LOG_LEVEL = config.log_level;
} catch {}

// Ensure ~/.clara/ exists
mkDirForCommands();

program
  .command("start")
  .description("Start the daemon")
  .action(async () => {
    log.info("clara start requested");
  });

program
  .command("stop")
  .description("Stop the daemon")
  .action(async () => {
    log.info("clara stop requested");
  });

program
  .command("status")
  .description("Show daemon status")
  .action(async () => {
    console.log("clara status — coming in Phase 2");
  });

program
  .command("run")
  .description("Run a one-shot prompt (or start daemon if no prompt)")
  .argument("[prompt...]", "Prompt to execute")
  .action(async (promptArgs: string[]) => {
    const prompt = promptArgs.join(" ");
    if (prompt) {
      log.info({ prompt }, "one-shot run requested");
      console.log(`Prompt: ${prompt}`);
      console.log("Agent execution — coming in Phase 2");
    } else {
      log.info("starting daemon process");
      console.log("Daemon mode — coming in Phase 2");
    }
  });

program
  .command("chat")
  .description("Start an interactive chat session")
  .option("-c, --continue", "Continue last session")
  .option("-r, --resume", "Pick a session to resume")
  .option("--channel <name>", "Simulate a channel (terminal, slack, telegram)")
  .action(async (options) => {
    console.log("Chat REPL — coming in Phase 2");
  });

program
  .command("init")
  .description("Run initial setup wizard")
  .action(async () => {
    console.log("Init wizard — coming in Phase 2");
  });

program
  .command("job")
  .description("Manage scheduled jobs")
  .addCommand(new Command("list").description("List all jobs").action(() => console.log("Job list — coming in Phase 2")))
  .addCommand(new Command("add").description("Add a job").action(() => console.log("Job add — coming in Phase 2")))
  .addCommand(new Command("remove").description("Remove a job").action(() => console.log("Job remove — coming in Phase 2")))
  .addCommand(new Command("run").description("Run a job now").action(() => console.log("Job run — coming in Phase 2")));

program
  .command("config")
  .description("Manage configuration")
  .addCommand(new Command("list").description("Show all config").action(() => console.log("Config list — coming in Phase 2")))
  .addCommand(new Command("get").argument("<key>", "Config key").action((key) => console.log(`Config get ${key} — coming in Phase 2`)))
  .addCommand(new Command("set").argument("<key>", "Config key").argument("<value>", "Config value").action((key, value) => console.log(`Config set ${key}=${value} — coming in Phase 2`)));

program
  .command("db")
  .description("Database operations")
  .addCommand(new Command("setup").description("Setup database").action(() => console.log("DB setup — coming in Phase 2")))
  .addCommand(new Command("migrate").description("Run migrations").action(() => console.log("DB migrate — coming in Phase 2")))
  .addCommand(new Command("status").description("Check DB status").action(() => console.log("DB status — coming in Phase 2")));

program
  .command("channels")
  .description("Manage channels")
  .argument("[action]", "on or off")
  .argument("[channel]", "Channel name")
  .action((action, channel) => {
    console.log(`Channels ${action} ${channel || ""} — coming in Phase 2`);
  });

program.parse(process.argv);

function readPackageJson(): { version: string; name: string } {
  try {
    const p = join(import.meta.dir, "..", "..", "package.json");
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return { version: "0.0.0", name: "heyclara" };
  }
}

function mkDirForCommands(): void {
  const skip = new Set(["init", "help", "version", "-v", "--version", "-h", "--help"]);
  const cmd = process.argv[2];
  if (cmd && !skip.has(cmd)) {
    mkdirSync(getClaraHome(), { recursive: true });
  }
}
