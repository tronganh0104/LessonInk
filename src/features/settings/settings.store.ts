export interface SettingsState {
  autosaveEnabled: boolean;
  autosaveIntervalSeconds: number;
  defaultTool: "pen" | "select";
}

export const defaultSettings: SettingsState = {
  autosaveEnabled: true,
  autosaveIntervalSeconds: 30,
  defaultTool: "pen"
};
