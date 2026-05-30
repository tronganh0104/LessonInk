import { describe, expect, it } from "vitest";
import type { BoardPage } from "../../src/features/board/board.types";
import type { StrokeObject } from "../../src/features/canvas/canvas.types";
import { getPagePngExportBounds } from "../../src/features/documents/exporters/pngExporter";

function createPage(overrides: Partial<BoardPage> = {}): BoardPage {
  return {
    id: "page-1",
    title: "Page 1",
    index: 0,
    background: {
      type: "blank",
      color: "#ffffff"
    },
    objects: [],
    createdAt: "2026-05-28T00:00:00.000Z",
    updatedAt: "2026-05-28T00:00:00.000Z",
    ...overrides
  };
}

function createStroke(points: StrokeObject["points"], width = 10): StrokeObject {
  return {
    id: "stroke-1",
    pageId: "page-1",
    kind: "stroke",
    type: "stroke",
    tool: "pen",
    points,
    color: "#111827",
    opacity: 1,
    width,
    x: 0,
    y: 0,
    rotation: 0,
    locked: false,
    createdAt: "2026-05-28T00:00:00.000Z",
    updatedAt: "2026-05-28T00:00:00.000Z"
  };
}

describe("getPagePngExportBounds", () => {
  it("keeps the visible page area for blank pages", () => {
    expect(getPagePngExportBounds(createPage(), 960, 680)).toEqual({
      x: 0,
      y: 0,
      width: 960,
      height: 680
    });
  });

  it("expands to include an imported image that extends beyond the viewport", () => {
    const page = createPage({
      document: {
        id: "image-1",
        pageId: "page-1",
        kind: "image",
        sourceType: "embedded",
        source: "data:image/png;base64,aW1hZ2U=",
        mimeType: "image/png",
        x: 40,
        y: 20,
        width: 1200,
        height: 900,
        rotation: 0,
        createdAt: "2026-05-28T00:00:00.000Z",
        updatedAt: "2026-05-28T00:00:00.000Z"
      }
    });

    expect(getPagePngExportBounds(page, 960, 680)).toEqual({
      x: 0,
      y: 0,
      width: 1240,
      height: 920
    });
  });

  it("expands to include strokes drawn outside the original viewport", () => {
    const page = createPage({
      objects: [createStroke([{ x: -50, y: 40 }, { x: 1100, y: 760 }], 20)]
    });

    expect(getPagePngExportBounds(page, 960, 680)).toEqual({
      x: -60,
      y: 0,
      width: 1170,
      height: 770
    });
  });

  it("expands to include text annotations", () => {
    const page = createPage({
      objects: [
        {
          id: "text-1",
          pageId: "page-1",
          kind: "text",
          text: "Answer",
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: 24,
          color: "#111827",
          width: 220,
          height: 40,
          x: 980,
          y: 700,
          rotation: 0,
          locked: false,
          createdAt: "2026-05-28T00:00:00.000Z",
          updatedAt: "2026-05-28T00:00:00.000Z"
        }
      ]
    });

    expect(getPagePngExportBounds(page, 960, 680)).toEqual({
      x: 0,
      y: 0,
      width: 1200,
      height: 740
    });
  });
});
