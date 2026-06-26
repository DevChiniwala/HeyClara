import { describe, it, expect } from "bun:test";
import { errMsg } from "./errors";

describe("errMsg", () => {
  it("extracts message from Error", () => {
    expect(errMsg(new Error("something broke"))).toBe("something broke");
  });

  it("returns string directly", () => {
    expect(errMsg("plain string")).toBe("plain string");
  });

  it("stringifies other values", () => {
    expect(errMsg(42)).toBe("42");
    expect(errMsg(null)).toBe("null");
    expect(errMsg({ key: "val" })).toBe("[object Object]");
  });
});
