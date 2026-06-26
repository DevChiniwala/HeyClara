import { describe, it, expect } from "bun:test";
import { truncate, pluralize, indent } from "./format";

describe("truncate", () => {
  it("returns string unchanged if within limit", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates with ellipsis when over limit", () => {
    expect(truncate("hello world", 5)).toBe("hello...");
  });

  it("handles exact length", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });

  it("handles empty string", () => {
    expect(truncate("", 5)).toBe("");
  });
});

describe("pluralize", () => {
  it("returns singular for count 1", () => {
    expect(pluralize(1, "item")).toBe("item");
    expect(pluralize(1, "box", "boxes")).toBe("box");
  });

  it("returns plural for count 0", () => {
    expect(pluralize(0, "item")).toBe("items");
  });

  it("returns plural for count > 1", () => {
    expect(pluralize(3, "item")).toBe("items");
  });

  it("uses custom plural when provided", () => {
    expect(pluralize(5, "box", "boxes")).toBe("boxes");
  });
});

describe("indent", () => {
  it("indents text by 2 spaces per level", () => {
    expect(indent("hello")).toBe("  hello");
    expect(indent("hello", 2)).toBe("    hello");
  });

  it("indents multiple lines", () => {
    const result = indent("line1\nline2");
    expect(result).toBe("  line1\n  line2");
  });

  it("preserves blank lines", () => {
    const result = indent("a\n\nb");
    expect(result).toBe("  a\n\n  b");
  });
});
