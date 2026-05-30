import { useState } from "react";
import { BoardPage } from "../pages/BoardPage";
import { HomePage } from "../pages/HomePage";
import { SettingsPage } from "../pages/SettingsPage";
import { AppHeader } from "../shared/components/AppHeader";
import { AppProviders } from "./providers";
import type { AppRoute } from "./routes";
import { routes } from "./routes";

function AppContent() {
  const [activeRoute, setActiveRoute] = useState<AppRoute>("home");

  return (
    <div className="app-shell">
      {activeRoute !== "board" && <AppHeader activeRoute={activeRoute} routes={routes} onNavigate={setActiveRoute} />}
      <main className="app-main">
        {activeRoute === "home" && (
          <HomePage 
            onStartBoard={() => setActiveRoute("board")} 
            onOpenSettings={() => setActiveRoute("settings")} 
            onNavigate={setActiveRoute}
          />
        )}
        {activeRoute === "board" && <BoardPage />}
        {activeRoute === "settings" && <SettingsPage />}
      </main>
    </div>
  );
}

export function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}
