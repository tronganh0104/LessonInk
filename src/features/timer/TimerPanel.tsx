import type { TimerState } from "./timer.store";

interface TimerPanelProps {
  state: TimerState;
  compact?: boolean;
  onDurationChange: (seconds: number) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function TimerPanel({ state, compact = false, onDurationChange, onStart, onPause, onReset }: TimerPanelProps) {
  const minutes = Math.max(1, Math.round(state.durationSeconds / 60));

  return (
    <section className={state.isFinished ? "utility-panel timer-finished" : "utility-panel"}>
      <h2>Timer</h2>
      <div className="timer-display">{formatTime(state.secondsRemaining)}</div>
      {!compact && (
        <label className="timer-duration">
          <span>Minutes</span>
          <input
            min="1"
            max="99"
            type="number"
            value={minutes}
            onChange={(event) => onDurationChange(Number(event.target.value) * 60)}
          />
        </label>
      )}
      <div className="action-row compact">
        <button className="secondary-button" type="button" onClick={state.isRunning ? onPause : onStart}>
          {state.isRunning ? "Pause" : state.secondsRemaining < state.durationSeconds ? "Resume" : "Start"}
        </button>
        <button className="secondary-button" type="button" onClick={onReset}>
          Reset
        </button>
      </div>
      {state.isFinished && <p className="timer-up" role="status">Time up</p>}
    </section>
  );
}
