import { describe, it, expect } from "bun:test";

describe("job workspace utilities", () => {
  it("module loads without error", async () => {
    const mod = await import("./job-workspace");
    expect(mod).toBeDefined();
  });
});
