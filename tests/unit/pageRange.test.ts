import { describe, expect, it } from "vitest";
import { parsePageRange } from "../../src/features/documents/importers/pageRange";

describe("parsePageRange", () => {
  it("parses a single page", () => {
    expect(parsePageRange("1", 20)).toEqual({ ok: true, pages: [1] });
  });

  it("parses a page range", () => {
    expect(parsePageRange("1-5", 20)).toEqual({ ok: true, pages: [1, 2, 3, 4, 5] });
  });

  it("parses comma-separated pages", () => {
    expect(parsePageRange("1,3,5", 20)).toEqual({ ok: true, pages: [1, 3, 5] });
  });

  it("parses mixed ranges and page numbers", () => {
    expect(parsePageRange("1-3,7,10-12", 20)).toEqual({ ok: true, pages: [1, 2, 3, 7, 10, 11, 12] });
  });

  it("deduplicates pages and keeps ascending order", () => {
    expect(parsePageRange("2,1,1", 20)).toEqual({ ok: true, pages: [1, 2] });
  });

  it("rejects pages above the total page count", () => {
    expect(parsePageRange("999", 20)).toMatchObject({ ok: false });
  });

  it("rejects zero", () => {
    expect(parsePageRange("0", 20)).toMatchObject({ ok: false });
  });

  it("rejects negative page numbers", () => {
    expect(parsePageRange("-1", 20)).toMatchObject({ ok: false });
  });

  it("rejects reversed ranges", () => {
    expect(parsePageRange("5-3", 20)).toMatchObject({ ok: false });
  });

  it("rejects invalid strings", () => {
    expect(parsePageRange("abc", 20)).toMatchObject({ ok: false });
  });

  it("rejects empty input", () => {
    expect(parsePageRange("", 20)).toMatchObject({ ok: false });
  });

  it("allows spaces around separators", () => {
    expect(parsePageRange("1 - 3, 5", 20)).toEqual({ ok: true, pages: [1, 2, 3, 5] });
  });

  it("accepts the final page boundary", () => {
    expect(parsePageRange("20", 20)).toEqual({ ok: true, pages: [20] });
  });

  it("rejects empty comma segments", () => {
    expect(parsePageRange("1,,3", 20)).toMatchObject({ ok: false });
  });
});
