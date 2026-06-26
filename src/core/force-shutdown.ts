const forceShutdownPids = new Set<number>();

export function isForceShutdownRequested(): boolean {
  return forceShutdownPids.size > 0;
}

export function requestForceShutdown(pids: number[]): void {
  for (const pid of pids) {
    forceShutdownPids.add(pid);
  }
}

export function consumeForceShutdownRequest(myPid: number): boolean {
  return forceShutdownPids.has(myPid);
}

export function clearForceShutdownRequest(): void {
  forceShutdownPids.clear();
}
