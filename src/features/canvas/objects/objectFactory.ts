import type { StrokeObject } from "../canvas.types";

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
