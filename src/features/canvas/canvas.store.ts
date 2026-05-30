import type { CanvasObject, CanvasToolState, CanvasViewport, ToolType } from "./canvas.types";

export interface CanvasState {
  toolState: CanvasToolState;
  objects: CanvasObject[];
  viewport: CanvasViewport;
}

export const initialCanvasToolState: CanvasToolState = {
  activeTool: "pen",
  penColor: "#111827",
  penWidth: 4,
  highlighterColor: "#facc15",
  highlighterWidth: 18,
  textColor: "#111827",
  textSize: 24,
  eraserRadius: 14
};

export const initialCanvasState: CanvasState = {
  toolState: initialCanvasToolState,
  objects: [],
  viewport: {
    zoom: 1,
    panX: 0,
    panY: 0
  }
};

export function setActiveTool(state: CanvasState, activeTool: ToolType): CanvasState {
  return {
    ...state,
    toolState: {
      ...state.toolState,
      activeTool
    }
  };
}

export function addCanvasObject(state: CanvasState, object: CanvasObject): CanvasState {
  return {
    ...state,
    objects: [...state.objects, object]
  };
}
