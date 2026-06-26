import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { CLARA_TOOLS } from "./tools/table";

export function createClaraMcpServer(sourceCtx?: Record<string, unknown>) {
  return createSdkMcpServer({
    name: "clara",
    version: "0.5.0",
    tools: CLARA_TOOLS.map((t) =>
      tool(t.name, t.description, t.schema, async (args: unknown) => ({
        content: [{ type: "text" as const, text: await t.handler(args as Record<string, unknown>, sourceCtx) }],
      })),
    ),
  });
}
