import { useRef, useState, type ChangeEvent } from 'react'
import type { AppSettings, ColorSchemePreference } from '../types'

type SettingsPageProps = {
  settings: AppSettings
  onUpdateSettings: (partial: Partial<AppSettings>) => void
  onExportData: () => void
  onImportData: (jsonText: string) => void
  onClearAllData: () => void
  storageInsights: {
    trackedDataBytes: number
    totalUsedBytes: number
    totalQuotaBytes: number | null
    remainingBytes: number | null
    categoryUsage: Array<{
      id: string
      label: string
      bytes: number
      percent: number
    }>
  }
}

function SettingsPage({
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
  onClearAllData,
  storageInsights,
}: SettingsPageProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [importStatus, setImportStatus] = useState('')

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      const text = await file.text()
      onImportData(text)
      setImportStatus('Backup imported successfully.')
    } catch {
      setImportStatus('Import failed. Use a valid backup JSON file.')
    }

    event.target.value = ''
  }

  const handleClearData = () => {
    const confirmed = window.confirm(
      'Clear all saved snippets, links, login, and template data from this device?',
    )
    if (!confirmed) {
      return
    }

    onClearAllData()
    setImportStatus('All saved data was cleared.')
  }

  const formatBytes = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB']
    let value = bytes
    let unitIndex = 0

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024
      unitIndex += 1
    }

    return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`
  }

  const overallPercent =
    storageInsights.totalQuotaBytes && storageInsights.totalQuotaBytes > 0
      ? Math.min(
          (storageInsights.totalUsedBytes / storageInsights.totalQuotaBytes) * 100,
          100,
        )
      : 0

  return (
    <section className="card">
      <h2>Settings</h2>
      <p>Control privacy, link behavior, and local backup options.</p>

      <div className="storage-card">
        <h3>Local Data Usage (Estimated)</h3>
        <p>
          Browser estimate: currently using{' '}
          <strong>{formatBytes(storageInsights.totalUsedBytes)}</strong>
          {storageInsights.remainingBytes !== null && (
            <>
              {' '}
              with about{' '}
              <strong>{formatBytes(storageInsights.remainingBytes)}</strong> left.
            </>
          )}
        </p>
        <div className="usage-bar" role="presentation" aria-hidden="true">
          <div
            className="usage-bar-fill"
            style={{ width: `${overallPercent}%` }}
          ></div>
        </div>
        <p className="storage-note">
          Estimated browser quota can change. Breakdown below is exact for
          Career Caddie tracked categories.
        </p>
        <ul className="usage-breakdown">
          {storageInsights.categoryUsage.map((entry) => (
            <li key={entry.id} className="usage-row">
              <div className="usage-label-row">
                <span>{entry.label}</span>
                <span>
                  {formatBytes(entry.bytes)} ({entry.percent.toFixed(1)}%)
                </span>
              </div>
              <div className="usage-bar small" role="presentation" aria-hidden="true">
                <div
                  className="usage-bar-fill"
                  style={{ width: `${entry.percent}%` }}
                ></div>
              </div>
            </li>
          ))}
        </ul>
        <p className="storage-note">
          Exact tracked app categories total:{' '}
          {formatBytes(storageInsights.trackedDataBytes)}
        </p>
      </div>

      <div className="settings-list">
        <div className="setting-item">
          <label className="setting-row setting-row--theme">
            <span className="setting-label">Appearance</span>
            <select
              className="setting-theme-select"
              value={settings.colorScheme}
              aria-label="Color theme"
              onChange={(event) =>
                onUpdateSettings({
                  colorScheme: event.target.value as ColorSchemePreference,
                })
              }
            >
              <option value="system">Match device</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <p className="setting-help">
            Choose light or dark, or follow your system setting. This applies only to
            Career Caddie on this device.
          </p>
        </div>

        <div className="setting-item">
          <label className="setting-row">
            <span className="setting-label">Hide saved passwords in the login list</span>
            <span className="toggle-control">
              <input
                className="toggle-input"
                type="checkbox"
                checked={settings.hidePasswords}
                onChange={(event) =>
                  onUpdateSettings({ hidePasswords: event.target.checked })
                }
              />
              <span className="toggle-slider" aria-hidden="true"></span>
            </span>
          </label>
          <p className="setting-help">
            When enabled, passwords are masked with dots in the login vault. When
            disabled, passwords are shown as plain text.
          </p>
        </div>

        <div className="setting-item">
          <label className="setting-row">
            <span className="setting-label">
              Open link when clicking "Go" in a new tab
            </span>
            <span className="toggle-control">
              <input
                className="toggle-input"
                type="checkbox"
                checked={settings.openLinksInNewTab}
                onChange={(event) =>
                  onUpdateSettings({ openLinksInNewTab: event.target.checked })
                }
              />
              <span className="toggle-slider" aria-hidden="true"></span>
            </span>
          </label>
          <p className="setting-help">
            When enabled, the Go button opens links in a new tab. When disabled,
            links open in the current tab.
          </p>
        </div>

        <div className="setting-item">
          <label className="setting-row">
            <span className="setting-label">
              Scrape and save website icons for new links
            </span>
            <span className="toggle-control">
              <input
                className="toggle-input"
                type="checkbox"
                checked={settings.scrapeIconsOnSave}
                onChange={(event) =>
                  onUpdateSettings({ scrapeIconsOnSave: event.target.checked })
                }
              />
              <span className="toggle-slider" aria-hidden="true"></span>
            </span>
          </label>
          <p className="setting-help">
            When enabled, new saved links attempt to fetch a site icon. When
            disabled, links save faster and use a letter icon fallback.
          </p>
        </div>
      </div>

      <div className="settings-actions">
        <button type="button" onClick={onExportData}>
          Export Backup
        </button>
        <button type="button" onClick={handleImportClick}>
          Import Backup
        </button>
        <button type="button" className="danger" onClick={handleClearData}>
          Clear All Data
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden-input"
        onChange={handleImportFile}
      />

      {importStatus && <p className="status-message">{importStatus}</p>}
    </section>
  )
}

export default SettingsPage
