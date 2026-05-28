import type { Board } from "../board/board.types";

export interface LessonInkProject {
  schemaVersion: number;
  appVersion: string;
  board: Board;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMetadata {
  title: string;
  lastOpenedAt?: string;
  sourcePath?: string;
}
