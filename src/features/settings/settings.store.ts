export interface SettingsState {
  autosaveEnabled: boolean;
  autosaveIntervalSeconds: number;
  defaultTool: "pen" | "select";
  theme: "light" | "dark";
}

export const defaultSettings: SettingsState = {
  autosaveEnabled: true,
  autosaveIntervalSeconds: 30,
  defaultTool: "pen",
  theme: "light"
};
