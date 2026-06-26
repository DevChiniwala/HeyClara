import { normalizeSdkEvent } from "../normalizers/sdk";
import type { AgentBackend, AgentSession, AgentSessionContext, AgentEvent } from "../types";
import type { Attachment } from "../../types/attachment";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AgentProcess: any = (await import("@anthropic-ai/claude-agent-sdk" as any)).AgentProcess;

const CLAUDE_BIN = process.env.CLAUDE_BIN || "claude";

export class ClaudeBackend implements AgentBackend {
  readonly name = "claude" as const;

  async openSession(ctx: AgentSessionContext): Promise<AgentSession> {
    const args: string[] = [];

    if (ctx.model) args.push("--model", ctx.model);
    if (ctx.resume && typeof ctx.resume === "string") args.push("--resume", ctx.resume);
    if (!ctx.interactive) args.push("--nonInteractive", "--noUserPrompt", "--print");

    if (ctx.resume === false) {
      args.push("--resume", "false");
    }

    if (ctx.subagents) {
      for (const [name, def] of Object.entries(ctx.subagents)) {
        args.push("--agent", JSON.stringify({ name, description: def.description, prompt: def.prompt }));
      }
    }

    args.push("--", ctx.systemPrompt);

    const SDK = await import("@anthropic-ai/claude-agent-sdk");
    const AgentProcess = (SDK as Record<string, unknown>).AgentProcess as new (opts: Record<string, unknown>) => {
      enablePrompt(): void;
      disablePrompt(): void;
      sendPrompt(text: string): AsyncIterable<unknown>;
      abort(): void;
      close(): Promise<void>;
    };
    const proc = new AgentProcess({
      agentProcess: CLAUDE_BIN,
      args,
      cwd: ctx.cwd,
      env: {
        ...process.env,
        CLAUDE_CODE_ENTRYPOINT: undefined,
        CLAUDE_AGENT_SDK_VERSION: undefined,
      },
    });

    const normalizer = new SdkNormalizer();
    let aborted = false;
    let abortReason: string | null = null;
    let sessionId: string | null = null;

    return {
      get backendSessionId() {
        return sessionId;
      },

      async *send(text: string, attachments?: Attachment[]) {
        if (aborted) throw new Error(abortReason || "aborted");
        proc.enablePrompt();

        const lines: string[] = [text];
        if (attachments && attachments.length > 0) {
          for (const att of attachments) {
            if (att.source?.type === "base64") {
              lines.push(`<image data:${att.source.media_type || att.mediaType};base64,${att.source.data}>`);
            } else if (att.source?.type === "url") {
              lines.push(`<image ${att.source.url}>`);
            } else if (att.source?.type === "path") {
              lines.push(`<image ${att.source.file_path}>`);
            }
          }
        }
        const fullPrompt = lines.join("\n");

        const iter = proc.sendPrompt(fullPrompt);
        let sawResult = false;

        try {
          for await (const msg of iter) {
            if (aborted) throw new Error(abortReason || "aborted");

            for (const ev of normalizer.consume(msg)) {
              if (ev.type === "session" || ev.type === "result") {
                sessionId = ev.backendSessionId || sessionId;
              }
              if (ev.type === "result") sawResult = true;
              yield ev;
            }
          }
        } finally {
          proc.disablePrompt();
        }

        if (!sawResult) {
          yield {
            type: "error" as const,
            message: "Claude agent process ended without a result",
            retryable: false,
            providerDown: false,
          };
        }
      },

      abort(reason: string) {
        aborted = true;
        abortReason = reason;
        proc.abort();
      },

      async close() {
        await proc.close();
      },
    };
  }

  async canResume(backendSessionId: string, cwd: string): Promise<boolean> {
    const { existsSync, readFileSync } = await import("fs");
    const { join } = await import("path");

    const jsonlPath = join(cwd, ".claude", "sessions.jsonl");
    if (!existsSync(jsonlPath)) return false;

    try {
      const content = readFileSync(jsonlPath, "utf8");
      return content.includes(backendSessionId);
    } catch {
      return false;
    }
  }
}

class SdkNormalizer {
  consume(msg: unknown): AgentEvent[] {
    return normalizeSdkEvent(msg);
  }
}
