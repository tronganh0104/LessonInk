export type AppRoute = "home" | "board" | "settings";

export interface RouteDefinition {
  id: AppRoute;
  label: string;
}

export const routes: RouteDefinition[] = [
  { id: "home", label: "Home" },
  { id: "board", label: "Board" },
  { id: "settings", label: "Settings" }
];
