import { describe, it, expect } from "bun:test";

// Import internal functions from the voice module
// We test the pure helper functions used by the voice channel

// Inline the helper functions for testing since they're not exported
function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_~#]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/>\s+/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function chunkText(text: string): string[] {
  const MAX_RESPONSE_LENGTH = 1500;
  if (text.length <= MAX_RESPONSE_LENGTH) return [text];
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?\n]+[.!?\n]?/g) || [text];
  let current = "";
  for (const sentence of sentences) {
    if ((current + sentence).length > MAX_RESPONSE_LENGTH && current.length > 0) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

describe("stripMarkdown", () => {
  it("removes code blocks", () => {
    expect(stripMarkdown("text ```code``` more")).toBe("text  more");
  });

  it("removes inline code", () => {
    expect(stripMarkdown("use `fn()` to start")).toBe("use fn() to start");
  });

  it("removes bold/italic/underline/strikethrough markers", () => {
    expect(stripMarkdown("*bold* _italic_ ~strike~")).toBe("bold italic strike");
  });

  it("removes markdown links", () => {
    expect(stripMarkdown("[click here](https://example.com)")).toBe("click here");
  });

  it("normalizes excessive newlines", () => {
    expect(stripMarkdown("a\n\n\n\n\nb")).toBe("a\n\nb");
  });

  it("handles empty input", () => {
    expect(stripMarkdown("")).toBe("");
  });
});

describe("chunkText", () => {
  it("returns single chunk for short text", () => {
    const text = "Hello, this is a short message.";
    expect(chunkText(text)).toEqual([text]);
  });

  it("splits long text at sentence boundaries", () => {
    const longText = "Longer sentence fragment. ".repeat(200);
    const chunks = chunkText(longText);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(1500);
    }
  });

  it("handles text without sentence breaks", () => {
    const text = "x".repeat(2000);
    const chunks = chunkText(text);
    expect(chunks.length).toBeGreaterThan(1);
    const total = chunks.reduce((s, c) => s + c.length, 0);
    expect(total).toBe(2000);
  });
});
