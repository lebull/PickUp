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

export function useAppPreferencesState(): AppPreferencesContextValue {
  const [appContext, setAppContext] = useState<AppContextMode>('standard')
  const [hiddenNames, setHiddenNames] = useState(false)
  return { appContext, setAppContext, hiddenNames, setHiddenNames }
}
