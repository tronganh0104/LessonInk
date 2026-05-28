import type { CanvasToolState, ToolType } from "../canvas.types";

interface CanvasToolbarProps {
  projectTitle: string;
  saveStatus: "Saved" | "Saving" | "Unsaved changes";
  toolState: CanvasToolState;
  canUndo: boolean;
  canRedo: boolean;
  hasObjects: boolean;
  onToolChange: (tool: ToolType) => void;
  onPenColorChange: (color: string) => void;
  onPenWidthChange: (width: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSaveProject: () => void;
  onOpenProject: () => void;
  onImportImage: () => void;
  onExportPng: () => void;
  isPresenterMode: boolean;
  pagePositionLabel: string;
  zoomLabel: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetViewport: () => void;
  canGoPreviousPage: boolean;
  canGoNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onAddPage: () => void;
  onTogglePresenterMode: () => void;
}

const teachingTools: Array<{
  id: ToolType;
  label: string;
  title: string;
}> = [
  {
    id: "pan",
    label: "Hand",
    title: "Pan the canvas"
  },
  {
    id: "pen",
    label: "Pen",
    title: "Draw freehand strokes"
  },
  {
    id: "eraser",
    label: "Eraser",
    title: "Erase whole strokes near the cursor"
  }
];

export function CanvasToolbar({
  projectTitle,
  saveStatus,
  toolState,
  canUndo,
  canRedo,
  hasObjects,
  onToolChange,
  onPenColorChange,
  onPenWidthChange,
  onUndo,
  onRedo,
  onClear,
  onSaveProject,
  onOpenProject,
  onImportImage,
  onExportPng,
  isPresenterMode,
  pagePositionLabel,
  zoomLabel,
  onZoomIn,
  onZoomOut,
  onResetViewport,
  canGoPreviousPage,
  canGoNextPage,
  onPreviousPage,
  onNextPage,
  onAddPage,
  onTogglePresenterMode
}: CanvasToolbarProps) {
  const toolRail = (
    <div className={isPresenterMode ? "tool-rail presenter-tool-rail" : "tool-rail"} role="group" aria-label="Teaching tools">
      {teachingTools.map((tool) => (
        <button
          className={toolState.activeTool === tool.id ? "rail-button active" : "rail-button"}
          key={tool.id}
          type="button"
          title={tool.title}
          aria-label={tool.label}
          aria-pressed={toolState.activeTool === tool.id}
          onClick={() => onToolChange(tool.id)}
        >
          {tool.label}
        </button>
      ))}

      {!isPresenterMode && (
        <div className="rail-pen-settings" aria-label="Pen settings">
          <input
            title="Pen color"
            aria-label="Pen color"
            type="color"
            value={toolState.penColor}
            onChange={(event) => onPenColorChange(event.target.value)}
          />
          <input
            title="Pen width"
            aria-label="Pen width"
            max="18"
            min="1"
            type="range"
            value={toolState.penWidth}
            onChange={(event) => onPenWidthChange(Number(event.target.value))}
          />
        </div>
      )}
    </div>
  );

  return (
    <>
      {!isPresenterMode && (
        <header className="board-topbar" aria-label="Project actions">
          <div className="board-brand">
            <strong>MushroomLearning</strong>
            <span>{projectTitle || "Untitled Lesson"}</span>
          </div>
          <span className={`save-status save-status-${saveStatus.toLowerCase().replace(/\s+/g, "-")}`}>
            {saveStatus}
          </span>
          <div className="topbar-actions" role="group" aria-label="Project actions">
            <button className="topbar-button secondary" type="button" onClick={onOpenProject}>
              Open
            </button>
            <button className="topbar-button secondary" type="button" onClick={onSaveProject}>
              Save
            </button>
            <button className="topbar-button secondary" type="button" onClick={onImportImage}>
              Import
            </button>
            <button className="topbar-button secondary" type="button" onClick={onExportPng}>
              Export
            </button>
            <button className="topbar-button primary" type="button" onClick={onTogglePresenterMode}>
              Presenter
            </button>
          </div>
        </header>
      )}

      {isPresenterMode && (
        <div className="presenter-live-bar" aria-label="Presenter controls">
          <div className="presenter-brand">MushroomLearning</div>
          <div className="presenter-actions" role="group" aria-label="Canvas history">
            <button className="tool-button" type="button" disabled={!canUndo} onClick={onUndo} title="Undo">
              Undo
            </button>
            <button className="tool-button" type="button" disabled={!canRedo} onClick={onRedo} title="Redo">
              Redo
            </button>
          </div>
          <div className="presenter-page-actions" role="group" aria-label="Presenter page navigation">
            <button className="tool-button" type="button" disabled={!canGoPreviousPage} onClick={onPreviousPage}>
              Previous
            </button>
            <span className="page-position" aria-live="polite">
              {pagePositionLabel}
            </span>
            <button className="tool-button" type="button" disabled={!canGoNextPage} onClick={onNextPage}>
              Next
            </button>
          </div>
          <button className="tool-button presenter-exit-button" type="button" onClick={onTogglePresenterMode}>
            Exit Presenter
          </button>
        </div>
      )}

      {toolRail}

      <div className="viewport-controls" role="group" aria-label="Canvas viewport">
        <button className="viewport-button" type="button" onClick={onZoomOut} title="Zoom out">
          -
        </button>
        <span className="zoom-readout" aria-live="polite">
          {zoomLabel}
        </span>
        <button className="viewport-button" type="button" onClick={onZoomIn} title="Zoom in">
          +
        </button>
        <button className="viewport-button reset" type="button" onClick={onResetViewport} title="Reset view">
          Reset
        </button>
      </div>

      {!isPresenterMode && (
        <div className="page-controls" role="group" aria-label="Page navigation">
          <button className="page-control-button" type="button" disabled={!canGoPreviousPage} onClick={onPreviousPage}>
            Previous
          </button>
          <span className="page-position" aria-live="polite">
            {pagePositionLabel}
          </span>
          <button className="page-control-button" type="button" disabled={!canGoNextPage} onClick={onNextPage}>
            Next
          </button>
          <button className="page-control-button add" type="button" onClick={onAddPage}>
            Add
          </button>
        </div>
      )}

      {!isPresenterMode && (
        <div className="canvas-history-controls" role="group" aria-label="Canvas history">
          <button className="tool-button" type="button" disabled={!canUndo} onClick={onUndo}>
            Undo
          </button>
          <button className="tool-button" type="button" disabled={!canRedo} onClick={onRedo}>
            Redo
          </button>
          <button className="tool-button danger" type="button" disabled={!hasObjects} onClick={onClear}>
            Clear
          </button>
        </div>
      )}
    </>
  );
}
