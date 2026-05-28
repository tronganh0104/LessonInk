import { describe, expect, it } from "vitest";
import {
  initialTimerState,
  pauseTimer,
  resetTimer,
  setTimerDuration,
  startTimer,
  tickTimer
} from "../../src/features/timer/timer.store";

describe("timer store", () => {
  it("sets a countdown duration and resets the remaining time", () => {
    const state = setTimerDuration(initialTimerState, 90);

    expect(state.durationSeconds).toBe(90);
    expect(state.secondsRemaining).toBe(90);
    expect(state.isRunning).toBe(false);
  });

  it("starts, pauses, resumes, and ticks down", () => {
    const started = startTimer(setTimerDuration(initialTimerState, 10));
    const ticked = tickTimer(started, 3);
    const paused = pauseTimer(ticked);

    expect(ticked.secondsRemaining).toBe(7);
    expect(paused.isRunning).toBe(false);
    expect(tickTimer(paused, 3)).toBe(paused);
    expect(startTimer(paused).isRunning).toBe(true);
  });

  it("marks time up and stops at zero", () => {
    const state = tickTimer(startTimer(setTimerDuration(initialTimerState, 5)), 8);

    expect(state.secondsRemaining).toBe(0);
    expect(state.isRunning).toBe(false);
    expect(state.isFinished).toBe(true);
  });

  it("resets to the configured duration", () => {
    const state = tickTimer(startTimer(setTimerDuration(initialTimerState, 15)), 5);

    expect(resetTimer(state)).toMatchObject({
      secondsRemaining: 15,
      isRunning: false,
      isFinished: false
    });
  });
});
