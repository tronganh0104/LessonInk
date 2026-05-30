import type { CanvasObject } from "../canvas.types";

export type CanvasHistoryAction =
  | {
      type: "addObject";
      pageId: string;
      objectId: string;
    }
  | {
      type: "removeObject";
      pageId: string;
      objectId: string;
    }
  | {
      type: "removeObjects";
      pageId: string;
      objectIds: string[];
    }
  | {
      type: "clearCanvas";
      pageId: string;
    }
  | {
      type: "moveObject";
      pageId: string;
      objectId: string;
    }
  | {
      type: "addStroke";
      pageId: string;
      strokeId: string;
    }
  | {
      type: "removeStroke";
      pageId: string;
      strokeId: string;
    }
  | {
      type: "removeStrokes";
      pageId: string;
      strokeIds: string[];
    };

export interface CanvasHistoryEntry {
  id: string;
  action: CanvasHistoryAction;
  before: CanvasObject[];
  after: CanvasObject[];
  createdAt: string;
}

export interface CanvasHistoryState {
  undoStack: CanvasHistoryEntry[];
  redoStack: CanvasHistoryEntry[];
}

export const MAX_CANVAS_HISTORY_ENTRIES = 120;

export const initialCanvasHistoryState: CanvasHistoryState = {
  undoStack: [],
  redoStack: []
};

export function recordCanvasHistory(
  history: CanvasHistoryState,
  action: CanvasHistoryAction,
  before: CanvasObject[],
  after: CanvasObject[]
): CanvasHistoryState {
  if (before === after) {
    return history;
  }

  const nextEntry: CanvasHistoryEntry = {
    id: crypto.randomUUID(),
    action,
    before,
    after,
    createdAt: new Date().toISOString()
  };
  const undoStack = [...history.undoStack, nextEntry].slice(-MAX_CANVAS_HISTORY_ENTRIES);

  return {
    undoStack,
    redoStack: []
  };
}

export function undoCanvasHistory(history: CanvasHistoryState):
  | {
      history: CanvasHistoryState;
      pageId: string;
      objects: CanvasObject[];
    }
  | undefined {
  const entry = history.undoStack[history.undoStack.length - 1];

  if (!entry) {
    return undefined;
  }

  return {
    history: {
      undoStack: history.undoStack.slice(0, -1),
      redoStack: [...history.redoStack, entry]
    },
    pageId: entry.action.pageId,
    objects: entry.before
  };
}

export function redoCanvasHistory(history: CanvasHistoryState):
  | {
      history: CanvasHistoryState;
      pageId: string;
      objects: CanvasObject[];
    }
  | undefined {
  const entry = history.redoStack[history.redoStack.length - 1];

  if (!entry) {
    return undefined;
  }

  return {
    history: {
      undoStack: [...history.undoStack, entry].slice(-MAX_CANVAS_HISTORY_ENTRIES),
      redoStack: history.redoStack.slice(0, -1)
    },
    pageId: entry.action.pageId,
    objects: entry.after
  };
}
