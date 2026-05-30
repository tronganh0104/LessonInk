import { useEffect, useRef, useState } from "react";
import {
  FileImage,
  FilePlus,
  FileText,
  FolderOpen,
  HardDriveDownload,
  History,
  Settings,
  Timer,
  Upload
} from "lucide-react";
import type { AppRoute } from "../app/routes";
import { useBoard } from "../features/board/context/BoardContext";
import { readLessonInkFile } from "../features/documents/lessoninkFileService";
import { deserializeLessonInkFile } from "../features/documents/lessoninkSerializer";
import { readRecentFiles, writeRecentFiles, type RecentFile } from "../storage/recentFiles";

interface HomePageProps {
  onStartBoard: () => void;
  onOpenSettings: () => void;
  onNavigate: (route: AppRoute) => void;
}

export function HomePage({ onStartBoard, onOpenSettings, onNavigate }: HomePageProps) {
  const { replaceBoard } = useBoard();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);

  useEffect(() => {
    try {
      setRecentFiles(readRecentFiles().slice(0, 4));
    } catch {
      setRecentFiles([]);
    }
  }, []);

  const handleOpenClick = () => {
    fileInputRef.current?.click();
  };

  const handleStartWithImport = (kind: "image" | "pdf") => {
    window.sessionStorage.setItem("lessonink.pendingImport", kind);
    onNavigate("board");
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? [];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const contents = await readLessonInkFile(file);
      const loadedProject = deserializeLessonInkFile(contents);

      replaceBoard(loadedProject.board);
      const nextRecentFiles = [
        {
          path: file.name,
          title: loadedProject.project.title || file.name,
          openedAt: new Date().toISOString()
        },
        ...recentFiles.filter((recentFile) => recentFile.path !== file.name)
      ].slice(0, 6);
      writeRecentFiles(nextRecentFiles);
      setRecentFiles(nextRecentFiles);
      setError(undefined);
      onNavigate("board");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open the selected file.");
    }
  };

  return (
    <section className="home-page">
      <div className="home-dashboard">
        <div className="home-intro">
          <p className="home-eyebrow">Offline teaching workspace</p>
          <h1 className="home-title">Start the next live lesson.</h1>
          <p className="home-lead">
            Open a board, bring in class material, and get to writing with fewer clicks.
          </p>
        </div>

        {error && (
          <div className="home-error" role="alert">
            {error}
          </div>
        )}

        <div className="home-actions">
          <button className="primary-button" type="button" onClick={onStartBoard}>
            <FilePlus size={20} />
            <span>New board</span>
          </button>
          <button className="secondary-button action-button" type="button" onClick={handleOpenClick}>
            <FolderOpen size={20} />
            <span>Open file</span>
          </button>
          <button className="secondary-button action-button" type="button" onClick={() => handleStartWithImport("pdf")}>
            <FileText size={20} />
            <span>Import PDF</span>
          </button>
          <button className="secondary-button action-button" type="button" onClick={() => handleStartWithImport("image")}>
            <FileImage size={20} />
            <span>Import image</span>
          </button>
          <button className="secondary-button icon-only-action" type="button" onClick={onOpenSettings} title="Settings">
            <Settings size={20} />
          </button>
        </div>

        <input
          ref={fileInputRef}
          accept=".mushroomlearning,.lessonink,application/json,application/vnd.mushroomlearning+json,application/vnd.lessonink+json"
          className="visually-hidden"
          type="file"
          onChange={handleFileSelected}
        />

        <div className="home-quick-notes" aria-label="Teaching workflow">
          <div>
            <Upload size={18} />
            <span>Import class material</span>
          </div>
          <div>
            <Timer size={18} />
            <span>Run exercises with timer</span>
          </div>
          <div>
            <HardDriveDownload size={18} />
            <span>Save and export locally</span>
          </div>
        </div>
      </div>

      <div className="home-recent-panel" aria-label="Recent files">
        <div className="home-panel-header">
          <History size={18} />
          <h2>Recent files</h2>
        </div>
        {recentFiles.length > 0 ? (
          <ul className="recent-file-list">
            {recentFiles.map((file) => (
              <li key={`${file.path}-${file.openedAt}`}>
                <div>
                  <strong>{file.title}</strong>
                  <span>{new Date(file.openedAt).toLocaleString()}</span>
                </div>
                <button className="text-button recent-open-button" type="button" onClick={handleOpenClick}>
                  Open
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="recent-empty-state">
            <FolderOpen size={22} />
            <strong>No recent lessons yet</strong>
            <span>Open a local lesson file once and it will appear here.</span>
          </div>
        )}
      </div>
    </section>
  );
}
