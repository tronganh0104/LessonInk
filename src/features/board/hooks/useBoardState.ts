import { useMemo, useState } from "react";
import type { CanvasObject } from "../../canvas/canvas.types";
import type { BoardPageDocument } from "../board.types";
import { addPage, createBlankBoard, replaceBoardPages, setActivePage, setPageDocument, setPageObjects } from "../board.store";
import type { BoardPage } from "../board.types";

export function useBoardState() {
  const [board, setBoard] = useState(() => createBlankBoard("Live class board"));
  const activePage = useMemo(
    () => board.pages.find((page) => page.id === board.activePageId) ?? board.pages[0],
    [board]
  );

  return {
    board,
    activePage,
    addPage: () => setBoard((current) => addPage(current)),
    replaceBoard: setBoard,
    replacePages: (pages: BoardPage[]) => setBoard((current) => replaceBoardPages(current, pages)),
    setActivePage: (pageId: string) => setBoard((current) => setActivePage(current, pageId)),
    setPageDocument: (pageId: string, document: BoardPageDocument) =>
      setBoard((current) => setPageDocument(current, pageId, document)),
    setPageObjects: (pageId: string, objects: CanvasObject[]) =>
      setBoard((current) => setPageObjects(current, pageId, objects))
  };
}
