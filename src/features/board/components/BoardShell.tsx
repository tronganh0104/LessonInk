import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { initialCanvasToolState } from "../../canvas/canvas.store";
import { CanvasStage } from "../../canvas/components/CanvasStage";
import { CanvasToolbar } from "../../canvas/components/CanvasToolbar";
import type { CanvasObject, StrokeObject, ToolType } from "../../canvas/canvas.types";
import {
  type CanvasHistoryAction,
  initialCanvasHistoryState,
  recordCanvasHistory,
  redoCanvasHistory,
  undoCanvasHistory
} from "../../canvas/history/canvasHistory";
import { resetViewport, zoomViewport } from "../../canvas/engine/coordinateTransform";
import {
  downloadLessonInkFile,
  getLessonInkDownloadName,
  readLessonInkFile
} from "../../documents/lessoninkFileService";
import type { LessonInkFileProjectMetadata } from "../../documents/lessoninkFile.types";
import { deserializeLessonInkFile, serializeLessonInkFile } from "../../documents/lessoninkSerializer";
import { exportPageToPng } from "../../documents/exporters/pngExporter";
import { importImageAsPageDocument } from "../../documents/importers/imageImporter";
import { getBoardPageClassName, usePresenterStore } from "../../presenter/presenter.store";
import { TimerPanel } from "../../timer/TimerPanel";
import {
  initialTimerState,
  pauseTimer,
  resetTimer,
  setTimerDuration,
  startTimer,
  tickTimer
} from "../../timer/timer.store";
import { getAdjacentPageId } from "../board.store";
import { useBoardState } from "../hooks/useBoardState";

export function BoardShell() {
  const { board, activePage, addPage, replaceBoard, setActivePage, setPageDocument, setPageObjects } = useBoardState();
  const { isPresenterMode, togglePresenterMode } = usePresenterStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [toolState, setToolState] = useState(initialCanvasToolState);
  const [history, setHistory] = useState(initialCanvasHistoryState);
  const [viewport, setViewport] = useState(resetViewport);
  const [stageSize, setStageSize] = useState({ width: 960, height: 680 });
  const [timerState, setTimerState] = useState(initialTimerState);
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving" | "Unsaved changes">("Saved");
  const [project, setProject] = useState<LessonInkFileProjectMetadata>(() => ({
    id: board.id,
    title: board.title,
    createdAt: board.createdAt,
    updatedAt: board.updatedAt
  }));
  const [fileMessage, setFileMessage] = useState<string | undefined>(undefined);
  const [fileError, setFileError] = useState<string | undefined>(undefined);
  const activePageIndex = Math.max(
    board.pages.findIndex((page) => page.id === board.activePageId),
    0
  );
  const previousPageId = getAdjacentPageId(board, "previous");
  const nextPageId = getAdjacentPageId(board, "next");

  useEffect(() => {
    document.body.classList.toggle("presenter-mode-active", isPresenterMode);

    return () => document.body.classList.remove("presenter-mode-active");
  }, [isPresenterMode]);

  useEffect(() => {
    if (!timerState.isRunning) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setTimerState((current) => tickTimer(current));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timerState.isRunning]);

  const commitObjects = (
    pageId: string,
    before: CanvasObject[],
    after: CanvasObject[],
    action: CanvasHistoryAction
  ) => {
    setPageObjects(pageId, after);
    setHistory((current) => recordCanvasHistory(current, action, before, after));
    setSaveStatus("Unsaved changes");
  };

  const handleAddStroke = (stroke: StrokeObject) => {
    const before = activePage.objects;
    const after = [...before, stroke];

    commitObjects(activePage.id, before, after, {
      type: "addStroke",
      pageId: activePage.id,
      strokeId: stroke.id
    });
  };

  const handleEraseStrokes = (strokeIds: string[]) => {
    const strokeIdSet = new Set(strokeIds);
    const before = activePage.objects;
    const after = before.filter((object) => !strokeIdSet.has(object.id));

    if (before.length === after.length) {
      return;
    }

    const action: CanvasHistoryAction =
      strokeIds.length === 1
        ? {
            type: "removeStroke",
            pageId: activePage.id,
            strokeId: strokeIds[0]
          }
        : {
            type: "removeStrokes",
            pageId: activePage.id,
            strokeIds
          };

    commitObjects(activePage.id, before, after, action);
  };

  const handleClearCanvas = () => {
    if (activePage.objects.length === 0) {
      return;
    }

    commitObjects(activePage.id, activePage.objects, [], {
      type: "clearCanvas",
      pageId: activePage.id
    });
  };

  const handleUndo = () => {
    const result = undoCanvasHistory(history);

    if (!result) {
      return;
    }

    setPageObjects(result.pageId, result.objects);
    setHistory(result.history);
    setSaveStatus("Unsaved changes");
  };

  const handleRedo = () => {
    const result = redoCanvasHistory(history);

    if (!result) {
      return;
    }

    setPageObjects(result.pageId, result.objects);
    setHistory(result.history);
    setSaveStatus("Unsaved changes");
  };

  const handleSaveProject = () => {
    setSaveStatus("Saving");
    const contents = serializeLessonInkFile(board, project);

    downloadLessonInkFile(contents, getLessonInkDownloadName(project));
    setSaveStatus("Saved");
    setFileError(undefined);
    setFileMessage("Project download started.");
  };

  const handleOpenProject = () => {
    fileInputRef.current?.click();
  };

  const handleImportImage = () => {
    imageInputRef.current?.click();
  };

  const handleExportPng = async () => {
    try {
      await exportPageToPng({
        page: activePage,
        width: stageSize.width,
        height: stageSize.height,
        fileName: `${activePage.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "mushroomlearning-page"}.png`
      });
      setFileError(undefined);
      setFileMessage("PNG export started.");
    } catch (error) {
      setFileMessage(undefined);
      setFileError(error instanceof Error ? error.message : "Could not export the current page as PNG.");
    }
  };

  const handleZoomIn = () => {
    setViewport((current) =>
      zoomViewport(current, current.zoom * 1.2, {
        x: stageSize.width / 2,
        y: stageSize.height / 2
      })
    );
  };

  const handleZoomOut = () => {
    setViewport((current) =>
      zoomViewport(current, current.zoom / 1.2, {
        x: stageSize.width / 2,
        y: stageSize.height / 2
      })
    );
  };

  const handleResetViewport = () => {
    setViewport(resetViewport());
  };

  const handleAddPage = () => {
    addPage();
    setViewport(resetViewport());
    setSaveStatus("Unsaved changes");
  };

  const handleGoToPreviousPage = () => {
    if (previousPageId) {
      setActivePage(previousPageId);
      setViewport(resetViewport());
    }
  };

  const handleGoToNextPage = () => {
    if (nextPageId) {
      setActivePage(nextPageId);
      setViewport(resetViewport());
    }
  };

  const handleTogglePresenterMode = () => {
    if (
      !isPresenterMode &&
      toolState.activeTool !== "pen" &&
      toolState.activeTool !== "eraser" &&
      toolState.activeTool !== "pan"
    ) {
      setToolState((current) => ({ ...current, activeTool: "pen" }));
    }

    togglePresenterMode();
  };

  const handleProjectFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? [];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const contents = await readLessonInkFile(file);
      const loadedProject = deserializeLessonInkFile(contents);

      replaceBoard(loadedProject.board);
      setProject(loadedProject.project);
      setHistory(initialCanvasHistoryState);
      setViewport(resetViewport());
      setSaveStatus("Saved");
      setFileError(undefined);
      setFileMessage(`Opened ${file.name}.`);
    } catch (error) {
      setFileMessage(undefined);
      setFileError(error instanceof Error ? error.message : "Could not open the selected MushroomLearning file.");
    }
  };

  const handleImageFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? [];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const document = await importImageAsPageDocument({
        file,
        pageId: activePage.id,
        viewportWidth: stageSize.width,
        viewportHeight: stageSize.height
      });

      setPageDocument(activePage.id, document);
      setSaveStatus("Unsaved changes");
      setFileError(undefined);
      setFileMessage(`Imported ${file.name}.`);
    } catch (error) {
      setFileMessage(undefined);
      setFileError(error instanceof Error ? error.message : "Could not import the selected image.");
    }
  };

  return (
    <section className={getBoardPageClassName(isPresenterMode)}>
      <CanvasToolbar
        projectTitle={project.title}
        saveStatus={saveStatus}
        toolState={toolState}
        canUndo={history.undoStack.length > 0}
        canRedo={history.redoStack.length > 0}
        hasObjects={activePage.objects.length > 0}
        onToolChange={(activeTool: ToolType) => setToolState((current) => ({ ...current, activeTool }))}
        onPenColorChange={(penColor) => setToolState((current) => ({ ...current, penColor }))}
        onPenWidthChange={(penWidth) => setToolState((current) => ({ ...current, penWidth }))}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClearCanvas}
        onSaveProject={handleSaveProject}
        onOpenProject={handleOpenProject}
        onImportImage={handleImportImage}
        onExportPng={handleExportPng}
        isPresenterMode={isPresenterMode}
        pagePositionLabel={`Page ${activePageIndex + 1} / ${board.pages.length}`}
        zoomLabel={`${Math.round(viewport.zoom * 100)}%`}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetViewport={handleResetViewport}
        canGoPreviousPage={Boolean(previousPageId)}
        canGoNextPage={Boolean(nextPageId)}
        onPreviousPage={handleGoToPreviousPage}
        onNextPage={handleGoToNextPage}
        onAddPage={handleAddPage}
        onTogglePresenterMode={handleTogglePresenterMode}
      />
      <input
        ref={fileInputRef}
        accept=".mushroomlearning,.lessonink,application/json,application/vnd.mushroomlearning+json,application/vnd.lessonink+json"
        className="visually-hidden"
        type="file"
        onChange={handleProjectFileSelected}
      />
      <input
        ref={imageInputRef}
        accept="image/png,image/jpeg,.png,.jpg,.jpeg"
        className="visually-hidden"
        type="file"
        onChange={handleImageFileSelected}
      />
      {(fileMessage || fileError) && (
        <div
          className={fileError ? "board-file-message error" : "board-file-message"}
          role={fileError ? "alert" : "status"}
        >
          {fileError ?? fileMessage}
        </div>
      )}

      <div className="workspace">
        <div className={isPresenterMode ? "timer-floating-widget presenter-timer-widget" : "timer-floating-widget"}>
          <TimerPanel
            state={timerState}
            compact={isPresenterMode}
            onDurationChange={(seconds) => setTimerState((current) => setTimerDuration(current, seconds))}
            onStart={() => setTimerState(startTimer)}
            onPause={() => setTimerState(pauseTimer)}
            onReset={() => setTimerState(resetTimer)}
          />
        </div>
        <CanvasStage
          page={activePage}
          toolState={toolState}
          viewport={viewport}
          onViewportChange={setViewport}
          onStageSizeChange={setStageSize}
          onAddStroke={handleAddStroke}
          onEraseStrokes={handleEraseStrokes}
        />
      </div>
    </section>
  );
}
