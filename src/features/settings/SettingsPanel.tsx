import { HardDrive, Monitor, Palette } from "lucide-react";
import { useSettings } from "./context/SettingsContext";

export function SettingsPanel() {
  const { settings, updateSettings } = useSettings();

  return (
    <section className="settings-page">
      <div className="settings-heading">
        <p className="home-eyebrow">Workspace preferences</p>
        <h1>Settings</h1>
        <p>Keep the teaching surface predictable before you enter a live class.</p>
      </div>

      <div className="settings-grid">
        <section className="settings-section">
          <h2>
            <Palette size={16} />
            <span>Appearance</span>
          </h2>
          <div className="setting-row">
            <div className="setting-copy">
              <span>Theme</span>
              <small>Choose the app chrome theme. Lesson pages stay white for sharing.</small>
            </div>
            <div className="segmented-control" role="group" aria-label="Theme">
              <button
                className={settings.theme === "light" ? "segment active" : "segment"}
                type="button"
                onClick={() => updateSettings({ theme: "light" })}
              >
                Light
              </button>
              <button
                className={settings.theme === "dark" ? "segment active" : "segment"}
                type="button"
                onClick={() => updateSettings({ theme: "dark" })}
              >
                Dark
              </button>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>
            <HardDrive size={16} />
            <span>Storage & Backup</span>
          </h2>
          <div className="setting-row">
            <div className="setting-copy">
              <span>Autosave</span>
              <small>Keep a local recovery snapshot while you teach.</small>
            </div>
            <label className="toggle-control">
              <input
                checked={settings.autosaveEnabled}
                onChange={(event) => updateSettings({ autosaveEnabled: event.target.checked })}
                type="checkbox"
              />
              <span />
            </label>
          </div>

          <label className="setting-row">
            <div className="setting-copy">
              <span>Autosave interval</span>
              <small>Shorter intervals reduce data-loss risk during long lessons.</small>
            </div>
            <div className="select-control">
              <select
                value={settings.autosaveIntervalSeconds}
                onChange={(event) => updateSettings({ autosaveIntervalSeconds: Number(event.target.value) })}
              >
                <option value={10}>10 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={120}>2 minutes</option>
              </select>
            </div>
          </label>
        </section>

        <section className="settings-section">
          <h2>
            <Monitor size={16} />
            <span>Startup</span>
          </h2>
          <div className="setting-row">
            <div className="setting-copy">
              <span>Default tool</span>
              <small>Pick the first tool selected when a board opens.</small>
            </div>
            <div className="segmented-control" role="group" aria-label="Default tool">
              <button
                className={settings.defaultTool === "pen" ? "segment active" : "segment"}
                type="button"
                onClick={() => updateSettings({ defaultTool: "pen" })}
              >
                Pen
              </button>
              <button
                className={settings.defaultTool === "select" ? "segment active" : "segment"}
                type="button"
                onClick={() => updateSettings({ defaultTool: "select" })}
              >
                Pan
              </button>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
