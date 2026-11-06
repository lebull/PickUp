import { describe, it, expect } from 'vitest'
import { hasCoordinatorRole } from '../authz.ts'

describe('hasCoordinatorRole', () => {
  it('accepts roles map claim', () => {
    expect(hasCoordinatorRole({ roles: { coordinator: true } })).toBe(true)
    expect(hasCoordinatorRole({ roles: { coordinator: false } })).toBe(false)
  })

  it('accepts roles list claim', () => {
    expect(hasCoordinatorRole({ roles: ['viewer', 'coordinator'] })).toBe(true)
    expect(hasCoordinatorRole({ roles: ['viewer'] })).toBe(false)
  })

  it('rejects missing or invalid claims', () => {
    expect(hasCoordinatorRole(undefined)).toBe(false)
    expect(hasCoordinatorRole(null)).toBe(false)
    expect(hasCoordinatorRole({})).toBe(false)
  })

  it('rejects top-level coordinator markers', () => {
    expect(hasCoordinatorRole({ coordinator: true })).toBe(false)
    expect(hasCoordinatorRole({ role: 'coordinator' })).toBe(false)
  })
})
