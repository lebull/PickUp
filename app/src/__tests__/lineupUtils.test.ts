import { describe, it, expect } from 'vitest'
import { formatTimeLabel } from '../lineupUtils.ts'

describe('formatTimeLabel', () => {
  it('passes 24h strings through unchanged', () => {
    expect(formatTimeLabel('20:00', '24h')).toBe('20:00')
    expect(formatTimeLabel('00:30', '24h')).toBe('00:30')
    expect(formatTimeLabel('12:00', '24h')).toBe('12:00')
  })

  it('converts afternoon hours to 12h pm', () => {
    expect(formatTimeLabel('20:00', '12h')).toBe('8:00 pm')
    expect(formatTimeLabel('21:30', '12h')).toBe('9:30 pm')
    expect(formatTimeLabel('23:00', '12h')).toBe('11:00 pm')
  })

  it('converts morning hours to 12h am', () => {
    expect(formatTimeLabel('08:00', '12h')).toBe('8:00 am')
    expect(formatTimeLabel('09:15', '12h')).toBe('9:15 am')
    expect(formatTimeLabel('11:45', '12h')).toBe('11:45 am')
  })

  it('converts midnight (00:00) correctly', () => {
    expect(formatTimeLabel('00:00', '12h')).toBe('12:00 am')
  })

  it('converts noon (12:00) correctly', () => {
    expect(formatTimeLabel('12:00', '12h')).toBe('12:00 pm')
  })

  it('handles cross-midnight post-midnight times', () => {
    expect(formatTimeLabel('01:00', '12h')).toBe('1:00 am')
    expect(formatTimeLabel('02:30', '12h')).toBe('2:30 am')
  })

  it('pads minutes with leading zero', () => {
    expect(formatTimeLabel('20:05', '12h')).toBe('8:05 pm')
    expect(formatTimeLabel('00:05', '12h')).toBe('12:05 am')
  })
})
