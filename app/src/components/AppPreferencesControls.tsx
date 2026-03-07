import { useAppPreferences } from '../AppPreferencesContext.ts'

export function AppPreferencesControls() {
  const { appContext, setAppContext, hiddenNames, setHiddenNames } = useAppPreferences()

  return (
    <div className="app-prefs-controls">
      <div className="context-toggle" role="group" aria-label="App context">
        <button
          type="button"
          className={`context-btn${appContext === 'standard' ? ' active' : ''}`}
          onClick={() => setAppContext('standard')}
        >
          Standard
        </button>
        <button
          type="button"
          className={`context-btn${appContext === 'moonlight' ? ' active' : ''}`}
          onClick={() => setAppContext('moonlight')}
        >
          🌙 Moonlight
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
