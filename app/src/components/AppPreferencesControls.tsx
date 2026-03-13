import { useAppPreferences } from '../AppPreferencesContext.ts'

export function AppPreferencesControls() {
  const { timeFormat, setTimeFormat, hiddenNames, setHiddenNames } = useAppPreferences()

  return (
    <div className="app-prefs-controls">
      <div className="context-toggle" role="group" aria-label="Time format">
        <button
          type="button"
          className={`context-btn${timeFormat === '24h' ? ' active' : ''}`}
          onClick={() => setTimeFormat('24h')}
        >
          24h
        </button>
        <button
          type="button"
          className={`context-btn${timeFormat === '12h' ? ' active' : ''}`}
          onClick={() => setTimeFormat('12h')}
        >
          12h
        </button>
      </div>
      <button
        type="button"
        className={`hidden-names-btn${hiddenNames ? ' active' : ''}`}
        onClick={() => setHiddenNames(!hiddenNames)}
        title={hiddenNames ? 'Show DJ names' : 'Hide DJ names'}
        aria-pressed={hiddenNames}
      >
        {hiddenNames ? '🙈 Names Hidden' : '👁 Names Visible'}
      </button>
    </div>
  )
}
