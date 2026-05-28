import { initialTimerState } from "./timer.store";

export function TimerPanel() {
  const minutes = Math.floor(initialTimerState.secondsRemaining / 60);

  return (
    <section className="utility-panel">
      <h2>Timer</h2>
      <div className="timer-display">{minutes}:00</div>
      <div className="action-row compact">
        <button className="secondary-button" type="button">
          Start
        </button>
        <button className="secondary-button" type="button">
          Reset
        </button>
      </div>
      <p className="todo-note">TODO: implement countdown/count-up timer state.</p>
    </section>
  );
}
