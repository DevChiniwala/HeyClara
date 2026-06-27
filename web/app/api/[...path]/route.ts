import { NextRequest, NextResponse } from "next/server";
import { mcp } from "@/lib/mcp";

const methodMap: Record<string, Record<string, string>> = {
  "/jobs": { GET: "list_jobs", POST: "create_job" },
  "/channels": { GET: "list_channels", POST: "create_channel" },
  "/personas": { GET: "list_personas", POST: "create_persona" },
  "/sessions": { GET: "list_sessions" },
  "/backups": { GET: "list_backups", POST: "create_backup" },
  "/engines": { GET: "list_engines" },
  "/messages": { GET: "list_messages" },
};

const toolPrefixMap: Record<string, string> = {
  "/jobs/": "get_job",
  "/channels/": "get_channel",
  "/personas/": "get_persona",
  "/sessions/": "get_session",
  "/backups/": "get_backup",
  "/messages/": "get_messages",
};

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = `/${params.path.join("/")}`;

  // Check exact path matches
  if (methodMap[path]?.GET) {
    const result = await mcp.call(methodMap[path].GET, {});
    return NextResponse.json(result);
  }

  // Check prefix matches (e.g., /jobs/foo -> get_job)
  for (const [prefix, tool] of Object.entries(toolPrefixMap)) {
    if (path.startsWith(prefix)) {
      const id = path.slice(prefix.length);
      const result = await mcp.call(tool, { id });
      return NextResponse.json(result);
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

  if (methodMap[path]?.POST) {
    const result = await mcp.call(methodMap[path].POST, body);
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: `Unknown path: ${path}` }, { status: 404 });
}
