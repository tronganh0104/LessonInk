import type { CanvasObject } from "../canvas/canvas.types";

export interface BoardPage {
  id: string;
  title: string;
  index: number;
  background: BoardPageBackground;
  document?: BoardPageDocument;
  objects: CanvasObject[];
  createdAt: string;
  updatedAt: string;
}

export interface BoardPageBackground {
  type: "blank" | "grid" | "dots" | "lined" | "pdf";
  color: string;
}

export type BoardPageDocument = ImagePageDocument | PdfPageDocument;

export interface BasePageDocument {
  id: string;
  pageId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  createdAt: string;
  updatedAt: string;
}

export interface ImagePageDocument extends BasePageDocument {
  kind: "image";
  sourceType: "embedded";
  source: string;
  mimeType: "image/png" | "image/jpeg";
  altText?: string;
}

export interface PdfPageDocument extends BasePageDocument {
  kind: "pdfPage";
  sourceType: "embeddedRender" | "localReference";
  source: string;
  pdfPageNumber: number;
}

export interface Board {
  id: string;
  title: string;
  pages: BoardPage[];
  activePageId: string;
  createdAt: string;
  updatedAt: string;
}
