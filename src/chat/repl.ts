import { createInterface } from "readline";
import { createChatEngine } from "./engine";
import { getMcpServers } from "../mcp";
import { getSql } from "../db/connection";
import { log } from "../utils/log";

export async function startRepl(
  mode: "new" | "continue" | "pick" = "new",
  simChannel?: string,
  context?: { employee?: string; agent?: string; job?: string },
): Promise<void> {
  const channel = simChannel || "terminal";
  const room = context?.employee
    ? `terminal-emp-${context.employee}`
    : context?.agent
      ? `terminal-agent-${context.agent}`
      : context?.job
        ? `terminal-job-${context.job}`
        : `terminal-${process.ppid}`;

  const resume = mode === "continue" ? true : mode === "pick" ? (await pickSession()) ?? false : false;

  const engine = await createChatEngine({
    room,
    channel,
    resume,
    mcpServers: getMcpServers({ channel: "terminal", room }),
    ...context,
  });

  console.log(`Clara chat started (room: ${room})${engine.sessionId ? " [resumed]" : ""}. Type /quit to exit.`);

  const rl = createInterface({ input: process.stdin, output: process.stdout, prompt: "> " });
  rl.prompt();

  for await (const line of rl) {
    const input = line.trim();
    if (!input) { rl.prompt(); continue; }
    if (input === "/quit") break;
    if (input === "/new") {
      await engine.close();
      console.log("Starting new session...");
      return startRepl("new", simChannel, context);
    }

    const { DIM, RESET } = await import("../utils/cli");
    process.stdout.write(`${DIM}thinking${RESET}`);

    let streamedLen = 0;
    const result = await engine.send(input, {
      onStream(accumulated) {
        const chunk = accumulated.slice(streamedLen);
        if (chunk) { process.stdout.write(`\r\x1b[2K\r${accumulated}`); streamedLen = accumulated.length; }
      },
      onActivity() {
        process.stdout.write(`\r\x1b[2K\r`);
      },
    });

    if (!streamedLen && result.result) {
      process.stdout.write(`\r\x1b[2K\r${result.result}`);
    } else if (streamedLen < result.result.length) {
      process.stdout.write(result.result.slice(streamedLen));
    }
    process.stdout.write("\n");

    if (result.costUsd > 0) {
      process.stderr.write(`${DIM}$${result.costUsd.toFixed(4)}${RESET}\n`);
    }

    rl.prompt();
  }

  await engine.close();
  rl.close();
}

async function pickSession(): Promise<string | false> {
  const { Session } = await import("../db/models");
  const sessions = await Session.listRecent(10);
  if (sessions.length === 0) {
    console.log("No previous sessions.");
    return false;
  }
  console.log("Recent sessions:");
  sessions.forEach((s, i) => {
    const preview = s.preview ? s.preview.slice(0, 60) : "(empty)";
    console.log(`  ${i + 1}. [${s.room}] ${preview}`);
  });

  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, prompt: "Pick session (1-N) or 0 for new: " });
    rl.on("line", (line) => {
      const n = parseInt(line.trim(), 10);
      if (n > 0 && n <= sessions.length) {
        resolve(sessions[n - 1].id);
      } else {
        resolve(false);
      }
      rl.close();
    });
  });
}
