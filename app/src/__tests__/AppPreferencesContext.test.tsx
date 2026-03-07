import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import {
  AppPreferencesContext,
  useAppPreferences,
  useAppPreferencesState,
} from '../AppPreferencesContext'

describe('AppPreferencesContext', () => {
  it('throws when useAppPreferences is called outside provider', () => {
    expect(() => {
      renderHook(() => useAppPreferences())
    }).toThrow('useAppPreferences must be used inside AppPreferencesProvider')
  })

  it('defaults to appContext "standard" and hiddenNames false', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => {
      const prefs = useAppPreferencesState()
      return (
        <AppPreferencesContext.Provider value={prefs}>
          {children}
        </AppPreferencesContext.Provider>
      )
    }
    const { result } = renderHook(() => useAppPreferences(), { wrapper })
    expect(result.current.appContext).toBe('standard')
    expect(result.current.hiddenNames).toBe(false)
  })

  it('updates appContext when setter is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => {
      const prefs = useAppPreferencesState()
      return (
        <AppPreferencesContext.Provider value={prefs}>
          {children}
        </AppPreferencesContext.Provider>
      )
    }
    const { result } = renderHook(() => useAppPreferences(), { wrapper })
    act(() => result.current.setAppContext('moonlight'))
    expect(result.current.appContext).toBe('moonlight')
  })

  it('updates hiddenNames when setter is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => {
      const prefs = useAppPreferencesState()
      return (
        <AppPreferencesContext.Provider value={prefs}>
          {children}
        </AppPreferencesContext.Provider>
      )
    }
    const { result } = renderHook(() => useAppPreferences(), { wrapper })
    act(() => result.current.setHiddenNames(true))
    expect(result.current.hiddenNames).toBe(true)
  })
})
