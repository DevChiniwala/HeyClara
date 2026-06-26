import { describe, it, expect, mock } from "bun:test";

// We test the pure logic: computeNextRun for "once" and "interval" types
// For cron, we delegate to cron-parser which has its own tests

const module = await import("./schedule");
const { computeInitialNextRun, computeNextRun } = module;

describe("computeInitialNextRun", () => {
  it("returns a date for 'once' type", () => {
    const future = new Date(Date.now() + 3600_000);
    const result = computeInitialNextRun("once", future.toISOString(), "UTC");
    expect(result).toBeInstanceOf(Date);
    expect(result!.getTime()).toBeCloseTo(future.getTime(), -2);
  });

  it("returns null for invalid 'once' date", () => {
    expect(computeInitialNextRun("once", "not-a-date", "UTC")).toBeNull();
  });

  it("returns null for 'cron' with invalid expression", () => {
    expect(computeInitialNextRun("cron", "invalid", "UTC")).toBeNull();
  });

  it("returns a future date for 'interval' type", () => {
    const before = Date.now();
    const result = computeInitialNextRun("interval", "5m", "UTC");
    expect(result).toBeInstanceOf(Date);
    expect(result!.getTime()).toBeGreaterThanOrEqual(before + 290_000);
  });

  it("returns null for 'interval' with invalid duration", () => {
    expect(computeInitialNextRun("interval", "bad", "UTC")).toBeNull();
  });

  it("returns null for unknown type", () => {
    expect(computeInitialNextRun("unknown" as never, "anything", "UTC")).toBeNull();
  });
});

describe("computeNextRun", () => {
  it("returns null for 'once' type (already ran)", () => {
    expect(computeNextRun("once", "anything", "UTC", new Date())).toBeNull();
  });

  it("returns next date for 'interval' type", () => {
    const from = new Date("2025-01-01T00:00:00Z");
    const result = computeNextRun("interval", "10m", "UTC", from);
    expect(result!.toISOString()).toBe("2025-01-01T00:10:00.000Z");
  });

  it("returns null for 'interval' with invalid duration", () => {
    expect(computeNextRun("interval", "bad", "UTC", new Date())).toBeNull();
  });

  it("returns null for 'cron' with invalid expression", () => {
    expect(computeNextRun("cron", "invalid", "UTC", new Date())).toBeNull();
  });

  it("returns null for unknown type", () => {
    expect(computeNextRun("unknown" as never, "anything", "UTC", new Date())).toBeNull();
  });
});
