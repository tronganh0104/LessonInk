import type { AppRoute, RouteDefinition } from "../../app/routes";

interface AppHeaderProps {
  activeRoute: AppRoute;
  routes: RouteDefinition[];
  onNavigate: (route: AppRoute) => void;
}

export function AppHeader({ activeRoute, routes, onNavigate }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div>
        <strong>LessonInk</strong>
        <span>Desktop</span>
      </div>
      <nav aria-label="Primary navigation">
        {routes.map((route) => (
          <button
            className={route.id === activeRoute ? "nav-button active" : "nav-button"}
            key={route.id}
            type="button"
            onClick={() => onNavigate(route.id)}
          >
            {route.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
