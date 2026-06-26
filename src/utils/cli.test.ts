import { describe, it, expect } from "bun:test";

describe("cli utilities", () => {
  it("module exports expected symbols", async () => {
    const mod = await import("./cli");
    expect(mod.pass).toBeFunction();
    expect(mod.fail).toBeFunction();
    expect(mod.warn).toBeFunction();
    expect(typeof mod.ICON_PASS).toBe("string");
    expect(typeof mod.ICON_FAIL).toBe("string");
  });
});
