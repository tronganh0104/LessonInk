export interface RecentFile {
  path: string;
  title: string;
  openedAt: string;
}

const RECENT_FILES_KEY = "lessonink.recentFiles";

export function readRecentFiles(): RecentFile[] {
  const rawFiles = window.localStorage.getItem(RECENT_FILES_KEY);
  return rawFiles ? (JSON.parse(rawFiles) as RecentFile[]) : [];
}

export function writeRecentFiles(files: RecentFile[]): void {
  // TODO: store recent files through Tauri app data APIs once desktop persistence is wired.
  window.localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(files));
}
