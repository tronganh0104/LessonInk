import type { Board } from "../features/board/board.types";
import type { LessonInkFileProjectMetadata, LessonInkLoadedProject } from "../features/documents/lessoninkFile.types";
import { deserializeLessonInkFile, serializeLessonInkFile } from "../features/documents/lessoninkSerializer";

const AUTOSAVE_KEY = "mushroomlearning.autosave.currentProject";

export function writeAutosaveSnapshot(board: Board, project: LessonInkFileProjectMetadata): void {
  window.localStorage.setItem(AUTOSAVE_KEY, serializeLessonInkFile(board, project));
}

export function readAutosaveSnapshot(): LessonInkLoadedProject | null {
  const rawProject = window.localStorage.getItem(AUTOSAVE_KEY);

  if (!rawProject) {
    return null;
  }

  try {
    return deserializeLessonInkFile(rawProject);
  } catch {
    clearAutosaveSnapshot();
    return null;
  }
}

export function clearAutosaveSnapshot(): void {
  window.localStorage.removeItem(AUTOSAVE_KEY);
}
