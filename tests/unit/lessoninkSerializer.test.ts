import { describe, expect, it } from "vitest";
import type { Board, ImagePageDocument } from "../../src/features/board/board.types";
import type { Point, StrokeObject, TextObject } from "../../src/features/canvas/canvas.types";
import {
  createLessonInkFile,
  deserializeLessonInkFile,
  sanitizeLessonInkFileName,
  serializeLessonInkFile
} from "../../src/features/documents/lessoninkSerializer";

function createStroke(id: string, pageId: string, points: Point[] = [{ x: 0, y: 0 }]): StrokeObject {
  return {
    id,
    pageId,
    kind: "stroke",
    type: "stroke",
    tool: "pen",
    points,
    color: "#111827",
    opacity: 1,
    width: 4,
    x: 0,
    y: 0,
    rotation: 0,
    locked: false,
    createdAt: "2026-05-28T00:00:00.000Z",
    updatedAt: "2026-05-28T00:00:00.000Z"
  };
}

function createBoard(overrides: Partial<Board> = {}): Board {
  const pageId = "page-1";

  return {
    id: "board-1",
    title: "Algebra lesson",
    activePageId: pageId,
    pages: [
      {
        id: pageId,
        title: "Page 1",
        index: 0,
        background: {
          type: "blank",
          color: "#ffffff"
        },
        objects: [],
        createdAt: "2026-05-28T00:00:00.000Z",
        updatedAt: "2026-05-28T00:00:00.000Z"
      }
    ],
    createdAt: "2026-05-28T00:00:00.000Z",
    updatedAt: "2026-05-28T00:00:00.000Z",
    ...overrides
  };
}

function createImageDocument(pageId: string): ImagePageDocument {
  return {
    id: "image-1",
    pageId,
    kind: "image",
    sourceType: "embedded",
    source: "data:image/png;base64,aW1hZ2U=",
    mimeType: "image/png",
    altText: "worksheet.png",
    x: 24,
    y: 32,
    width: 640,
    height: 480,
    rotation: 0,
    createdAt: "2026-05-28T00:00:00.000Z",
    updatedAt: "2026-05-28T00:00:00.000Z"
  };
}

function createTextObject(pageId: string): TextObject {
  return {
    id: "text-1",
    pageId,
    kind: "text",
    text: "Remember this step",
    fontFamily: "Inter, Arial, sans-serif",
    fontSize: 24,
    color: "#111827",
    width: 260,
    height: 34,
    x: 42,
    y: 64,
    rotation: 0,
    locked: false,
    createdAt: "2026-05-28T00:00:00.000Z",
    updatedAt: "2026-05-28T00:00:00.000Z"
  };
}

describe("createLessonInkFile", () => {
  it("serializes an empty board/project correctly", () => {
    const file = createLessonInkFile(createBoard(), {
      id: "project-1",
      title: "Algebra lesson",
      createdAt: "2026-05-28T00:00:00.000Z"
    });

    expect(file.schemaVersion).toBe(1);
    expect(file.app).toBe("MushroomLearning");
    expect(file.project).toMatchObject({
      id: "project-1",
      title: "Algebra lesson",
      createdAt: "2026-05-28T00:00:00.000Z"
    });
    expect(file.board.pages).toHaveLength(1);
    expect(file.board.pages[0].objects).toEqual([]);
  });

  it("serializes multiple pages", () => {
    const board = createBoard({
      activePageId: "page-2",
      pages: [
        createBoard().pages[0],
        {
          id: "page-2",
          title: "Page 2",
          index: 1,
          background: {
            type: "blank",
            color: "#ffffff"
          },
          objects: [],
          createdAt: "2026-05-28T00:00:00.000Z",
          updatedAt: "2026-05-28T00:00:00.000Z"
        }
      ]
    });

    const file = createLessonInkFile(board);

    expect(file.board.pages.map((page) => page.id)).toEqual(["page-1", "page-2"]);
    expect(file.board.activePageId).toBe("page-2");
  });

  it("serializes strokes with points, color, width, and pressure", () => {
    const stroke = createStroke("stroke-1", "page-1", [
      { x: 1, y: 2, inputType: "pen", pressure: 0.3 },
      { x: 5, y: 8, inputType: "pen", pressure: 0.7 }
    ]);
    const file = createLessonInkFile(
      createBoard({
        pages: [
          {
            ...createBoard().pages[0],
            objects: [stroke]
          }
        ]
      })
    );

    expect(file.board.pages[0].objects).toEqual([stroke]);
  });

  it("serializes an imported image document separately from strokes", () => {
    const imageDocument = createImageDocument("page-1");
    const stroke = createStroke("stroke-1", "page-1");
    const file = createLessonInkFile(
      createBoard({
        pages: [
          {
            ...createBoard().pages[0],
            document: imageDocument,
            objects: [stroke]
          }
        ]
      })
    );

    expect(file.board.pages[0].document).toEqual(imageDocument);
    expect(file.board.pages[0].objects).toEqual([stroke]);
  });
});

describe("deserializeLessonInkFile", () => {
  it("throws a user-friendly error for invalid JSON", () => {
    expect(() => deserializeLessonInkFile("{not-json")).toThrow("The selected file is not valid JSON.");
  });

  it("deserializes a valid .mushroomlearning object and restores activePageId", () => {
    const board = createBoard({ activePageId: "page-1" });
    const loadedProject = deserializeLessonInkFile(serializeLessonInkFile(board));

    expect(loadedProject.board.id).toBe(board.id);
    expect(loadedProject.board.activePageId).toBe("page-1");
    expect(loadedProject.project.title).toBe(board.title);
  });

  it("restores stroke data correctly", () => {
    const stroke = createStroke("stroke-1", "page-1", [
      { x: 1, y: 2, inputType: "pen", pressure: 0.25 },
      { x: 3, y: 4, inputType: "pen", pressure: 0.5 }
    ]);
    const board = createBoard({
      pages: [
        {
          ...createBoard().pages[0],
          objects: [stroke]
        }
      ]
    });

    const loadedProject = deserializeLessonInkFile(serializeLessonInkFile(board));

    expect(loadedProject.board.pages[0].objects).toEqual([stroke]);
  });

  it("restores image documents with strokes on top", () => {
    const imageDocument = createImageDocument("page-1");
    const stroke = createStroke("stroke-1", "page-1");
    const board = createBoard({
      pages: [
        {
          ...createBoard().pages[0],
          document: imageDocument,
          objects: [stroke]
        }
      ]
    });

    const loadedProject = deserializeLessonInkFile(serializeLessonInkFile(board));

    expect(loadedProject.board.pages[0].document).toEqual(imageDocument);
    expect(loadedProject.board.pages[0].objects).toEqual([stroke]);
  });

  it("round-trips text annotations", () => {
    const text = createTextObject("page-1");
    const board = createBoard({
      pages: [
        {
          ...createBoard().pages[0],
          objects: [text]
        }
      ]
    });

    const loadedProject = deserializeLessonInkFile(serializeLessonInkFile(board));

    expect(loadedProject.board.pages[0].objects).toEqual([text]);
  });

  it("preserves moved text annotation positions", () => {
    const text = {
      ...createTextObject("page-1"),
      x: 320,
      y: 180,
      updatedAt: "2026-05-28T01:00:00.000Z"
    };
    const board = createBoard({
      pages: [
        {
          ...createBoard().pages[0],
          objects: [text]
        }
      ]
    });

    const loadedProject = deserializeLessonInkFile(serializeLessonInkFile(board));

    expect(loadedProject.board.pages[0].objects[0]).toMatchObject({
      id: "text-1",
      kind: "text",
      x: 320,
      y: 180
    });
  });

  it("handles missing optional metadata fields safely", () => {
    const fileWithoutOptionalMetadata = {
      schemaVersion: 1,
      app: "MushroomLearning",
      board: {
        pages: [
          {
            objects: []
          }
        ]
      }
    };

    const loadedProject = deserializeLessonInkFile(JSON.stringify(fileWithoutOptionalMetadata));

    expect(loadedProject.board.id).toBe("board-1");
    expect(loadedProject.board.activePageId).toBe("page-1");
    expect(loadedProject.project.title).toBe("Untitled Board");
  });

  it("round-trips a multi-page board with strokes", () => {
    const firstStroke = createStroke("stroke-1", "page-1", [
      { x: 0, y: 0, pressure: 0.1 },
      { x: 10, y: 10, pressure: 0.2 }
    ]);
    const secondStroke = createStroke("stroke-2", "page-2", [
      { x: 20, y: 20, pressure: 0.5 },
      { x: 30, y: 25, pressure: 0.8 }
    ]);
    const board = createBoard({
      activePageId: "page-2",
      pages: [
        {
          ...createBoard().pages[0],
          objects: [firstStroke]
        },
        {
          id: "page-2",
          title: "Page 2",
          index: 1,
          background: {
            type: "blank",
            color: "#ffffff"
          },
          objects: [secondStroke],
          createdAt: "2026-05-28T00:00:00.000Z",
          updatedAt: "2026-05-28T00:00:00.000Z"
        }
      ]
    });

    const loadedProject = deserializeLessonInkFile(serializeLessonInkFile(board));

    expect(loadedProject.board.pages).toHaveLength(2);
    expect(loadedProject.board.activePageId).toBe("page-2");
    expect(loadedProject.board.pages[0].objects).toEqual([firstStroke]);
    expect(loadedProject.board.pages[1].objects).toEqual([secondStroke]);
  });

  it("round-trips a larger multi-page teaching session without dropping annotations", () => {
    const pages = Array.from({ length: 6 }, (_, pageIndex) => {
      const pageId = `page-${pageIndex + 1}`;

      return {
        id: pageId,
        title: `Page ${pageIndex + 1}`,
        index: pageIndex,
        background: {
          type: "blank" as const,
          color: "#ffffff"
        },
        objects: Array.from({ length: 100 }, (_, strokeIndex) =>
          createStroke(`stroke-${pageIndex + 1}-${strokeIndex + 1}`, pageId, [
            { x: strokeIndex, y: pageIndex * 20 },
            { x: strokeIndex + 10, y: pageIndex * 20 + 10 }
          ])
        ),
        createdAt: "2026-05-28T00:00:00.000Z",
        updatedAt: "2026-05-28T00:00:00.000Z"
      };
    });
    const board = createBoard({
      activePageId: "page-6",
      pages
    });

    const loadedProject = deserializeLessonInkFile(serializeLessonInkFile(board));

    expect(loadedProject.board.pages).toHaveLength(6);
    expect(loadedProject.board.activePageId).toBe("page-6");
    expect(loadedProject.board.pages.flatMap((page) => page.objects)).toHaveLength(600);
    expect(loadedProject.board.pages[5].objects[99]).toMatchObject({
      id: "stroke-6-100",
      pageId: "page-6"
    });
  });
});

describe("sanitizeLessonInkFileName", () => {
  it("creates a safe .mushroomlearning filename", () => {
    expect(sanitizeLessonInkFileName(" IELTS Writing Task 1 ")).toBe("ielts-writing-task-1.mushroomlearning");
  });
});
