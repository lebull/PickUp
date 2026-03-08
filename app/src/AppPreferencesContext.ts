import { createContext, useContext, useState } from 'react'

export type AppContextMode = 'standard' | 'moonlight'

export interface AppPreferencesContextValue {
  appContext: AppContextMode
  setAppContext: (ctx: AppContextMode) => void
  hiddenNames: boolean
  setHiddenNames: (v: boolean) => void
}

export const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null)

export function useAppPreferences(): AppPreferencesContextValue {
  const ctx = useContext(AppPreferencesContext)
  if (!ctx) throw new Error('useAppPreferences must be used inside AppPreferencesProvider')
  return ctx
}

const PREFS_KEY = 'pickup_prefs_v1'

interface StoredPrefs {
  appContext: AppContextMode
  hiddenNames: boolean
}

function loadPrefs(): StoredPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredPrefs>
      return {
        appContext: parsed.appContext === 'moonlight' ? 'moonlight' : 'standard',
        hiddenNames: typeof parsed.hiddenNames === 'boolean' ? parsed.hiddenNames : false,
      }
    }
  } catch {
    // ignore parse errors
  }
  return { appContext: 'standard', hiddenNames: false }
}

function savePrefs(prefs: StoredPrefs): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch {
    // ignore storage errors (e.g. private browsing quota)
  }
}

export function useAppPreferencesState(): AppPreferencesContextValue {
  const [appContext, setAppContextState] = useState<AppContextMode>(() => loadPrefs().appContext)
  const [hiddenNames, setHiddenNamesState] = useState<boolean>(() => loadPrefs().hiddenNames)

  function setAppContext(ctx: AppContextMode) {
    setAppContextState(ctx)
    savePrefs({ appContext: ctx, hiddenNames })
  }

  function setHiddenNames(v: boolean) {
    setHiddenNamesState(v)
    savePrefs({ appContext, hiddenNames: v })
  }

  return { appContext, setAppContext, hiddenNames, setHiddenNames }
}
