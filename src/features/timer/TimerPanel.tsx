import { useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);
  const minutes = Math.max(1, Math.round(state.durationSeconds / 60));
  const primaryLabel = state.isRunning ? "Pause" : state.secondsRemaining < state.durationSeconds ? "Resume" : "Start";

  return (
    <section className={state.isFinished ? "utility-panel timer-panel timer-finished" : "utility-panel timer-panel"}>
      <div className="timer-core">
        <span className="timer-label">Timer</span>
        <button
          className="timer-display-button"
          type="button"
          onClick={() => !compact && setIsExpanded((current) => !current)}
          aria-expanded={compact ? undefined : isExpanded}
          title={compact ? "Timer" : "Timer settings"}
        >
          {formatTime(state.secondsRemaining)}
        </button>
        <div className="action-row compact">
          <button
            className="secondary-button timer-control"
            type="button"
            onClick={state.isRunning ? onPause : onStart}
            title={state.isRunning ? "Pause timer" : "Start timer"}
            aria-label={state.isRunning ? "Pause timer" : "Start timer"}
          >
            {compact ? (
              state.isRunning ? <Pause size={14} /> : <Play size={14} fill="currentColor" />
            ) : (
              primaryLabel
            )}
          </button>
          <button className="secondary-button timer-control" type="button" onClick={onReset} title="Reset timer" aria-label="Reset timer">
            {compact ? <RotateCcw size={14} /> : "Reset"}
          </button>
        </div>
        {!compact && (
          <button className="timer-link-button" type="button" onClick={() => setIsExpanded((current) => !current)}>
            {isExpanded ? "Hide" : "Set"}
          </button>
        )}
      </div>
      {!compact && isExpanded && (
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
      {state.isFinished && <p className="timer-up" role="status">Time up</p>}
    </section>
  );
}
