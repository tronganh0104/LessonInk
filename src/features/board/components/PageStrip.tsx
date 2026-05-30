import React from "react";
import { Plus, ChevronUp, ChevronDown, Minus, RotateCw } from "lucide-react";
import type { Board } from "../board.types";

interface PageStripProps {
  board: Board;
  activePageIndex: number;
  viewportZoom: number;
  isCollapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
  onAddPage: () => void;
  onSelectPage: (pageId: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function PageStrip({
  board,
  activePageIndex,
  viewportZoom,
  isCollapsed,
  onToggleCollapse,
  onAddPage,
  onSelectPage,
  onZoomIn,
  onZoomOut,
  onResetZoom
}: PageStripProps) {
  if (isCollapsed) {
    return (
      <nav className="page-strip collapsed" aria-label="Pages">
        <button
          className="page-strip-handle"
          type="button"
          onClick={() => onToggleCollapse(false)}
          aria-expanded="false"
          title="Show pages"
        >
          <span className="page-handle-label">{`Page ${activePageIndex + 1} / ${board.pages.length}`}</span>
          <ChevronUp size={14} />
        </button>
      </nav>
    );
  }

  return (
    <nav className="page-strip" aria-label="Pages">
      <div className="page-strip-summary">
        <span className="page-count-label">{`Page ${activePageIndex + 1} / ${board.pages.length}`}</span>
        <div className="page-summary-actions">
          <button className="page-add-button" type="button" onClick={onAddPage} title="Add page">
            <Plus size={14} />
            <span>Add page</span>
          </button>
          <button
            className="page-collapse-button"
            type="button"
            onClick={() => onToggleCollapse(true)}
            aria-expanded="true"
            title="Hide pages"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      <div
        className="page-strip-scroll"
        onWheel={(event) => {
          event.currentTarget.scrollLeft += event.deltaY;
        }}
      >
        {board.pages.map((page, index) => (
          <button
            className={page.id === board.activePageId ? "page-thumbnail active" : "page-thumbnail"}
            key={page.id}
            type="button"
            onClick={() => onSelectPage(page.id)}
            aria-current={page.id === board.activePageId ? "page" : undefined}
          >
            <div className="page-thumbnail-preview">
              {page.document ? (
                <img src={page.document.source} alt="" />
              ) : (
                <div className="page-thumbnail-blank" />
              )}
            </div>
            <span className="page-thumbnail-number">{index + 1}</span>
          </button>
        ))}
      </div>

      <div className="page-strip-zoom">
        <div className="zoom-controls">
          <button className="zoom-button" type="button" onClick={onZoomOut} title="Zoom out">
            <Minus size={14} />
          </button>
          <span className="zoom-value">
            {`${Math.round(viewportZoom * 100)}%`}
          </span>
          <button className="zoom-button" type="button" onClick={onZoomIn} title="Zoom in">
            <Plus size={14} />
          </button>
          <button className="zoom-reset-button" type="button" onClick={onResetZoom} title="Reset view">
            <RotateCw size={14} />
          </button>
        </div>
      </div>
    </nav>
  );
}
