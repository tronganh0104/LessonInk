import type { Board } from "../features/board/board.types";
import type { LessonInkFileProjectMetadata, LessonInkLoadedProject } from "../features/documents/lessoninkFile.types";
import { deserializeLessonInkFile, serializeLessonInkFile } from "../features/documents/lessoninkSerializer";

const AUTOSAVE_KEY = "mushroomlearning.autosave.currentProject";

export function writeAutosaveSnapshot(board: Board, project: LessonInkFileProjectMetadata): boolean {
  try {
    window.localStorage.setItem(AUTOSAVE_KEY, serializeLessonInkFile(board, project));
    return true;
  } catch {
    return false;
  }
}

export function readAutosaveSnapshot(): LessonInkLoadedProject | null {
  let rawProject: string | null = null;

  try {
    rawProject = window.localStorage.getItem(AUTOSAVE_KEY);
  } catch {
    return null;
  }

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
  try {
    window.localStorage.removeItem(AUTOSAVE_KEY);
  } catch {
    // Clearing autosave is best effort; storage may be unavailable in restricted contexts.
  }
}
