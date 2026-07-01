/**
 * Loopback MCP HTTP endpoint that CLI backends (Codex) connect back to
 * for HeyClara's tools. Runs on a local port, serves the same CLARA_TOOLS
 * table as the in-process server.
 * 
 * Enhanced for web UI: CORS, WebSocket logs, health check.
 */
import type { ClaraTool } from "../mcp/tools/types";

let server: ReturnType<typeof Bun.serve> | null = null;
// Use any for Bun's ServerWebSocket which is compatible with standard WebSocket methods
const wsClients = new Set<any>();

const WEB_ORIGIN = process.env.CLARA_WEB_ORIGIN || "http://localhost:3001";

// Simple logging to avoid circular deps
function mcpLog(level: string, msg: string, data?: Record<string, unknown>): void {
  const time = new Date().toISOString();
  console.log(JSON.stringify({ level, time, msg, ...data }));
}

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": WEB_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
  };
}

function broadcastLog(line: string): void {
  for (const ws of wsClients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(line);
    }
  }
}

export function addLogBroadcaster(line: string): void {
  broadcastLog(line);
}

export async function startMcpEndpoint(tools: ClaraTool[]): Promise<number> {
  if (server) return server.port ?? 0;

  const port = process.env.CLARA_MCP_PORT ? parseInt(process.env.CLARA_MCP_PORT, 10) : 0;

  server = Bun.serve({
    port,
    async fetch(req, server) {
      const url = new URL(req.url);

      // CORS preflight
      if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders() });
      }

      // Health check
      if (url.pathname === "/health" && req.method === "GET") {
        return Response.json({ status: "ok", version: "0.5.0", mcpPort: server.port }, { headers: corsHeaders() });
      }

      // WebSocket for live logs
      if (url.pathname === "/ws/logs") {
        const upgraded = server.upgrade(req, { data: {} });
        if (!upgraded) return new Response("Upgrade failed", { status: 500 });
        return new Response(null, { status: 101 });
      }

      // REST endpoints
      if (url.pathname === "/tools" && req.method === "GET") {
        const toolDefs = tools.map((t) => ({ name: t.name, description: t.description }));
        return Response.json(toolDefs, { headers: corsHeaders() });
      }

      if (url.pathname === "/call" && req.method === "POST") {
        const body = (await req.json()) as { name: string; args: Record<string, unknown> };
        const tool = tools.find((t) => t.name === body.name);
        if (!tool) return new Response(`Unknown tool: ${body.name}`, { status: 404, headers: corsHeaders() });
        try {
          const result = await tool.handler(body.args);
          return Response.json({ result }, { headers: corsHeaders() });
        } catch (err) {
          return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500, headers: corsHeaders() });
        }
      }

      return new Response("Not found", { status: 404, headers: corsHeaders() });
    },
    websocket: {
      open(ws) {
        wsClients.add(ws);
      },
      close(ws) {
        wsClients.delete(ws);
      },
      message(ws, message) {
        // Keep alive - client can send ping
        if (message === "ping") ws.send("pong");
      },
    },
  });

  mcpLog("info", "MCP endpoint started", { port: server.port });
  return server.port ?? 0;
}

export function stopMcpEndpoint(): void {
  if (server) {
    for (const ws of wsClients) ws.close();
    wsClients.clear();
    server.stop();
    server = null;
    mcpLog("info", "MCP endpoint stopped");
  }
}

export function getMcpEndpointUrl(): string {
  if (!server) return "";
  return `http://localhost:${server.port}`;
}
