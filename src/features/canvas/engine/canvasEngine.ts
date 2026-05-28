import type { BoardPage } from "../../board/board.types";
import type { CanvasObject, ToolType } from "../canvas.types";

export interface CanvasEngine {
  mount(container: HTMLElement): void;
  unmount(): void;
  renderPage(page: BoardPage): void;
  setTool(tool: ToolType): void;
  addObject(object: CanvasObject): void;
}

export function createCanvasEngine(): CanvasEngine {
  return {
    mount: () => {
      // TODO: implement Canvas rendering engine with Konva.js or Fabric.js.
    },
    unmount: () => {
      // TODO: release canvas listeners and renderer resources.
    },
    renderPage: () => {
      // TODO: render page background, PDF pages, images, strokes, text, and shapes.
    },
    setTool: () => {
      // TODO: wire active tool behavior for pen, eraser, highlighter, text, shapes, and pan.
    },
    addObject: () => {
      // TODO: push object into the renderer and document model.
    }
  };
}
