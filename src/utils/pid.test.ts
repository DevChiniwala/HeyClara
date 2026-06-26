import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { existsSync, mkdirSync, unlinkSync } from "fs";
import { dirname } from "path";
import { getPaths } from "./paths";

describe("pid file operations", () => {
  const pidFile = getPaths().pidFile;

  beforeEach(() => {
    mkdirSync(dirname(pidFile), { recursive: true });
    if (existsSync(pidFile)) unlinkSync(pidFile);
  });

  afterEach(() => {
    if (existsSync(pidFile)) unlinkSync(pidFile);
  });

  it("readPid returns null when no pid file", async () => {
    const { readPid } = await import("./pid");
    expect(readPid()).toBeNull();
  });

  it("writePid and readPid round-trip", async () => {
    const { writePid, readPid } = await import("./pid");
    writePid(12345);
    expect(readPid()).toBe(12345);
  });

  it("removePid deletes the pid file", async () => {
    const { writePid, removePid, readPid } = await import("./pid");
    writePid(9999);
    expect(readPid()).toBe(9999);
    removePid();
    expect(readPid()).toBeNull();
  });
});
