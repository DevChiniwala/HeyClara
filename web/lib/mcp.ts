const DAEMON_LOG_PATH = process.env.HOME || process.env.USERPROFILE || "";
const DAEMON_LOG_FILE = `${DAEMON_LOG_PATH}/.clara/tmp/daemon.log`;

export interface ToolDef {
  name: string;
  description: string;
}

export interface MCPResponse<T = unknown> {
  result?: T;
  error?: string;
}

export class MCPClient {
  private baseUrl: string | null = null;

  async discover(): Promise<string> {
    // 1. Check env var
    if (process.env.NEXT_PUBLIC_CLARA_MCP_URL) {
      this.baseUrl = process.env.NEXT_PUBLIC_CLARA_MCP_URL;
      return this.baseUrl;
    }

    // 2. Check NEXT_PUBLIC_CLARA_MCP_PORT
    if (process.env.NEXT_PUBLIC_CLARA_MCP_PORT) {
      this.baseUrl = `http://localhost:${process.env.NEXT_PUBLIC_CLARA_MCP_PORT}`;
      return this.baseUrl;
    }

    // 3. Try common ports
    const ports = [3456, 8080, 3001, 58109, 54245, 54679, 52472, 57979, 65314];
    for (const port of ports) {
      try {
        const resp = await fetch(`http://localhost:${port}/tools`, { signal: AbortSignal.timeout(1000) });
        if (resp.ok) {
          this.baseUrl = `http://localhost:${port}`;
          return this.baseUrl;
        }
      } catch { continue; }
    }

    throw new Error("Could not discover Clara daemon MCP endpoint. Set NEXT_PUBLIC_CLARA_MCP_URL or ensure the daemon is running.");
  }

  async ensureConnected(): Promise<string> {
    if (this.baseUrl) return this.baseUrl;
    return this.discover();
  }

  async listTools(): Promise<ToolDef[]> {
    const url = await this.ensureConnected();
    const resp = await fetch(`${url}/tools`);
    if (!resp.ok) throw new Error(`Failed to list tools: ${resp.statusText}`);
    return resp.json();
  }

  async call<T = unknown>(name: string, args: Record<string, unknown> = {}): Promise<T> {
    const url = await this.ensureConnected();
    const resp = await fetch(`${url}/call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, args }),
    });
    const data = await resp.json() as MCPResponse<T>;
    if (data.error) throw new Error(data.error);
    return data.result as T;
  }
}

export const mcp = new MCPClient();
