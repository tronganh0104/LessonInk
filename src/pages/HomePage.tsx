interface HomePageProps {
  onStartBoard: () => void;
  onOpenSettings: () => void;
}

export function HomePage({ onStartBoard, onOpenSettings }: HomePageProps) {
  return (
    <section className="home-page">
      <div className="home-copy">
        <p className="eyebrow">Offline-first teaching board</p>
        <h1>LessonInk Desktop</h1>
        <p>
          A local whiteboard workspace for teachers who share their app window during live online classes.
        </p>
        <div className="action-row">
          <button className="primary-button" type="button" onClick={onStartBoard}>
            New board
          </button>
          <button className="secondary-button" type="button">
            Open local file
          </button>
          <button className="secondary-button" type="button" onClick={onOpenSettings}>
            Settings
          </button>
        </div>
      </div>
      <div className="home-panel" aria-label="MVP focus">
        <h2>MVP focus</h2>
        <ul>
          <li>Smooth writing and annotation</li>
          <li>PDF/image lesson material</li>
          <li>Clean presenter mode</li>
          <li>Local save, autosave, and export</li>
        </ul>
      </div>
    </section>
  );
}
