import { useMemo, useState } from "react";
import type { CanvasObject } from "../../canvas/canvas.types";
import type { BoardPageDocument } from "../board.types";
import { addPage, createBlankBoard, setActivePage, setPageDocument, setPageObjects } from "../board.store";

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
    setActivePage: (pageId: string) => setBoard((current) => setActivePage(current, pageId)),
    setPageDocument: (pageId: string, document: BoardPageDocument) =>
      setBoard((current) => setPageDocument(current, pageId, document)),
    setPageObjects: (pageId: string, objects: CanvasObject[]) =>
      setBoard((current) => setPageObjects(current, pageId, objects))
  };
}
