export interface TimerState {
  mode: "countDown";
  durationSeconds: number;
  secondsRemaining: number;
  isRunning: boolean;
  isFinished: boolean;
}

export const initialTimerState: TimerState = {
  mode: "countDown",
  durationSeconds: 300,
  secondsRemaining: 300,
  isRunning: false,
  isFinished: false
};

export function setTimerDuration(state: TimerState, durationSeconds: number): TimerState {
  const safeDuration = Math.max(1, Math.min(5999, Math.round(durationSeconds)));

  return {
    ...state,
    durationSeconds: safeDuration,
    secondsRemaining: safeDuration,
    isRunning: false,
    isFinished: false
  };
}

export function startTimer(state: TimerState): TimerState {
  if (state.secondsRemaining <= 0) {
    return {
      ...state,
      secondsRemaining: state.durationSeconds,
      isRunning: true,
      isFinished: false
    };
  }

  return {
    ...state,
    isRunning: true,
    isFinished: false
  };
}

export function pauseTimer(state: TimerState): TimerState {
  return {
    ...state,
    isRunning: false
  };
}

export function resetTimer(state: TimerState): TimerState {
  return {
    ...state,
    secondsRemaining: state.durationSeconds,
    isRunning: false,
    isFinished: false
  };
}

export function tickTimer(state: TimerState, elapsedSeconds = 1): TimerState {
  if (!state.isRunning) {
    return state;
  }

  const secondsRemaining = Math.max(0, state.secondsRemaining - Math.max(0, elapsedSeconds));

  return {
    ...state,
    secondsRemaining,
    isRunning: secondsRemaining > 0,
    isFinished: secondsRemaining === 0
  };
}
