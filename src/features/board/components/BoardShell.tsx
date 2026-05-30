import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { initialCanvasToolState } from "../../canvas/canvas.store";
import { CanvasStage } from "../../canvas/components/CanvasStage";
import { CanvasToolbar } from "../../canvas/components/CanvasToolbar";
import type { CanvasObject, ToolType } from "../../canvas/canvas.types";
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
import { exportBoardToPdf, getDefaultPdfExportName } from "../../documents/exporters/pdfExporter";
import { exportPageToPng } from "../../documents/exporters/pngExporter";
import { importImageAsPageDocument } from "../../documents/importers/imageImporter";
import { importPdfAsBoardPages, readPdfImportMetadata } from "../../documents/importers/pdfImporter";
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
import { useBoard } from "../context/BoardContext";
import { useSettings } from "../../settings/context/SettingsContext";
import { clearAutosaveSnapshot, readAutosaveSnapshot, writeAutosaveSnapshot } from "../../../storage/autosave";
import { readRecentFiles, writeRecentFiles } from "../../../storage/recentFiles";
import { PageStrip } from "./PageStrip";
import { PdfImportModal } from "./PdfImportModal";
import { RecoveryModal } from "./RecoveryModal";

interface PendingRecoveryData {
  board: any;
  project: LessonInkFileProjectMetadata;
}

interface PendingPdfImport {
  file: File;
  fileName: string;
  totalPages?: number;
  isReadingMetadata: boolean;
  isImporting: boolean;
  error?: string;
}

export function BoardShell() {
  const {
    board,
    activePage,
    addPage,
    replaceBoard,
    replacePages,
    setActivePage,
    setPageDocument,
    setPageObjects,
    project,
    setProject
  } = useBoard();
  const { settings } = useSettings();
  const { isPresenterMode, togglePresenterMode } = usePresenterStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const hasCheckedAutosaveRef = useRef(false);
  const latestBoardRef = useRef(board);
  const latestProjectRef = useRef(project);
  const [toolState, setToolState] = useState(() => ({
    ...initialCanvasToolState,
    activeTool: (settings.defaultTool === "select" ? "pan" : "pen") as ToolType
  }));
  const [history, setHistory] = useState(initialCanvasHistoryState);
  const [viewport, setViewport] = useState(resetViewport);
  const [stageSize, setStageSize] = useState({ width: 960, height: 680 });
  const [timerState, setTimerState] = useState(initialTimerState);
  const [isPageStripCollapsed, setIsPageStripCollapsed] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving" | "Unsaved changes">("Saved");
  const [pendingRecovery, setPendingRecovery] = useState<PendingRecoveryData | null>(null);
  const [pendingPdfImport, setPendingPdfImport] = useState<PendingPdfImport | null>(null);
  const [fileMessage, setFileMessage] = useState<string | undefined>(undefined);
  const [fileError, setFileError] = useState<string | undefined>(undefined);
  const activePageIndex = Math.max(
    board.pages.findIndex((page) => page.id === board.activePageId),
    0
  );
  const previousPageId = getAdjacentPageId(board, "previous");
  const nextPageId = getAdjacentPageId(board, "next");

  useEffect(() => {
    latestBoardRef.current = board;
    latestProjectRef.current = project;
  }, [board, project]);

  // Sync initial toolState when defaultTool setting changes
  useEffect(() => {
    setToolState((current) => ({
      ...current,
      activeTool: (settings.defaultTool === "select" ? "pan" : "pen") as ToolType
    }));
  }, [settings.defaultTool]);

  useEffect(() => {
    document.body.classList.toggle("presenter-mode-active", isPresenterMode);

    return () => document.body.classList.remove("presenter-mode-active");
  }, [isPresenterMode]);

  useEffect(() => {
    if (hasCheckedAutosaveRef.current) {
      return;
    }

    hasCheckedAutosaveRef.current = true;
    const snapshot = readAutosaveSnapshot();

    if (!snapshot) {
      return;
    }

    setPendingRecovery(snapshot);
  }, []);

  useEffect(() => {
    const pendingImport = window.sessionStorage.getItem("lessonink.pendingImport");

    if (!pendingImport) {
      return;
    }

    window.sessionStorage.removeItem("lessonink.pendingImport");
    window.setTimeout(() => {
      if (pendingImport === "pdf") {
        pdfInputRef.current?.click();
      }

      if (pendingImport === "image") {
        imageInputRef.current?.click();
      }
    }, 0);
  }, []);

  useEffect(() => {
    if (!settings.autosaveEnabled || saveStatus !== "Unsaved changes") {
      return undefined;
    }

    const intervalMs = settings.autosaveIntervalSeconds * 1000;
    const intervalId = window.setInterval(() => {
      setSaveStatus("Saving");
      const didSave = writeAutosaveSnapshot(latestBoardRef.current, latestProjectRef.current);
      setSaveStatus(didSave ? "Saved" : "Unsaved changes");
      if (!didSave) {
        setFileError("Autosave could not write a recovery snapshot. Save or export your lesson soon.");
      }
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [saveStatus, settings.autosaveEnabled, settings.autosaveIntervalSeconds]);

  useEffect(() => {
    if (!timerState.isRunning) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setTimerState((current) => tickTimer(current));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timerState.isRunning]);

  useEffect(() => {
    if (!fileMessage || fileError) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setFileMessage(undefined);
    }, 3200);

    return () => window.clearTimeout(timeoutId);
  }, [fileError, fileMessage]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore keypresses inside input/textarea/select
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") {
        return;
      }

      if (event.key === "PageUp" || (event.key === "ArrowLeft" && event.altKey)) {
        event.preventDefault();
        handleGoToPreviousPage();
      } else if (event.key === "PageDown" || (event.key === "ArrowRight" && event.altKey)) {
        event.preventDefault();
        handleGoToNextPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previousPageId, nextPageId, activePageIndex]);

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

  const handleAddObject = (object: CanvasObject) => {
    const before = activePage.objects;
    const after = [...before, object];

    commitObjects(activePage.id, before, after, {
      type: "addObject",
      pageId: activePage.id,
      objectId: object.id
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
    clearAutosaveSnapshot();
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

  const handleImportPdf = () => {
    pdfInputRef.current?.click();
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

  const handleExportPdf = async () => {
    try {
      await exportBoardToPdf({
        board,
        width: stageSize.width,
        height: stageSize.height,
        fileName: getDefaultPdfExportName()
      });
      setFileError(undefined);
      setFileMessage("PDF export started.");
    } catch (error) {
      setFileMessage(undefined);
      setFileError(error instanceof Error ? error.message : "Could not export the lesson as PDF.");
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
      toolState.activeTool !== "highlighter" &&
      toolState.activeTool !== "text" &&
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
      writeRecentFiles([
        {
          path: file.name,
          title: loadedProject.project.title || file.name,
          openedAt: new Date().toISOString()
        },
        ...readRecentFiles().filter((recentFile) => recentFile.path !== file.name)
      ].slice(0, 6));
      setHistory(initialCanvasHistoryState);
      setViewport(resetViewport());
      clearAutosaveSnapshot();
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

  const handlePdfFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? [];
    event.target.value = "";

    if (!file) {
      return;
    }

    setPendingPdfImport({
      file,
      fileName: file.name,
      isReadingMetadata: true,
      isImporting: false
    });
    setFileMessage(undefined);
    setFileError(undefined);

    try {
      const metadata = await readPdfImportMetadata(file);

      setPendingPdfImport((current) =>
        current?.file === file
          ? {
              ...current,
              totalPages: metadata.totalPages,
              isReadingMetadata: false,
              error: undefined
            }
          : current
      );
    } catch (error) {
      setPendingPdfImport((current) =>
        current?.file === file
          ? {
              ...current,
              isReadingMetadata: false,
              error: error instanceof Error ? error.message : "Could not read the selected PDF."
            }
          : current
      );
    }
  };

  const handleConfirmPdfImport = async (pageNumbers?: number[]) => {
    const pendingImport = pendingPdfImport;

    if (!pendingImport || pendingImport.isReadingMetadata || pendingImport.isImporting) {
      return;
    }

    try {
      const hasExistingWork = board.pages.some((page) => page.objects.length > 0 || page.document);

      if (hasExistingWork && !window.confirm("Importing this PDF will replace the current board pages. Continue?")) {
        return;
      }

      setPendingPdfImport((current) => (current ? { ...current, isImporting: true, error: undefined } : current));
      const pages = await importPdfAsBoardPages({ file: pendingImport.file, pageNumbers });

      replacePages(pages);
      setHistory(initialCanvasHistoryState);
      setViewport(resetViewport());
      setSaveStatus("Unsaved changes");
      setFileError(undefined);
      setFileMessage(`Imported ${pages.length} PDF page${pages.length === 1 ? "" : "s"} from ${pendingImport.fileName}.`);
      setPendingPdfImport(null);
    } catch (error) {
      setPendingPdfImport((current) =>
        current
          ? {
              ...current,
              isImporting: false,
              error: error instanceof Error ? error.message : "Could not import the selected PDF."
            }
          : current
      );
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
        onPenColorChange={(color) =>
          setToolState((current) =>
            current.activeTool === "highlighter"
              ? { ...current, highlighterColor: color }
              : current.activeTool === "text"
                ? { ...current, textColor: color }
                : { ...current, penColor: color }
          )
        }
        onPenWidthChange={(value) =>
          setToolState((current) =>
            current.activeTool === "highlighter"
              ? { ...current, highlighterWidth: value }
              : current.activeTool === "text"
                ? { ...current, textSize: value }
                : { ...current, penWidth: value }
          )
        }
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClearCanvas}
        onSaveProject={handleSaveProject}
        onOpenProject={handleOpenProject}
        onImportImage={handleImportImage}
        onImportPdf={handleImportPdf}
        onExportPng={handleExportPng}
        onExportPdf={handleExportPdf}
        isPresenterMode={isPresenterMode}
        pagePositionLabel={`Page ${activePageIndex + 1} / ${board.pages.length}`}
        canGoPreviousPage={Boolean(previousPageId)}
        canGoNextPage={Boolean(nextPageId)}
        onPreviousPage={handleGoToPreviousPage}
        onNextPage={handleGoToNextPage}
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
      <input
        ref={pdfInputRef}
        accept="application/pdf,.pdf"
        className="visually-hidden"
        type="file"
        onChange={handlePdfFileSelected}
      />
      
      {(fileMessage || fileError) && (
        <div
          className={fileError ? "board-file-message error" : "board-file-message"}
          role={fileError ? "alert" : "status"}
        >
          {fileError ?? fileMessage}
        </div>
      )}

      <div className={isPageStripCollapsed && !isPresenterMode ? "workspace pages-collapsed" : "workspace"}>
        {!isPresenterMode && (
          <PageStrip
            board={board}
            activePageIndex={activePageIndex}
            viewportZoom={viewport.zoom}
            isCollapsed={isPageStripCollapsed}
            onToggleCollapse={setIsPageStripCollapsed}
            onAddPage={handleAddPage}
            onSelectPage={(pageId) => {
              setActivePage(pageId);
              setViewport(resetViewport());
            }}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={handleResetViewport}
          />
        )}
        
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
          onAddObject={handleAddObject}
          onEraseStrokes={handleEraseStrokes}
        />
      </div>

      {pendingRecovery && (
        <RecoveryModal
          projectTitle={pendingRecovery.project.title}
          onRecover={() => {
            replaceBoard(pendingRecovery.board);
            setProject(pendingRecovery.project);
            setHistory(initialCanvasHistoryState);
            setViewport(resetViewport());
            setSaveStatus("Unsaved changes");
            setFileMessage("Recovered unsaved lesson.");
            setFileError(undefined);
            setPendingRecovery(null);
          }}
          onDiscard={() => {
            clearAutosaveSnapshot();
            setPendingRecovery(null);
          }}
        />
      )}

      {pendingPdfImport && (
        <PdfImportModal
          error={pendingPdfImport.error}
          fileName={pendingPdfImport.fileName}
          isImporting={pendingPdfImport.isImporting}
          isReadingMetadata={pendingPdfImport.isReadingMetadata}
          totalPages={pendingPdfImport.totalPages}
          onCancel={() => setPendingPdfImport(null)}
          onImport={handleConfirmPdfImport}
        />
      )}
    </section>
  );
}
