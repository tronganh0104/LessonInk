import type { CanvasViewport, Point } from "../canvas.types";

export interface ViewportPoint {
  x: number;
  y: number;
}

export function clampZoom(zoom: number): number {
  return Math.max(0.25, Math.min(4, zoom));
}

export function viewportPointToCanvasPoint(point: ViewportPoint, viewport: CanvasViewport): Point {
  const zoom = clampZoom(viewport.zoom);

  return {
    x: (point.x - viewport.panX) / zoom,
    y: (point.y - viewport.panY) / zoom
  };
}

export function canvasPointToViewportPoint(point: ViewportPoint, viewport: CanvasViewport): ViewportPoint {
  const zoom = clampZoom(viewport.zoom);

  return {
    x: point.x * zoom + viewport.panX,
    y: point.y * zoom + viewport.panY
  };
}

export function zoomViewport(
  viewport: CanvasViewport,
  nextZoom: number,
  anchor: ViewportPoint
): CanvasViewport {
  const zoom = clampZoom(nextZoom);
  const anchoredCanvasPoint = viewportPointToCanvasPoint(anchor, viewport);

  return {
    zoom,
    panX: anchor.x - anchoredCanvasPoint.x * zoom,
    panY: anchor.y - anchoredCanvasPoint.y * zoom
  };
}

export function panViewport(viewport: CanvasViewport, deltaX: number, deltaY: number): CanvasViewport {
  return {
    ...viewport,
    panX: viewport.panX + deltaX,
    panY: viewport.panY + deltaY
  };
}

export function resetViewport(): CanvasViewport {
  return {
    zoom: 1,
    panX: 0,
    panY: 0
  };
}
