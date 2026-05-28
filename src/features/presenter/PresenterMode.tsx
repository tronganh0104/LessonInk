interface PresenterModeProps {
  isPresenterMode: boolean;
}

export function PresenterMode({ isPresenterMode }: PresenterModeProps) {
  return (
    <section className="utility-panel">
      <h2>Presenter</h2>
      <p>{isPresenterMode ? "Clean sharing mode is active." : "Use Presenter for a cleaner shared window."}</p>
    </section>
  );
}
