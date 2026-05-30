import {
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import { Image as KonvaImage, Layer, Line, Rect, Stage, Text as KonvaText } from "react-konva";
import type { BoardPage } from "../../board/board.types";
import type { CanvasObject, CanvasToolState, CanvasViewport, Point, StrokeObject, TextObject } from "../canvas.types";
import { panViewport, zoomViewport } from "../engine/coordinateTransform";
import { isPointNearStroke } from "../engine/hitTest";
import { appendStablePoints, getMousePoint, getPointerPoints } from "../engine/pointerInput";
import { moveObjectInList } from "../objects/objectTransforms";
import { createPenStroke, normalizeStrokePoints, toLinePoints } from "../engine/strokeUtils";
import { createTextObject } from "../objects/objectFactory";

interface CanvasStageProps {
  page: BoardPage;
  toolState: CanvasToolState;
  viewport: CanvasViewport;
  onViewportChange: (viewport: CanvasViewport) => void;
  onStageSizeChange?: (size: typeof fallbackStageSize) => void;
  onAddObject: (object: CanvasObject) => void;
  onEraseStrokes: (strokeIds: string[]) => void;
  onMoveObject: (pageId: string, before: CanvasObject[], after: CanvasObject[], objectId: string) => void;
}

const fallbackStageSize = {
  width: 960,
  height: 680
};

function CanvasDocumentLayer({ page }: { page: BoardPage }) {
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const document = page.document;

  useEffect(() => {
    if (!document || (document.kind !== "image" && document.kind !== "pdfPage")) {
      setImageElement(null);
      return undefined;
    }

    const image = new window.Image();

    image.onload = () => setImageElement(image);
    image.src = document.source;

    return () => {
      image.onload = null;
    };
  }, [document]);

  if (!document || (document.kind !== "image" && document.kind !== "pdfPage") || !imageElement) {
    return null;
  }

  return (
    <KonvaImage
      image={imageElement}
      x={document.x}
      y={document.y}
      width={document.width}
      height={document.height}
      rotation={document.rotation}
      listening={false}
    />
  );
}

// TODO(Canvas v0.3+): add pressure-sensitive stroke rendering, touch gestures, zoom/pan,
// palm rejection, drawing tablet testing, stylus-specific UX, local save/load, PDF import,
// PDF/PNG export, presenter mode, and performance optimization for many strokes.
export function CanvasStage({
  page,
  toolState,
  viewport,
  onViewportChange,
  onStageSizeChange,
  onAddObject,
  onEraseStrokes,
  onMoveObject
}: CanvasStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const activePointerIdRef = useRef<number | undefined>(undefined);
  const lastPointerEventAtRef = useRef(0);
  const lastPanPointRef = useRef<Point | undefined>(undefined);
  const draftPointsRef = useRef<Point[]>([]);
  const erasedStrokeIdsRef = useRef(new Set<string>());
  const selectedObjectIdRef = useRef<string | undefined>(undefined);
  const activeMoveRef = useRef<
    | {
        objectId: string;
        startPoint: Point;
        before: CanvasObject[];
        latest: CanvasObject[];
      }
    | undefined
  >(undefined);
  interface EditingText {
    x: number;
    y: number;
    canvasX: number;
    canvasY: number;
    value: string;
  }
  const [stageSize, setStageSize] = useState(fallbackStageSize);
  const [draftPoints, setDraftPoints] = useState<Point[]>([]);
  const [hiddenStrokeIds, setHiddenStrokeIds] = useState<Set<string>>(() => new Set());
  const [editingText, setEditingText] = useState<EditingText | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | undefined>(undefined);
  const [movingObjects, setMovingObjects] = useState<CanvasObject[] | undefined>(undefined);
  const editingTextRef = useRef<EditingText | null>(null);
  const renderedObjects = movingObjects ?? page.objects;
  const selectedText =
    toolState.activeTool === "select"
      ? renderedObjects.find((object): object is TextObject => object.kind === "text" && object.id === selectedObjectId)
      : undefined;

  const finishTextEditing = useCallback(() => {
    const current = editingTextRef.current;
    if (current && current.value.trim()) {
      onAddObject(
        createTextObject({
          pageId: page.id,
          point: { x: current.canvasX, y: current.canvasY },
          text: current.value.trim(),
          color: toolState.textColor,
          fontSize: toolState.textSize
        })
      );
    }
    editingTextRef.current = null;
    setEditingText(null);
  }, [onAddObject, page.id, toolState.textColor, toolState.textSize]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const updateStageSize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      const nextSize = {
        width: width > 0 ? Math.round(width) : fallbackStageSize.width,
        height: height > 0 ? Math.round(height) : fallbackStageSize.height
      };

      setStageSize(nextSize);
      onStageSizeChange?.(nextSize);
    };
    const resizeObserver = new ResizeObserver(updateStageSize);

    updateStageSize();
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [onStageSizeChange]);

  useEffect(() => {
    isDrawingRef.current = false;
    activePointerIdRef.current = undefined;
    lastPointerEventAtRef.current = 0;
    lastPanPointRef.current = undefined;
    draftPointsRef.current = [];
    erasedStrokeIdsRef.current.clear();
    selectedObjectIdRef.current = undefined;
    activeMoveRef.current = undefined;
    editingTextRef.current = null;
    setEditingText(null);
    setSelectedObjectId(undefined);
    setMovingObjects(undefined);
    setDraftPoints([]);
    setHiddenStrokeIds(new Set());
  }, [page.id, toolState.activeTool]);

  const preventBrowserGesture = (event: PointerEvent) => {
    if (event.cancelable) {
      event.preventDefault();
    }
  };

  const preventMouseGesture = (event: MouseEvent) => {
    if (event.cancelable) {
      event.preventDefault();
    }
  };

  const shouldIgnoreMouseFallback = (): boolean => Date.now() - lastPointerEventAtRef.current < 700;

  const getEventPoints = useCallback(
    (event: PointerEvent, target: HTMLElement): Point[] => getPointerPoints(event, target, stageSize, viewport),
    [stageSize, viewport]
  );

  const getMouseEventPoint = useCallback(
    (event: MouseEvent, target: HTMLElement): Point => getMousePoint(event, target, stageSize, viewport),
    [stageSize, viewport]
  );

  const capturePointer = (target: HTMLElement, pointerId: number) => {
    if (!target.setPointerCapture) {
      return;
    }

    try {
      target.setPointerCapture(pointerId);
    } catch {
      // Pointer capture can fail if the browser has already cancelled the pointer.
    }
  };

  const releasePointer = (target: HTMLElement | null, pointerId: number | undefined) => {
    if (pointerId === undefined || !target || !target.releasePointerCapture) {
      return;
    }

    try {
      if (target.hasPointerCapture?.(pointerId)) {
        target.releasePointerCapture(pointerId);
      }
    } catch {
      // Safe cleanup only; a failed release should never leave drawing state stuck.
    }
  };

  const isActivePointerEvent = (event: PointerEvent): boolean =>
    activePointerIdRef.current === undefined || event.pointerId === activePointerIdRef.current;

  const findTextAtPoint = useCallback(
    (point: Point): TextObject | undefined =>
      [...page.objects]
        .reverse()
        .find(
          (object): object is TextObject =>
            object.kind === "text" &&
            !object.locked &&
            point.x >= object.x &&
            point.x <= object.x + object.width &&
            point.y >= object.y &&
            point.y <= object.y + object.height
        ),
    [page.objects]
  );

  const beginObjectMove = (object: TextObject, point: Point, pointerId?: number, target?: HTMLElement) => {
    selectedObjectIdRef.current = object.id;
    setSelectedObjectId(object.id);
    activeMoveRef.current = {
      objectId: object.id,
      startPoint: point,
      before: page.objects,
      latest: page.objects
    };
    activePointerIdRef.current = pointerId;

    if (pointerId !== undefined && target) {
      capturePointer(target, pointerId);
    }
  };

  const updateObjectMove = (point: Point) => {
    const activeMove = activeMoveRef.current;

    if (!activeMove) {
      return;
    }

    const deltaX = point.x - activeMove.startPoint.x;
    const deltaY = point.y - activeMove.startPoint.y;
    const latest = moveObjectInList(activeMove.before, activeMove.objectId, deltaX, deltaY);

    activeMove.latest = latest;
    setMovingObjects(latest);
  };

  const finishObjectMove = useCallback(() => {
    const activeMove = activeMoveRef.current;

    if (!activeMove) {
      return;
    }

    activeMoveRef.current = undefined;
    activePointerIdRef.current = undefined;
    setMovingObjects(undefined);

    const beforeObject = activeMove.before.find((object) => object.id === activeMove.objectId);
    const afterObject = activeMove.latest.find((object) => object.id === activeMove.objectId);
    const didMove =
      beforeObject &&
      afterObject &&
      (beforeObject.x !== afterObject.x ||
        beforeObject.y !== afterObject.y ||
        JSON.stringify(beforeObject) !== JSON.stringify(afterObject));

    if (didMove) {
      onMoveObject(page.id, activeMove.before, activeMove.latest, activeMove.objectId);
    }
  }, [onMoveObject, page.id]);

  const finishInput = useCallback(() => {
    const activePointerId = activePointerIdRef.current;
    const inputTarget = containerRef.current?.querySelector<HTMLElement>(".canvas-input-layer") ?? null;

    if (!isDrawingRef.current) {
      releasePointer(inputTarget, activePointerId);
      activePointerIdRef.current = undefined;

      return undefined;
    }

    isDrawingRef.current = false;
    releasePointer(inputTarget, activePointerId);
    activePointerIdRef.current = undefined;

    if ((toolState.activeTool === "pen" || toolState.activeTool === "highlighter") && draftPointsRef.current.length > 0) {
      const points = normalizeStrokePoints(draftPointsRef.current);
      const stroke = createPenStroke({
        pageId: page.id,
        points,
        color: toolState.activeTool === "highlighter" ? toolState.highlighterColor : toolState.penColor,
        width: toolState.activeTool === "highlighter" ? toolState.highlighterWidth : toolState.penWidth,
        tool: toolState.activeTool,
        opacity: toolState.activeTool === "highlighter" ? 0.38 : 1
      });

      onAddObject(stroke);
    }

    if (toolState.activeTool === "eraser" && erasedStrokeIdsRef.current.size > 0) {
      onEraseStrokes([...erasedStrokeIdsRef.current]);
    }

    lastPanPointRef.current = undefined;
    draftPointsRef.current = [];
    erasedStrokeIdsRef.current.clear();
    setDraftPoints([]);
    setHiddenStrokeIds(new Set());

    return undefined;
  }, [
    onAddObject,
    onEraseStrokes,
    page.id,
    toolState.activeTool,
    toolState.highlighterColor,
    toolState.highlighterWidth,
    toolState.penColor,
    toolState.penWidth
  ]);

  useEffect(() => {
    const handleWindowPointerEnd = (event: PointerEvent) => {
      if (event.pointerId === activePointerIdRef.current) {
        if (activeMoveRef.current) {
          finishObjectMove();
          return;
        }

        finishInput();
      }
    };
    const handleWindowMouseEnd = () => {
      if (activeMoveRef.current && activePointerIdRef.current === undefined && !shouldIgnoreMouseFallback()) {
        finishObjectMove();
        return;
      }

      if (isDrawingRef.current && activePointerIdRef.current === undefined && !shouldIgnoreMouseFallback()) {
        finishInput();
      }
    };

    window.addEventListener("pointerup", handleWindowPointerEnd);
    window.addEventListener("pointercancel", handleWindowPointerEnd);
    window.addEventListener("mouseup", handleWindowMouseEnd);
    window.addEventListener("blur", finishInput);
    window.addEventListener("blur", finishObjectMove);

    return () => {
      window.removeEventListener("pointerup", handleWindowPointerEnd);
      window.removeEventListener("pointercancel", handleWindowPointerEnd);
      window.removeEventListener("mouseup", handleWindowMouseEnd);
      window.removeEventListener("blur", finishInput);
      window.removeEventListener("blur", finishObjectMove);
    };
  }, [finishInput, finishObjectMove]);

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

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    lastPointerEventAtRef.current = Date.now();
    preventBrowserGesture(event.nativeEvent);

    if (event.button !== 0 || isDrawingRef.current) {
      return;
    }

    const points = getEventPoints(event.nativeEvent, event.currentTarget);
    const point = points[points.length - 1];

    if (!point) {
      return;
    }

    if (toolState.activeTool === "select") {
      const hitText = findTextAtPoint(point);

      if (!hitText) {
        selectedObjectIdRef.current = undefined;
        setSelectedObjectId(undefined);
        return;
      }

      beginObjectMove(hitText, point, event.pointerId, event.currentTarget);
      return;
    }

    if (toolState.activeTool === "text") {
      if (editingTextRef.current) {
        finishTextEditing();
        return;
      }
      const rect = event.currentTarget.getBoundingClientRect();
      const clientX = event.nativeEvent.clientX - rect.left;
      const clientY = event.nativeEvent.clientY - rect.top;
      const newEditingText = {
        x: clientX,
        y: clientY,
        canvasX: point.x,
        canvasY: point.y,
        value: ""
      };
      editingTextRef.current = newEditingText;
      setEditingText(newEditingText);
      return;
    }

    if (toolState.activeTool !== "pen" && toolState.activeTool !== "highlighter" && toolState.activeTool !== "eraser") {
      if (toolState.activeTool === "pan") {
        activePointerIdRef.current = event.pointerId;
        capturePointer(event.currentTarget, event.pointerId);
        lastPanPointRef.current = {
          x: event.nativeEvent.clientX,
          y: event.nativeEvent.clientY
        };
      }

      return;
    }

    activePointerIdRef.current = event.pointerId;
    capturePointer(event.currentTarget, event.pointerId);

    if (toolState.activeTool === "pen" || toolState.activeTool === "highlighter") {
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

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    lastPointerEventAtRef.current = Date.now();
    preventBrowserGesture(event.nativeEvent);

    if (!isActivePointerEvent(event.nativeEvent)) {
      return;
    }

    if (toolState.activeTool === "select" && activeMoveRef.current) {
      const points = getEventPoints(event.nativeEvent, event.currentTarget);
      const point = points[points.length - 1];

      if (point) {
        updateObjectMove(point);
      }

      return;
    }

    if (toolState.activeTool === "pan" && lastPanPointRef.current) {
      const nextPoint = {
        x: event.nativeEvent.clientX,
        y: event.nativeEvent.clientY
      };

      onViewportChange(
        panViewport(viewport, nextPoint.x - lastPanPointRef.current.x, nextPoint.y - lastPanPointRef.current.y)
      );
      lastPanPointRef.current = nextPoint;
      return;
    }

    if (!isDrawingRef.current) {
      return;
    }

    const points = getEventPoints(event.nativeEvent, event.currentTarget);
    const point = points[points.length - 1];

    if (!point) {
      return;
    }

    if (toolState.activeTool === "pen" || toolState.activeTool === "highlighter") {
      const nextPoints = appendStablePoints(draftPointsRef.current, points);
      draftPointsRef.current = nextPoints;
      setDraftPoints(nextPoints);
    }

    if (toolState.activeTool === "eraser") {
      points.forEach(eraseAtPoint);
    }
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    lastPointerEventAtRef.current = Date.now();
    preventBrowserGesture(event.nativeEvent);

    if (!isActivePointerEvent(event.nativeEvent)) {
      return;
    }

    if (toolState.activeTool === "pan") {
      releasePointer(event.currentTarget, activePointerIdRef.current);
      activePointerIdRef.current = undefined;
      lastPanPointRef.current = undefined;
      return;
    }

    if (toolState.activeTool === "select") {
      releasePointer(event.currentTarget, activePointerIdRef.current);
      finishObjectMove();
      return;
    }

    finishInput();
  };

  const handlePointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      return;
    }

    handlePointerEnd(event);
  };

  const beginAtPoint = (point: Point) => {
    if (toolState.activeTool === "pen" || toolState.activeTool === "highlighter") {
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

  const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (shouldIgnoreMouseFallback()) {
      return;
    }

    preventMouseGesture(event.nativeEvent);

    if (event.button !== 0 || isDrawingRef.current) {
      return;
    }

    if (toolState.activeTool === "text") {
      if (editingTextRef.current) {
        finishTextEditing();
        return;
      }
      const rect = event.currentTarget.getBoundingClientRect();
      const clientX = event.nativeEvent.clientX - rect.left;
      const clientY = event.nativeEvent.clientY - rect.top;
      const point = getMouseEventPoint(event.nativeEvent, event.currentTarget);
      const newEditingText = {
        x: clientX,
        y: clientY,
        canvasX: point.x,
        canvasY: point.y,
        value: ""
      };
      editingTextRef.current = newEditingText;
      setEditingText(newEditingText);
      return;
    }

    if (toolState.activeTool === "select") {
      const point = getMouseEventPoint(event.nativeEvent, event.currentTarget);
      const hitText = findTextAtPoint(point);

      if (!hitText) {
        selectedObjectIdRef.current = undefined;
        setSelectedObjectId(undefined);
        return;
      }

      beginObjectMove(hitText, point);
      return;
    }

    if (toolState.activeTool !== "pen" && toolState.activeTool !== "highlighter" && toolState.activeTool !== "eraser") {
      if (toolState.activeTool === "pan") {
        lastPanPointRef.current = {
          x: event.nativeEvent.clientX,
          y: event.nativeEvent.clientY
        };
      }

      return;
    }

    const point = getMouseEventPoint(event.nativeEvent, event.currentTarget);
    beginAtPoint(point);
  };

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (shouldIgnoreMouseFallback()) {
      return;
    }

    preventMouseGesture(event.nativeEvent);

    if (toolState.activeTool === "pan" && lastPanPointRef.current && activePointerIdRef.current === undefined) {
      const nextPoint = {
        x: event.nativeEvent.clientX,
        y: event.nativeEvent.clientY
      };

      onViewportChange(
        panViewport(viewport, nextPoint.x - lastPanPointRef.current.x, nextPoint.y - lastPanPointRef.current.y)
      );
      lastPanPointRef.current = nextPoint;
      return;
    }

    if (toolState.activeTool === "select" && activeMoveRef.current && activePointerIdRef.current === undefined) {
      updateObjectMove(getMouseEventPoint(event.nativeEvent, event.currentTarget));
      return;
    }

    if (!isDrawingRef.current || activePointerIdRef.current !== undefined) {
      return;
    }

    const point = getMouseEventPoint(event.nativeEvent, event.currentTarget);

    if (toolState.activeTool === "pen" || toolState.activeTool === "highlighter") {
      const nextPoints = appendStablePoints(draftPointsRef.current, [point]);
      draftPointsRef.current = nextPoints;
      setDraftPoints(nextPoints);
    }

    if (toolState.activeTool === "eraser") {
      eraseAtPoint(point);
    }
  };

  const handleMouseEnd = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (shouldIgnoreMouseFallback()) {
      return;
    }

    preventMouseGesture(event.nativeEvent);

    if (activePointerIdRef.current !== undefined) {
      return;
    }

    if (toolState.activeTool === "pan") {
      lastPanPointRef.current = undefined;
      return;
    }

    if (toolState.activeTool === "select") {
      finishObjectMove();
      return;
    }

    finishInput();
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();
    const anchor = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    const direction = event.deltaY > 0 ? -1 : 1;
    const factor = direction > 0 ? 1.1 : 0.9;

    onViewportChange(zoomViewport(viewport, viewport.zoom * factor, anchor));
  };

  return (
    <div className="canvas-stage" aria-label={`Canvas for ${page.title}`}>
      <div className={`canvas-surface tool-${toolState.activeTool}`} ref={containerRef}>
        <Stage
          width={stageSize.width}
          height={stageSize.height}
        >
          <Layer x={viewport.panX} y={viewport.panY} scaleX={viewport.zoom} scaleY={viewport.zoom}>
            <Rect x={0} y={0} width={stageSize.width} height={stageSize.height} fill={page.background.color} />

            <CanvasDocumentLayer page={page} />

            {renderedObjects.map((object) => {
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
                  globalCompositeOperation={object.tool === "highlighter" ? "multiply" : "source-over"}
                  listening={false}
                />
              );
            })}

            {renderedObjects.map((object) => {
              if (object.kind !== "text") {
                return null;
              }

              return (
                <KonvaText
                  key={object.id}
                  x={object.x}
                  y={object.y}
                  text={object.text}
                  width={object.width}
                  height={object.height}
                  fontFamily={object.fontFamily}
                  fontSize={object.fontSize}
                  fill={object.color}
                  rotation={object.rotation}
                  listening={false}
                />
              );
            })}

            {draftPoints.length > 0 && (
              <Line
                points={toLinePoints(normalizeStrokePoints(draftPoints))}
                stroke={toolState.activeTool === "highlighter" ? toolState.highlighterColor : toolState.penColor}
                strokeWidth={toolState.activeTool === "highlighter" ? toolState.highlighterWidth : toolState.penWidth}
                opacity={toolState.activeTool === "highlighter" ? 0.38 : 1}
                lineCap="round"
                lineJoin="round"
                tension={0.35}
                globalCompositeOperation={toolState.activeTool === "highlighter" ? "multiply" : "source-over"}
                listening={false}
              />
            )}

            {selectedText && (
              <Rect
                x={selectedText.x - 4}
                y={selectedText.y - 4}
                width={selectedText.width + 8}
                height={selectedText.height + 8}
                stroke="#c73646"
                strokeWidth={1.5 / viewport.zoom}
                dash={[6 / viewport.zoom, 4 / viewport.zoom]}
                listening={false}
              />
            )}
          </Layer>
        </Stage>
        {!page.document && page.objects.length === 0 && draftPoints.length === 0 && (
          <div className="canvas-empty-state" aria-hidden="true">
            <strong>Import a worksheet or start writing.</strong>
            <span>Use Import in the top bar, or pick Pen and write directly.</span>
          </div>
        )}
        <div
          className="canvas-input-layer"
          aria-label={`${toolState.activeTool} input layer`}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseEnd}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseEnd}
          onWheel={handleWheel}
          onLostPointerCapture={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onPointerDown={handlePointerDown}
          onPointerLeave={handlePointerLeave}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
        />
        {editingText && (
          <textarea
            className="canvas-text-editor"
            style={{
              left: `${editingText.x}px`,
              top: `${editingText.y}px`,
              color: toolState.textColor,
              fontSize: `${toolState.textSize * viewport.zoom}px`,
              lineHeight: 1.2
            }}
            autoFocus
            value={editingText.value}
            onChange={(e) => {
              const val = e.target.value;
              setEditingText(prev => {
                const next = prev ? { ...prev, value: val } : null;
                editingTextRef.current = next;
                return next;
              });
            }}
            onBlur={finishTextEditing}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                finishTextEditing();
              } else if (e.key === "Escape") {
                editingTextRef.current = null;
                setEditingText(null);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
