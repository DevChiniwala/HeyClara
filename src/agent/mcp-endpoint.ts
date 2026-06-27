/**
 * Loopback MCP HTTP endpoint that CLI backends (Codex) connect back to
 * for HeyClara's tools. Runs on a local port, serves the same CLARA_TOOLS
 * table as the in-process server.
 */
import { log } from "../utils/log";
import type { NiaTool } from "../mcp/tools/types";

let server: ReturnType<typeof Bun.serve> | null = null;

export async function startMcpEndpoint(tools: NiaTool[]): Promise<number> {
  if (server) return server.port ?? 0;

  const port = process.env.CLARA_MCP_PORT ? parseInt(process.env.CLARA_MCP_PORT, 10) : 0;

  server = Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);
      if (url.pathname === "/tools" && req.method === "GET") {
        const toolDefs = tools.map((t) => ({ name: t.name, description: t.description }));
        return Response.json(toolDefs);
      }

      if (url.pathname === "/call" && req.method === "POST") {
        const body = (await req.json()) as { name: string; args: Record<string, unknown> };
        const tool = tools.find((t) => t.name === body.name);
        if (!tool) return new Response(`Unknown tool: ${body.name}`, { status: 404 });
        try {
          const result = await tool.handler(body.args);
          return Response.json({ result });
        } catch (err) {
          return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
        }
      }

      return new Response("Not found", { status: 404 });
    },
  });

  log.info({ port: server.port }, "MCP endpoint started");
  return server.port ?? 0;
}

export function stopMcpEndpoint(): void {
  if (server) {
    server.stop();
    server = null;
    log.info("MCP endpoint stopped");
  }
}

export function getMcpEndpointUrl(): string {
  if (!server) return "";
  return `http://localhost:${server.port}`;
}
