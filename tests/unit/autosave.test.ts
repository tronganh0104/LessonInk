import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Board, ImagePageDocument } from "../../src/features/board/board.types";
import type { TextObject } from "../../src/features/canvas/canvas.types";
import { clearAutosaveSnapshot, readAutosaveSnapshot, writeAutosaveSnapshot } from "../../src/storage/autosave";

function createStorage(shouldThrowOnWrite = false) {
  const store = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    setItem: vi.fn((key: string, value: string) => {
      if (shouldThrowOnWrite) {
        throw new Error("Quota exceeded");
      }

      store.set(key, value);
    })
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
    x: 16,
    y: 20,
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
    text: "Check step 2",
    fontFamily: "Inter, Arial, sans-serif",
    fontSize: 24,
    color: "#111827",
    width: 220,
    height: 40,
    x: 80,
    y: 96,
    rotation: 0,
    locked: false,
    createdAt: "2026-05-28T00:00:00.000Z",
    updatedAt: "2026-05-28T00:00:00.000Z"
  };
}

function createBoard(): Board {
  const firstPageId = "page-1";
  const secondPageId = "page-2";

  return {
    id: "board-1",
    title: "Worksheet lesson",
    activePageId: secondPageId,
    pages: [
      {
        id: firstPageId,
        title: "Page 1",
        index: 0,
        background: { type: "image", color: "#ffffff" },
        document: createImageDocument(firstPageId),
        objects: [createTextObject(firstPageId)],
        createdAt: "2026-05-28T00:00:00.000Z",
        updatedAt: "2026-05-28T00:00:00.000Z"
      },
      {
        id: secondPageId,
        title: "Page 2",
        index: 1,
        background: { type: "blank", color: "#ffffff" },
        objects: [],
        createdAt: "2026-05-28T00:00:00.000Z",
        updatedAt: "2026-05-28T00:00:00.000Z"
      }
    ],
    createdAt: "2026-05-28T00:00:00.000Z",
    updatedAt: "2026-05-28T00:00:00.000Z"
  };
}

describe("autosave storage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("round-trips pages, imported documents, text annotations, and metadata", () => {
    const localStorage = createStorage();
    vi.stubGlobal("window", { localStorage });
    const board = createBoard();

    expect(writeAutosaveSnapshot(board, {
      id: "project-1",
      title: "Worksheet lesson",
      createdAt: "2026-05-28T00:00:00.000Z",
      updatedAt: "2026-05-28T00:00:00.000Z"
    })).toBe(true);

    const snapshot = readAutosaveSnapshot();

    expect(snapshot?.project.title).toBe("Worksheet lesson");
    expect(snapshot?.board.activePageId).toBe("page-2");
    expect(snapshot?.board.pages[0].document).toEqual(board.pages[0].document);
    expect(snapshot?.board.pages[0].objects).toEqual(board.pages[0].objects);
  });

  it("clears corrupt snapshots instead of blocking app startup", () => {
    const localStorage = createStorage();
    vi.stubGlobal("window", { localStorage });
    localStorage.setItem("mushroomlearning.autosave.currentProject", "{broken-json");

    expect(readAutosaveSnapshot()).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalledWith("mushroomlearning.autosave.currentProject");
  });

  it("reports storage write failures without throwing", () => {
    const localStorage = createStorage(true);
    vi.stubGlobal("window", { localStorage });

    expect(writeAutosaveSnapshot(createBoard(), { title: "Large lesson" })).toBe(false);
  });

  it("clears snapshots as a best-effort operation", () => {
    const localStorage = createStorage();
    vi.stubGlobal("window", { localStorage });

    clearAutosaveSnapshot();

    expect(localStorage.removeItem).toHaveBeenCalledWith("mushroomlearning.autosave.currentProject");
  });
});
