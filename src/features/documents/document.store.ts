import { createBlankBoard } from "../board/board.store";
import type { LessonInkProject } from "./document.types";

export function createNewProject(title = "Untitled lesson"): LessonInkProject {
  const timestamp = new Date().toISOString();

  return {
    schemaVersion: 1,
    appVersion: "0.1.0",
    board: createBlankBoard(title),
    createdAt: timestamp,
    updatedAt: timestamp
  };
}
