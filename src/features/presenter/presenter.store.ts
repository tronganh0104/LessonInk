import { useState } from "react";

export interface PresenterState {
  isPresenterMode: boolean;
}

export const initialPresenterState: PresenterState = {
  isPresenterMode: false
};

export function togglePresenterState(state: PresenterState): PresenterState {
  return {
    isPresenterMode: !state.isPresenterMode
  };
}

export function setPresenterModeState(state: PresenterState, isPresenterMode: boolean): PresenterState {
  if (state.isPresenterMode === isPresenterMode) {
    return state;
  }

  return {
    isPresenterMode
  };
}

export function getBoardPageClassName(isPresenterMode: boolean): string {
  return isPresenterMode ? "board-page presenter-active" : "board-page";
}

export function usePresenterStore() {
  const [state, setState] = useState<PresenterState>(initialPresenterState);

  return {
    isPresenterMode: state.isPresenterMode,
    togglePresenterMode: () => setState(togglePresenterState),
    setPresenterMode: (isPresenterMode: boolean) =>
      setState((current) => setPresenterModeState(current, isPresenterMode))
  };
}
