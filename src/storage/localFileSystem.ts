import type { LessonInkProject } from "../features/documents/document.types";
import { PROJECT_EXTENSION } from "../shared/constants/app";

export async function saveProjectToLocalFile(_project: LessonInkProject): Promise<void> {
  // TODO: implement local save/load with Tauri filesystem APIs and `.mushroomlearning` files.
  throw new Error(`Local save is not implemented yet. Expected extension: ${PROJECT_EXTENSION}`);
}

export async function loadProjectFromLocalFile(): Promise<LessonInkProject | null> {
  // TODO: implement local project picker and JSON parsing.
  return null;
}
