import { describe, it, expect } from "bun:test";
import { retry } from "./retry";

describe("retry", () => {
  it("returns result on first success", async () => {
    const result = await retry(() => Promise.resolve("ok"));
    expect(result).toBe("ok");
  });

  it("retries on failure and eventually succeeds", async () => {
    let attempts = 0;
    const fn = () => {
      attempts++;
      if (attempts < 3) return Promise.reject(new Error("fail"));
      return Promise.resolve("ok");
    };
    const result = await retry(fn, { maxAttempts: 5, baseDelayMs: 5 });
    expect(result).toBe("ok");
    expect(attempts).toBe(3);
  });

  it("throws after exhausting attempts", async () => {
    const fn = () => Promise.reject(new Error("always fail"));
    await expect(retry(fn, { maxAttempts: 2, baseDelayMs: 5 })).rejects.toThrow("always fail");
  });

  it("respects maxAttempts = 1 (no retry)", async () => {
    const fn = () => Promise.reject(new Error("no retry"));
    await expect(retry(fn, { maxAttempts: 1 })).rejects.toThrow("no retry");
  });

  it("uses custom base delay", async () => {
    let attempts = 0;
    const start = Date.now();
    const fn = () => {
      attempts++;
      return Promise.reject(new Error("fail"));
    };
    await expect(retry(fn, { maxAttempts: 3, baseDelayMs: 20, maxDelayMs: 20 })).rejects.toThrow();
    expect(Date.now() - start).toBeGreaterThanOrEqual(20);
  });
});
