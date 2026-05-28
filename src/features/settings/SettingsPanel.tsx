import { defaultSettings } from "./settings.store";

export function SettingsPanel() {
  return (
    <section className="settings-page">
      <h1>Settings</h1>
      <div className="settings-grid">
        <label>
          <span>Autosave</span>
          <input checked={defaultSettings.autosaveEnabled} readOnly type="checkbox" />
        </label>
        <label>
          <span>Autosave interval</span>
          <input readOnly type="text" value={`${defaultSettings.autosaveIntervalSeconds}s`} />
        </label>
        <label>
          <span>Default tool</span>
          <input readOnly type="text" value={defaultSettings.defaultTool} />
        </label>
      </div>
      <p className="todo-note">TODO: persist local settings without login or cloud sync.</p>
    </section>
  );
}
