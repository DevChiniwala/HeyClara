import { addLogBroadcaster } from "../agent/mcp-endpoint";

let broadcaster: ((line: string) => void) | null = null;

export function initLogBroadcaster(): void {
  if (broadcaster) return;
  broadcaster = (line: string) => {
    addLogBroadcaster(line);
  };
}

export function getLogBroadcaster(): ((line: string) => void) | null {
  return broadcaster;
}