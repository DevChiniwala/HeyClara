import { withDb } from "../db/with-db";
import { createChatEngine } from "../chat/engine";
import { getMcpServers } from "../mcp";
import { DIM, RESET, SPINNER, CLEAR_LINE } from "../utils/cli";

export async function runOneShot(prompt: string): Promise<void> {
  await withDb(async () => {
    const engine = await createChatEngine({
      room: "cli-run",
      channel: "terminal",
      resume: false,
      mcpServers: getMcpServers(),
    });

    let frame = 0;
    let streaming = false;
    let streamedLen = 0;
    let statusText = "thinking";

    const spinTimer = setInterval(() => {
      if (!streaming) {
        process.stderr.write(`${CLEAR_LINE}${DIM}  ${SPINNER[frame]} ${statusText}${RESET}`);
        frame = (frame + 1) % SPINNER.length;
      }
    }, 80);

    const { result, costUsd, turns } = await engine.send(prompt, {
      onStream(textSoFar) {
        if (!streaming) {
          clearInterval(spinTimer);
          process.stderr.write("\x1b[2K\r");
          streaming = true;
        }
        const chunk = textSoFar.slice(streamedLen);
        if (chunk) { process.stdout.write(chunk); streamedLen = textSoFar.length; }
      },
      onActivity(text) { if (!streaming) statusText = text; },
    });

    if (spinTimer && !streaming) clearInterval(spinTimer);

    if (!streaming && result.trim()) {
      process.stdout.write(result.trim());
    } else if (streaming) {
      const rest = result.slice(streamedLen);
      if (rest.trim()) process.stdout.write(rest);
    }

    const costStr = costUsd > 0 ? `$${costUsd.toFixed(4)}` : "";
    const turnsStr = turns > 0 ? `${turns} turn${turns !== 1 ? "s" : ""}` : "";
    const meta = [costStr, turnsStr].filter(Boolean).join(" \u00B7 ");
    if (meta) process.stderr.write(`\n${DIM}${meta}${RESET}`);
    process.stdout.write("\n");

    await engine.close();
  });
}
