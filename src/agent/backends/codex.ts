import { spawn } from "child_process";
import { createInterface } from "readline";
import type { AgentBackend, AgentSession, AgentSessionContext, AgentEvent } from "../types";
import type { Attachment } from "../../types/attachment";
import { getConfig } from "../../utils/config";
import { log } from "../../utils/log";

const CODEX_BIN = process.env.CODEX_BIN || "codex";

export class CodexBackend implements AgentBackend {
  readonly name = "codex" as const;

  async openSession(ctx: AgentSessionContext): Promise<AgentSession> {
    const config = getConfig();
    let sessionId: string | null = null;
    let proc: ReturnType<typeof spawn> | null = null;
    let aborted = false;
    let abortReason: string | null = null;

    return {
      get backendSessionId() {
        return sessionId;
      },

      async *send(text: string, _attachments?: Attachment[]) {
        if (aborted) throw new Error(abortReason || "aborted");

        const args = [
          "--model", ctx.model || config.model,
          "--systemPrompt", ctx.systemPrompt,
          "--prompt", text,
          "--cwd", ctx.cwd,
          "--nonInteractive",
        ];

        if (ctx.resume && typeof ctx.resume === "string") {
          args.push("--resume", ctx.resume);
        }

        proc = spawn(CODEX_BIN, args, {
          stdio: ["pipe", "pipe", "pipe"],
          env: { ...process.env, CLAUDE_CODE_ENTRYPOINT: undefined },
        });

        const reader = createInterface({ input: proc.stdout as NodeJS.ReadableStream, crlfDelay: Infinity });
        let sawResult = false;

        try {
          for await (const line of reader) {
            if (aborted) throw new Error(abortReason || "aborted");
            const trimmed = line.trim();
            if (!trimmed) continue;

            let parsed: unknown;
            try {
              parsed = JSON.parse(trimmed);
            } catch {
              continue;
            }

            const msg = parsed as Record<string, unknown>;
            if (msg.type === "session" || msg.type === "result") {
              sessionId = (msg.backendSessionId as string) || sessionId;
            }
            if (msg.type === "result") sawResult = true;

            yield msg as unknown as AgentEvent;
          }
        } finally {
          reader.close();
        }

        const { exitCode, stderr } = await new Promise<{ exitCode: number | null; stderr: string }>((resolve) => {
          if (!proc) return resolve({ exitCode: null, stderr: "" });
          let stderrData = "";
          proc.stderr?.on("data", (chunk: Buffer) => { stderrData += chunk.toString(); });
          proc.on("close", (code) => resolve({ exitCode: code, stderr: stderrData }));
        });

        if (aborted) throw new Error(abortReason || "aborted");

        if (exitCode !== 0 && !sawResult) {
          yield {
            type: "error",
            message: stderr.trim() || `codex exited ${exitCode}`,
            retryable: false,
            providerDown: false,
          };
        }
      },

      abort(reason: string) {
        aborted = true;
        abortReason = reason;
        proc?.kill();
      },

      async close() {
        // codex is one-shot per send; nothing to tear down
      },
    };
  }

  async canResume(_backendSessionId: string, _cwd: string): Promise<boolean> {
    return false;
  }
}
