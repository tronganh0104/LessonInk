export interface TimerState {
  mode: "countUp" | "countDown";
  secondsRemaining: number;
  isRunning: boolean;
}

export const initialTimerState: TimerState = {
  mode: "countDown",
  secondsRemaining: 300,
  isRunning: false
};
