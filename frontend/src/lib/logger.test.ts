import { describe, it, expect, vi } from "vitest";
import { logger } from "./logger";

describe("logger utility", () => {
  it("calls console.warn on warn", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logger.warn("warning message");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("calls console.error on error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("error message");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
