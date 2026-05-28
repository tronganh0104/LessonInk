import type { CanvasObject } from "../canvas/canvas.types";

export interface BoardPage {
  id: string;
  title: string;
  index: number;
  background: BoardPageBackground;
  objects: CanvasObject[];
  createdAt: string;
  updatedAt: string;
}

export interface BoardPageBackground {
  type: "blank" | "grid" | "dots" | "lined" | "pdf";
  color: string;
}

export interface Board {
  id: string;
  title: string;
  pages: BoardPage[];
  activePageId: string;
  createdAt: string;
  updatedAt: string;
}
