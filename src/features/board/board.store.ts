import type { CanvasObject } from "../canvas/canvas.types";
import type { Board, BoardPage, BoardPageDocument } from "./board.types";

const now = () => new Date().toISOString();

export function createBlankBoard(title = "Untitled lesson"): Board {
  const firstPage = createBlankPage(0);

  return {
    id: crypto.randomUUID(),
    title,
    pages: [firstPage],
    activePageId: firstPage.id,
    createdAt: now(),
    updatedAt: now()
  };
}

export function createBlankPage(index: number): BoardPage {
  return {
    id: crypto.randomUUID(),
    title: `Page ${index + 1}`,
    index,
    background: {
      type: "blank",
      color: "#ffffff"
    },
    objects: [],
    createdAt: now(),
    updatedAt: now()
  };
}

export function addPage(board: Board): Board {
  const nextPage = createBlankPage(board.pages.length);

  return {
    ...board,
    pages: [...board.pages, nextPage],
    activePageId: nextPage.id,
    updatedAt: now()
  };
}

export function setActivePage(board: Board, pageId: string): Board {
  return {
    ...board,
    activePageId: pageId,
    updatedAt: now()
  };
}

export function getAdjacentPageId(board: Board, direction: "previous" | "next"): string | undefined {
  const activePageIndex = board.pages.findIndex((page) => page.id === board.activePageId);

  if (activePageIndex < 0) {
    return undefined;
  }

  const nextIndex = direction === "previous" ? activePageIndex - 1 : activePageIndex + 1;

  return board.pages[nextIndex]?.id;
}

export function setPageObjects(board: Board, pageId: string, objects: CanvasObject[]): Board {
  return {
    ...board,
    pages: board.pages.map((page) =>
      page.id === pageId
        ? {
            ...page,
            objects,
            updatedAt: now()
          }
        : page
    ),
    updatedAt: now()
  };
}

export function setPageDocument(board: Board, pageId: string, document: BoardPageDocument): Board {
  return {
    ...board,
    pages: board.pages.map((page) =>
      page.id === pageId
        ? {
            ...page,
            document: {
              ...document,
              pageId
            },
            updatedAt: now()
          }
        : page
    ),
    updatedAt: now()
  };
}
