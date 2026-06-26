import { describe, it, expect } from "bun:test";
import { parseDuration, formatDuration } from "./duration";

describe("parseDuration", () => {
  it("parses seconds", () => {
    expect(parseDuration("30s")).toBe(30_000);
    expect(parseDuration("5 sec")).toBe(5_000);
    expect(parseDuration("0s")).toBe(0);
  });

  it("parses minutes", () => {
    expect(parseDuration("5m")).toBe(300_000);
    expect(parseDuration("10 min")).toBe(600_000);
  });

  it("parses hours", () => {
    expect(parseDuration("2h")).toBe(7_200_000);
    expect(parseDuration("1 hr")).toBe(3_600_000);
  });

  it("parses days", () => {
    expect(parseDuration("1d")).toBe(86_400_000);
    expect(parseDuration("7 day")).toBe(604_800_000);
  });

  it("parses weeks", () => {
    expect(parseDuration("1w")).toBe(604_800_000);
    expect(parseDuration("2 wk")).toBe(1_209_600_000);
    expect(parseDuration("1 week")).toBe(604_800_000);
  });

  it("throws on invalid input", () => {
    expect(() => parseDuration("")).toThrow();
    expect(() => parseDuration("abc")).toThrow();
    expect(() => parseDuration("5")).toThrow();
    expect(() => parseDuration("-1m")).toThrow();
  });

  it("is case insensitive", () => {
    expect(parseDuration("5M")).toBe(300_000);
    expect(parseDuration("2H")).toBe(7_200_000);
    expect(parseDuration("1D")).toBe(86_400_000);
  });

  it("handles whitespace", () => {
    expect(parseDuration("  10m  ")).toBe(600_000);
    expect(parseDuration("1 h")).toBe(3_600_000);
  });
});

describe("formatDuration", () => {
  it("formats milliseconds", () => {
    expect(formatDuration(500)).toBe("500ms");
  });

  it("formats seconds", () => {
    expect(formatDuration(1_000)).toBe("1s");
    expect(formatDuration(30_000)).toBe("30s");
  });

  it("formats minutes", () => {
    expect(formatDuration(60_000)).toBe("1m");
    expect(formatDuration(120_000)).toBe("2m");
  });

  it("formats hours", () => {
    expect(formatDuration(3_600_000)).toBe("1h");
    expect(formatDuration(7_200_000)).toBe("2h");
  });

  it("formats days", () => {
    expect(formatDuration(86_400_000)).toBe("1d");
    expect(formatDuration(604_800_000)).toBe("7d");
  });
});
