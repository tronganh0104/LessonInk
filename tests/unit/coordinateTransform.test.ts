import { describe, expect, it } from "vitest";
import {
  canvasPointToViewportPoint,
  clampZoom,
  panViewport,
  resetViewport,
  viewportPointToCanvasPoint,
  zoomViewport
} from "../../src/features/canvas/engine/coordinateTransform";

describe("coordinate transforms", () => {
  it("round-trips viewport and canvas points", () => {
    const viewport = {
      zoom: 2,
      panX: 40,
      panY: -20
    };
    const canvasPoint = viewportPointToCanvasPoint({ x: 140, y: 80 }, viewport);

    expect(canvasPoint).toEqual({ x: 50, y: 50 });
    expect(canvasPointToViewportPoint(canvasPoint, viewport)).toEqual({ x: 140, y: 80 });
  });

  it("keeps zoom within the supported range", () => {
    expect(clampZoom(0.01)).toBe(0.25);
    expect(clampZoom(10)).toBe(4);
  });

  it("zooms around the requested viewport anchor", () => {
    const viewport = {
      zoom: 1,
      panX: 0,
      panY: 0
    };
    const anchor = { x: 200, y: 100 };
    const nextViewport = zoomViewport(viewport, 2, anchor);

    expect(viewportPointToCanvasPoint(anchor, nextViewport)).toEqual({ x: 200, y: 100 });
  });

  it("pans and resets viewports", () => {
    expect(panViewport(resetViewport(), 10, -20)).toEqual({ zoom: 1, panX: 10, panY: -20 });
    expect(resetViewport()).toEqual({ zoom: 1, panX: 0, panY: 0 });
  });

  it("keeps points stable after repeated zoom and pan operations", () => {
    const anchor = { x: 420, y: 240 };
    let viewport = resetViewport();

    for (let index = 0; index < 25; index += 1) {
      viewport = zoomViewport(viewport, viewport.zoom * 1.08, anchor);
      viewport = panViewport(viewport, 3, -2);
      viewport = zoomViewport(viewport, viewport.zoom / 1.05, anchor);
    }

    const canvasPoint = viewportPointToCanvasPoint(anchor, viewport);
    const roundTrippedPoint = canvasPointToViewportPoint(canvasPoint, viewport);

    expect(roundTrippedPoint.x).toBeCloseTo(anchor.x, 8);
    expect(roundTrippedPoint.y).toBeCloseTo(anchor.y, 8);
    expect(viewport.zoom).toBeGreaterThanOrEqual(0.25);
    expect(viewport.zoom).toBeLessThanOrEqual(4);
  });
});
