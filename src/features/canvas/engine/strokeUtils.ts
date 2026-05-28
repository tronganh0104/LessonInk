import type { Point, StrokeObject } from "../canvas.types";

interface CreateStrokeInput {
  pageId: string;
  points: Point[];
  color: string;
  width: number;
}

export function createPenStroke({ pageId, points, color, width }: CreateStrokeInput): StrokeObject {
  const timestamp = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    pageId,
    kind: "stroke",
    type: "stroke",
    tool: "pen",
    points,
    color,
    opacity: 1,
    width,
    x: 0,
    y: 0,
    rotation: 0,
    locked: false,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function toLinePoints(points: Point[]): number[] {
  return points.flatMap((point) => [point.x, point.y]);
}

export function normalizeStrokePoints(points: Point[]): Point[] {
  if (points.length === 1) {
    const [point] = points;

    return [
      point,
      {
        ...point,
        x: point.x + 0.1,
        y: point.y + 0.1
      }
    ];
  }

  return points;
}
