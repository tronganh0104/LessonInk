import { useCallback, useEffect, useRef, useState } from "react";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { Layer, Line, Rect, Stage } from "react-konva";
import type { BoardPage } from "../../board/board.types";
import type { CanvasToolState, Point, StrokeObject } from "../canvas.types";
import { isPointNearStroke } from "../engine/hitTest";
import { createPenStroke, normalizeStrokePoints, toLinePoints } from "../engine/strokeUtils";

interface CanvasStageProps {
  page: BoardPage;
  toolState: CanvasToolState;
  onAddStroke: (stroke: StrokeObject) => void;
  onEraseStrokes: (strokeIds: string[]) => void;
}

const fallbackStageSize = {
  width: 960,
  height: 680
};

// TODO(Canvas v0.2+): add pressure-sensitive stylus support, touch input, zoom/pan,
// multi-page board controls, local save/load, PDF import, PDF/PNG export, presenter mode,
// and performance optimization for many strokes.
export function CanvasStage({ page, toolState, onAddStroke, onEraseStrokes }: CanvasStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const isDrawingRef = useRef(false);
  const draftPointsRef = useRef<Point[]>([]);
  const erasedStrokeIdsRef = useRef(new Set<string>());
  const [stageSize, setStageSize] = useState(fallbackStageSize);
  const [draftPoints, setDraftPoints] = useState<Point[]>([]);
  const [hiddenStrokeIds, setHiddenStrokeIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const updateStageSize = () => {
      setStageSize({
        width: Math.max(container.clientWidth, 320),
        height: Math.max(container.clientHeight, fallbackStageSize.height)
      });
    };
    const resizeObserver = new ResizeObserver(updateStageSize);

    updateStageSize();
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    isDrawingRef.current = false;
    draftPointsRef.current = [];
    erasedStrokeIdsRef.current.clear();
    setDraftPoints([]);
    setHiddenStrokeIds(new Set());
  }, [page.id, toolState.activeTool]);

  const getPointerPoint = useCallback((): Point | undefined => {
    const position = stageRef.current?.getPointerPosition();

    if (!position) {
      return undefined;
    }

    return {
      x: position.x,
      y: position.y
    };
  }, []);

  const eraseAtPoint = useCallback(
    (point: Point) => {
      const strokes = page.objects.filter((object): object is StrokeObject => object.kind === "stroke");
      const hitStroke = [...strokes]
        .reverse()
        .find(
          (stroke) =>
            !erasedStrokeIdsRef.current.has(stroke.id) &&
            isPointNearStroke(point, stroke, toolState.eraserRadius)
        );

      if (!hitStroke) {
        return;
      }

      erasedStrokeIdsRef.current.add(hitStroke.id);
      setHiddenStrokeIds(new Set(erasedStrokeIdsRef.current));
    },
    [page.objects, toolState.eraserRadius]
  );

  const handleMouseDown = (event: KonvaEventObject<MouseEvent>) => {
    if (event.evt.button !== 0) {
      return;
    }

    const point = getPointerPoint();

    if (!point) {
      return;
    }

    if (toolState.activeTool === "pen") {
      isDrawingRef.current = true;
      draftPointsRef.current = [point];
      setDraftPoints([point]);
    }

    if (toolState.activeTool === "eraser") {
      isDrawingRef.current = true;
      erasedStrokeIdsRef.current.clear();
      eraseAtPoint(point);
    }
  };

  const handleMouseMove = () => {
    if (!isDrawingRef.current) {
      return;
    }

    const point = getPointerPoint();

    if (!point) {
      return;
    }

    if (toolState.activeTool === "pen") {
      const nextPoints = [...draftPointsRef.current, point];
      draftPointsRef.current = nextPoints;
      setDraftPoints(nextPoints);
    }

    if (toolState.activeTool === "eraser") {
      eraseAtPoint(point);
    }
  };

  const finishStroke = () => {
    if (!isDrawingRef.current) {
      return;
    }

    isDrawingRef.current = false;

    if (toolState.activeTool === "pen" && draftPointsRef.current.length > 0) {
      const points = normalizeStrokePoints(draftPointsRef.current);
      const stroke = createPenStroke({
        pageId: page.id,
        points,
        color: toolState.penColor,
        width: toolState.penWidth
      });

      onAddStroke(stroke);
    }

    if (toolState.activeTool === "eraser" && erasedStrokeIdsRef.current.size > 0) {
      onEraseStrokes([...erasedStrokeIdsRef.current]);
    }

    draftPointsRef.current = [];
    erasedStrokeIdsRef.current.clear();
    setDraftPoints([]);
    setHiddenStrokeIds(new Set());
  };

  return (
    <div className="canvas-stage" aria-label={`Canvas for ${page.title}`}>
      <div className={`canvas-surface tool-${toolState.activeTool}`} ref={containerRef}>
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={finishStroke}
          onMouseLeave={finishStroke}
        >
          <Layer>
            <Rect x={0} y={0} width={stageSize.width} height={stageSize.height} fill={page.background.color} />

            {page.objects.map((object) => {
              if (object.kind !== "stroke" || hiddenStrokeIds.has(object.id)) {
                return null;
              }

              return (
                <Line
                  key={object.id}
                  points={toLinePoints(object.points)}
                  stroke={object.color}
                  strokeWidth={object.width}
                  opacity={object.opacity}
                  lineCap="round"
                  lineJoin="round"
                  tension={0.35}
                  listening={false}
                />
              );
            })}

            {draftPoints.length > 0 && (
              <Line
                points={toLinePoints(normalizeStrokePoints(draftPoints))}
                stroke={toolState.penColor}
                strokeWidth={toolState.penWidth}
                opacity={1}
                lineCap="round"
                lineJoin="round"
                tension={0.35}
                listening={false}
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
