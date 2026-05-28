import type { CanvasObject } from "../canvas.types";

export interface HistoryEntry {
  id: string;
  label: string;
  before: CanvasObject[];
  after: CanvasObject[];
  createdAt: string;
}

export interface HistoryState {
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];
}
