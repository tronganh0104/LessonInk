interface PresenterModeProps {
  isPresenterMode: boolean;
}

export function PresenterMode({ isPresenterMode }: PresenterModeProps) {
  return (
    <section className="utility-panel">
      <h2>Presenter</h2>
      <p>{isPresenterMode ? "Clean sharing mode is active." : "Normal editing mode is active."}</p>
      <p className="todo-note">TODO: connect presenter mode to app-level state and hide nonessential UI.</p>
    </section>
  );
}
