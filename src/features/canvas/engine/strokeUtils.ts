import type { Point, StrokeObject } from "../canvas.types";

interface CreateStrokeInput {
  pageId: string;
  points: Point[];
  color: string;
  width: number;
  tool?: StrokeObject["tool"];
  opacity?: number;
}

export function createPenStroke({ pageId, points, color, width, tool = "pen", opacity = 1 }: CreateStrokeInput): StrokeObject {
  const timestamp = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    pageId,
    kind: "stroke",
    type: "stroke",
    tool,
    points,
    color,
    opacity,
    width,
    x: 0,
    y: 0,
    rotation: 0,
    locked: false,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function appendStrokePoints(stroke: StrokeObject, points: Point[]): StrokeObject {
  if (points.length === 0) {
    return stroke;
  }

  return {
    ...stroke,
    points: [...stroke.points, ...points],
    updatedAt: new Date().toISOString()
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
