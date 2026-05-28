import { describe, expect, it } from "vitest";
import type { Board } from "../../src/features/board/board.types";
import type { StrokeObject } from "../../src/features/canvas/canvas.types";
import {
  getBoardPageClassName,
  initialPresenterState,
  setPresenterModeState,
  togglePresenterState
} from "../../src/features/presenter/presenter.store";

function createStroke(pageId: string): StrokeObject {
  return {
    id: "stroke-1",
    pageId,
    kind: "stroke",
    type: "stroke",
    tool: "pen",
    points: [
      { x: 4, y: 6 },
      { x: 12, y: 18 }
    ],
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

function createBoard(): Board {
  const firstPageId = "page-1";
  const secondPageId = "page-2";

  return {
    id: "board-1",
    title: "Live class board",
    activePageId: secondPageId,
    pages: [
      {
        id: firstPageId,
        title: "Page 1",
        index: 0,
        background: {
          type: "blank",
          color: "#ffffff"
        },
        objects: [createStroke(firstPageId)],
        createdAt: "2026-05-28T00:00:00.000Z",
        updatedAt: "2026-05-28T00:00:00.000Z"
      },
      {
        id: secondPageId,
        title: "Page 2",
        index: 1,
        background: {
          type: "blank",
          color: "#ffffff"
        },
        objects: [createStroke(secondPageId)],
        createdAt: "2026-05-28T00:00:00.000Z",
        updatedAt: "2026-05-28T00:00:00.000Z"
      }
    ],
    createdAt: "2026-05-28T00:00:00.000Z",
    updatedAt: "2026-05-28T00:00:00.000Z"
  };
}

describe("presenter store", () => {
  it("toggles presenter mode on and off", () => {
    const enabled = togglePresenterState(initialPresenterState);
    const disabled = togglePresenterState(enabled);

    expect(enabled.isPresenterMode).toBe(true);
    expect(disabled.isPresenterMode).toBe(false);
  });

  it("applies the presenter layout class only while presenting", () => {
    expect(getBoardPageClassName(false)).toBe("board-page");
    expect(getBoardPageClassName(true)).toBe("board-page presenter-active");
  });

  it("does not mutate board pages, strokes, or active page when presenter state changes", () => {
    const board = createBoard();
    const boardSnapshot = JSON.parse(JSON.stringify(board)) as Board;

    const presenterState = setPresenterModeState(initialPresenterState, true);

    expect(presenterState.isPresenterMode).toBe(true);
    expect(board.activePageId).toBe(boardSnapshot.activePageId);
    expect(board.pages).toEqual(boardSnapshot.pages);
  });
});
