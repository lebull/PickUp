import { createContext, useContext, useState } from 'react'

export type TimeFormat = '12h' | '24h'

export interface AppPreferencesContextValue {
  timeFormat: TimeFormat
  setTimeFormat: (fmt: TimeFormat) => void
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
  timeFormat: TimeFormat
  hiddenNames: boolean
}

function loadPrefs(): StoredPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredPrefs>
      return {
        timeFormat: parsed.timeFormat === '12h' ? '12h' : '24h',
        hiddenNames: typeof parsed.hiddenNames === 'boolean' ? parsed.hiddenNames : false,
      }
    }
  } catch {
    // ignore parse errors
  }
  return { timeFormat: '24h', hiddenNames: false }
}

function savePrefs(prefs: StoredPrefs): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch {
    // ignore storage errors (e.g. private browsing quota)
  }
}

export function useAppPreferencesState(): AppPreferencesContextValue {
  const [timeFormat, setTimeFormatState] = useState<TimeFormat>(() => loadPrefs().timeFormat)
  const [hiddenNames, setHiddenNamesState] = useState<boolean>(() => loadPrefs().hiddenNames)

  function setTimeFormat(fmt: TimeFormat) {
    setTimeFormatState(fmt)
    savePrefs({ timeFormat: fmt, hiddenNames })
  }

  function setHiddenNames(v: boolean) {
    setHiddenNamesState(v)
    savePrefs({ timeFormat, hiddenNames: v })
  }

  return { timeFormat, setTimeFormat, hiddenNames, setHiddenNames }
}
