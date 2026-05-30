import { describe, expect, it } from "vitest";
import { getDefaultPdfExportName } from "../../src/features/documents/exporters/pdfExporter";

describe("getDefaultPdfExportName", () => {
  it("uses the MushroomLearning lesson date format", () => {
    expect(getDefaultPdfExportName(new Date("2026-05-28T10:00:00.000Z"))).toBe(
      "mushroomlearning-lesson-2026-05-28.pdf"
    );
  });
});
