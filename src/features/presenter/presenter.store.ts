import { useState } from "react";

export interface PresenterState {
  isPresenterMode: boolean;
}

export function usePresenterStore() {
  const [state, setState] = useState<PresenterState>({ isPresenterMode: false });

  return {
    isPresenterMode: state.isPresenterMode,
    togglePresenterMode: () =>
      setState((current) => ({
        isPresenterMode: !current.isPresenterMode
      }))
  };
}
