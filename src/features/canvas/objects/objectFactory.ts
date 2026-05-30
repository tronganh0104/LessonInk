import type { Point, StrokeObject, TextObject } from "../canvas.types";

export function createStrokeObject(pageId: string): StrokeObject {
  const timestamp = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    pageId,
    kind: "stroke",
    type: "stroke",
    tool: "pen",
    points: [],
    color: "#1f2937",
    opacity: 1,
    width: 4,
    x: 0,
    y: 0,
    rotation: 0,
    locked: false,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

interface CreateTextObjectInput {
  pageId: string;
  point: Point;
  text: string;
  color: string;
  fontSize: number;
}

export function createTextObject({ pageId, point, text, color, fontSize }: CreateTextObjectInput): TextObject {
  const timestamp = new Date().toISOString();
  const width = Math.max(160, Math.min(520, text.length * fontSize * 0.62));

  return {
    id: crypto.randomUUID(),
    pageId,
    kind: "text",
    text,
    fontFamily: "Inter, Arial, sans-serif",
    fontSize,
    color,
    width,
    height: Math.max(fontSize * 1.4, 32),
    x: point.x,
    y: point.y,
    rotation: 0,
    locked: false,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}
