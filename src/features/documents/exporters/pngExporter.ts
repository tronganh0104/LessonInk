import type { BoardPage } from "../../board/board.types";
import type { StrokeObject, TextObject } from "../../canvas/canvas.types";

interface ExportPageToPngInput {
  page: BoardPage;
  width: number;
  height: number;
  fileName?: string;
}

export interface PagePngExportBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MutableBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function snapCoordinate(value: number): number {
  const rounded = Math.round(value);

  return Math.abs(value - rounded) < 1e-9 ? rounded : value;
}

function includeRect(bounds: MutableBounds, x: number, y: number, width: number, height: number): void {
  bounds.minX = Math.min(bounds.minX, x);
  bounds.minY = Math.min(bounds.minY, y);
  bounds.maxX = Math.max(bounds.maxX, x + width);
  bounds.maxY = Math.max(bounds.maxY, y + height);
}

function includeRotatedRect(
  bounds: MutableBounds,
  x: number,
  y: number,
  width: number,
  height: number,
  rotation = 0
): void {
  if (rotation === 0) {
    includeRect(bounds, x, y, width, height);
    return;
  }

  const radians = (rotation * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const corners = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height }
  ];

  corners.forEach((corner) => {
    includePoint(
      bounds,
      snapCoordinate(x + corner.x * cos - corner.y * sin),
      snapCoordinate(y + corner.x * sin + corner.y * cos)
    );
  });
}

function includePoint(bounds: MutableBounds, x: number, y: number, padding = 0): void {
  includeRect(bounds, x - padding, y - padding, padding * 2, padding * 2);
}

export function getPagePngExportBounds(page: BoardPage, width: number, height: number): PagePngExportBounds {
  const bounds: MutableBounds = {
    minX: 0,
    minY: 0,
    maxX: Math.max(1, width),
    maxY: Math.max(1, height)
  };

  if (page.document) {
    includeRotatedRect(
      bounds,
      page.document.x,
      page.document.y,
      page.document.width,
      page.document.height,
      page.document.rotation
    );
  }

  page.objects.forEach((object) => {
    if (object.kind !== "stroke") {
      if (object.kind === "text") {
        includeRotatedRect(bounds, object.x, object.y, object.width, object.height, object.rotation);
      }

      return;
    }

    const padding = object.width / 2;

    object.points.forEach((point) => includePoint(bounds, point.x, point.y, padding));
  });

  return {
    x: Math.floor(bounds.minX),
    y: Math.floor(bounds.minY),
    width: Math.max(1, Math.ceil(bounds.maxX) - Math.floor(bounds.minX)),
    height: Math.max(1, Math.ceil(bounds.maxY) - Math.floor(bounds.minY))
  };
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onerror = () => reject(new Error("Could not load image for PNG export."));
    image.onload = () => resolve(image);
    image.src = source;
  });
}

function drawStroke(context: CanvasRenderingContext2D, stroke: StrokeObject): void {
  if (stroke.points.length === 0) {
    return;
  }

  context.save();
  context.globalAlpha = stroke.opacity;
  context.strokeStyle = stroke.color;
  context.lineWidth = stroke.width;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  context.moveTo(stroke.points[0].x, stroke.points[0].y);

  stroke.points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
  context.stroke();
  context.restore();
}

function drawText(context: CanvasRenderingContext2D, text: TextObject): void {
  const lineHeight = text.fontSize * 1.25;
  const lines = text.text.split(/\r?\n/);

  context.save();
  context.translate(text.x, text.y);
  context.rotate((text.rotation * Math.PI) / 180);
  context.fillStyle = text.color;
  context.font = `${text.fontSize}px ${text.fontFamily}`;
  context.textBaseline = "top";
  lines.forEach((line, index) => context.fillText(line, 0, index * lineHeight, text.width));
  context.restore();
}

export async function createPagePngDataUrl({ page, width, height }: ExportPageToPngInput): Promise<string> {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const exportBounds = getPagePngExportBounds(page, width, height);

  if (!context) {
    throw new Error("PNG export is not available in this browser.");
  }

  canvas.width = exportBounds.width;
  canvas.height = exportBounds.height;
  context.fillStyle = page.background.color;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.translate(-exportBounds.x, -exportBounds.y);

  if (page.document?.kind === "image" || page.document?.kind === "pdfPage") {
    const image = await loadImage(page.document.source);

    context.save();
    context.translate(page.document.x, page.document.y);
    context.rotate((page.document.rotation * Math.PI) / 180);
    context.drawImage(image, 0, 0, page.document.width, page.document.height);
    context.restore();
  }

  page.objects.forEach((object) => {
    if (object.kind === "stroke") {
      drawStroke(context, object);
    }

    if (object.kind === "text") {
      drawText(context, object);
    }
  });

  return canvas.toDataURL("image/png");
}

export async function exportPageToPng(input: ExportPageToPngInput): Promise<void> {
  const dataUrl = await createPagePngDataUrl(input);
  const link = document.createElement("a");

  link.href = dataUrl;
  link.download = input.fileName ?? `${input.page.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "page"}.png`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
}
