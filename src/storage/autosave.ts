import type { LessonInkProject } from "../features/documents/document.types";

const AUTOSAVE_KEY = "lessonink.autosave.currentProject";

export function writeAutosaveSnapshot(project: LessonInkProject): void {
  // TODO: move autosave to Tauri app data storage for desktop reliability.
  window.localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(project));
}

export function readAutosaveSnapshot(): LessonInkProject | null {
  const rawProject = window.localStorage.getItem(AUTOSAVE_KEY);
  return rawProject ? (JSON.parse(rawProject) as LessonInkProject) : null;
}
