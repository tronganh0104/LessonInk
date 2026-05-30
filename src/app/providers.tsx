import type { ReactNode } from "react";
import { BoardProvider } from "../features/board/context/BoardContext";
import { SettingsProvider } from "../features/settings/context/SettingsContext";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SettingsProvider>
      <BoardProvider>{children}</BoardProvider>
    </SettingsProvider>
  );
}
