/**
 * `clara web` — starts the daemon (if not running) and launches the Next.js web UI.
 */
import { isRunning, startDaemon } from "../core/daemon";
import { log } from "../utils/log";

const COMMON_PORTS = [58109, 3456, 8080, 3001, 54245, 54679, 52472, 57979, 65314];
const WEB_DIR = new URL("../../web", import.meta.url).pathname;

async function discoverMcpPort(): Promise<number> {
  // 1. Check env var
  if (process.env.CLARA_MCP_PORT) {
    const port = parseInt(process.env.CLARA_MCP_PORT, 10);
    const resp = await fetch(`http://localhost:${port}/tools`, { signal: AbortSignal.timeout(1000) }).catch(() => null);
    if (resp?.ok) return port;
  }

  // 2. Scan common ports
  for (const port of COMMON_PORTS) {
    const resp = await fetch(`http://localhost:${port}/tools`, { signal: AbortSignal.timeout(800) }).catch(() => null);
    if (resp?.ok) return port;
  }

  throw new Error("Could not find the Clara daemon MCP endpoint. Ensure the daemon is running (clara start).");
}

async function waitForPort(port: number, timeoutMs = 30_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const resp = await fetch(`http://localhost:${port}/tools`, { signal: AbortSignal.timeout(1000) }).catch(() => null);
    if (resp?.ok) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timed out waiting for MCP endpoint on port ${port}`);
}

export async function webStart(): Promise<void> {
  const port = parseInt(process.env.CLARA_MCP_PORT || "58109", 10);
  const alreadyRunning = isRunning();

  if (!alreadyRunning) {
    log.info({ port }, "daemon not running, starting with MCP port...");
    process.env.CLARA_MCP_PORT = String(port);
    const pid = startDaemon();
    log.info({ pid, port }, "daemon started in background, waiting for MCP endpoint...");
    await waitForPort(port);
  }

  // If already running, discover the actual port
  const actualPort = alreadyRunning ? await discoverMcpPort() : port;
  const endpoint = `http://localhost:${actualPort}`;

  log.info({ endpoint }, "launching web UI");

  const env: Record<string, string> = {
    ...process.env as Record<string, string>,
    NEXT_PUBLIC_CLARA_MCP_URL: endpoint,
  };

  const proc = Bun.spawn(["bun", "run", "dev"], {
    cwd: WEB_DIR,
    stdio: ["inherit", "inherit", "inherit"],
    env,
  });

  const exitCode = await proc.exited;
  process.exit(exitCode ?? 0);
}
