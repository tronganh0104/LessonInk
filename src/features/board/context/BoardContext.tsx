import React, { createContext, useContext, useMemo, useState } from "react";
import type { CanvasObject } from "../../canvas/canvas.types";
import type { Board, BoardPage, BoardPageDocument } from "../board.types";
import type { LessonInkFileProjectMetadata } from "../../documents/lessoninkFile.types";
import {
  addPage,
  createBlankBoard,
  replaceBoardPages,
  setActivePage,
  setPageDocument,
  setPageObjects
} from "../board.store";

interface BoardContextType {
  board: Board;
  activePage: BoardPage;
  project: LessonInkFileProjectMetadata;
  setProject: React.Dispatch<React.SetStateAction<LessonInkFileProjectMetadata>>;
  addPage: () => void;
  replaceBoard: (board: Board) => void;
  replacePages: (pages: BoardPage[]) => void;
  setActivePage: (pageId: string) => void;
  setPageDocument: (pageId: string, document: BoardPageDocument) => void;
  setPageObjects: (pageId: string, objects: CanvasObject[]) => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export function BoardProvider({ children }: { children: React.ReactNode }) {
  const [board, setBoard] = useState(() => createBlankBoard("Live class board"));
  
  const [project, setProject] = useState<LessonInkFileProjectMetadata>(() => ({
    id: board.id,
    title: board.title,
    createdAt: board.createdAt,
    updatedAt: board.updatedAt
  }));

  const activePage = useMemo(
    () => board.pages.find((page) => page.id === board.activePageId) ?? board.pages[0],
    [board]
  );

  const value = useMemo(
    () => ({
      board,
      activePage,
      project,
      setProject,
      addPage: () => setBoard((current) => addPage(current)),
      replaceBoard: (nextBoard: Board) => {
        setBoard(nextBoard);
        setProject({
          id: nextBoard.id,
          title: nextBoard.title,
          createdAt: nextBoard.createdAt,
          updatedAt: nextBoard.updatedAt
        });
      },
      replacePages: (pages: BoardPage[]) => setBoard((current) => replaceBoardPages(current, pages)),
      setActivePage: (pageId: string) => setBoard((current) => setActivePage(current, pageId)),
      setPageDocument: (pageId: string, document: BoardPageDocument) =>
        setBoard((current) => setPageDocument(current, pageId, document)),
      setPageObjects: (pageId: string, objects: CanvasObject[]) =>
        setBoard((current) => setPageObjects(current, pageId, objects))
    }),
    [board, activePage, project]
  );

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

export function useBoard() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoard must be used within a BoardProvider");
  }
  return context;
}
