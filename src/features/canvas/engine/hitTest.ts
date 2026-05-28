import type { Point, StrokeObject } from "../canvas.types";

function distanceToSegment(point: Point, start: Point, end: Point): number {
  const segmentX = end.x - start.x;
  const segmentY = end.y - start.y;
  const lengthSquared = segmentX * segmentX + segmentY * segmentY;

  if (lengthSquared === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }

  const rawProjection =
    ((point.x - start.x) * segmentX + (point.y - start.y) * segmentY) / lengthSquared;
  const projection = Math.max(0, Math.min(1, rawProjection));
  const closestX = start.x + projection * segmentX;
  const closestY = start.y + projection * segmentY;

  return Math.hypot(point.x - closestX, point.y - closestY);
}

export function isPointNearStroke(point: Point, stroke: StrokeObject, radius: number): boolean {
  if (stroke.points.length === 0) {
    return false;
  }

  if (stroke.points.length === 1) {
    const [strokePoint] = stroke.points;

    return Math.hypot(point.x - strokePoint.x, point.y - strokePoint.y) <= radius + stroke.width / 2;
  }

  return stroke.points.some((strokePoint, index) => {
    if (index === stroke.points.length - 1) {
      return false;
    }

    const nextPoint = stroke.points[index + 1];
    return distanceToSegment(point, strokePoint, nextPoint) <= radius + stroke.width / 2;
  });
}
