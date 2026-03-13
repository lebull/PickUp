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

  it('defaults to timeFormat "24h" and hiddenNames false', () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      const prefs = useAppPreferencesState()
      return (
        <AppPreferencesContext.Provider value={prefs}>
          {children}
        </AppPreferencesContext.Provider>
      )
    }
    const { result } = renderHook(() => useAppPreferences(), { wrapper: Wrapper })
    expect(result.current.timeFormat).toBe('24h')
    expect(result.current.hiddenNames).toBe(false)
  })

  it('updates timeFormat when setter is called', () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      const prefs = useAppPreferencesState()
      return (
        <AppPreferencesContext.Provider value={prefs}>
          {children}
        </AppPreferencesContext.Provider>
      )
    }
    const { result } = renderHook(() => useAppPreferences(), { wrapper: Wrapper })
    act(() => result.current.setTimeFormat('12h'))
    expect(result.current.timeFormat).toBe('12h')
    act(() => result.current.setTimeFormat('24h'))
    expect(result.current.timeFormat).toBe('24h')
  })

  it('updates hiddenNames when setter is called', () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      const prefs = useAppPreferencesState()
      return (
        <AppPreferencesContext.Provider value={prefs}>
          {children}
        </AppPreferencesContext.Provider>
      )
    }
    const { result } = renderHook(() => useAppPreferences(), { wrapper: Wrapper })
    act(() => result.current.setHiddenNames(true))
    expect(result.current.hiddenNames).toBe(true)
  })
})
