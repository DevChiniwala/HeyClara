import { NextRequest, NextResponse } from "next/server";
import { mcp } from "@/lib/mcp";

const methodMap: Record<string, Record<string, string>> = {
  "/jobs": { GET: "list_jobs", POST: "add_job" },
  "/sessions": { GET: "list_sessions" },
  "/messages": { GET: "list_messages" },
  "/agents": { GET: "list_agents" },
  "/employees": { GET: "list_employees" },
  "/memory": { GET: "read_memory", POST: "add_memory" },
  "/rules": { GET: "read_rules", POST: "add_rule" },
};

const toolPrefixMap: Record<string, string> = {
  "/sessions/": "read_session",
};

const actionMap: Record<string, Record<string, string>> = {
  "/jobs/enable": { POST: "enable_job" },
  "/jobs/disable": { POST: "disable_job" },
  "/jobs/archive": { POST: "archive_job" },
  "/jobs/remove": { POST: "remove_job" },
  "/jobs/run": { POST: "run_job" },
  "/channels/test": { POST: "test_channel" },
};

async function handleMcpCall(tool: string, args: Record<string, unknown>) {
  try {
    const result = await mcp.call<string>(tool, args);
    return new Response(result, { headers: { "Content-Type": "text/plain" } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = `/${params.path.join("/")}`;

  if (path === "/health") {
    try {
      const baseUrl = await mcp.ensureConnected();
      const resp = await fetch(`${baseUrl}/health`);
      const data = await resp.json();
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ status: "offline" }, { status: 503 });
    }
  }

  const args: Record<string, unknown> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    const num = Number(value);
    args[key] = isNaN(num) ? value : num;
  });

  if (methodMap[path]?.GET) {
    return handleMcpCall(methodMap[path].GET, args);
  }

  for (const [prefix, tool] of Object.entries(toolPrefixMap)) {
    if (path.startsWith(prefix)) {
      const id = path.slice(prefix.length);
      if (!id) continue;
      return handleMcpCall(tool, { session_id: id, ...args });
    }
  }

  return NextResponse.json({ error: `Unknown path: ${path}` }, { status: 404 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = `/${params.path.join("/")}`;
  const body = await request.json().catch(() => ({}));

  // Check action endpoints first
  if (actionMap[path]?.POST) {
    return handleMcpCall(actionMap[path].POST, body);
  }

  // Send message endpoint
  if (path === "/send") {
    return handleMcpCall("send_message", body);
  }

  // Exact path matches (e.g., /jobs -> add_job)
  if (methodMap[path]?.POST) {
    return handleMcpCall(methodMap[path].POST, body);
  }

  return NextResponse.json({ error: `Unknown path: ${path}` }, { status: 404 });
}
