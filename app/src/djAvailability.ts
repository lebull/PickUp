/**
 * Returns true if the submission's daysAvailable includes the given evening
 * (case-insensitive substring match).
 */
export function isDJAvailableOnEvening(daysAvailable: string, evening: string): boolean {
  return daysAvailable.toLowerCase().includes(evening.toLowerCase())
}

/**
 * Returns true if the DJ is NOT available on the given evening.
 * Used to drive the unavailability alert state in the DJ selection panel.
 */
export function isDJUnavailableOnEvening(daysAvailable: string, evening: string): boolean {
  return !isDJAvailableOnEvening(daysAvailable, evening)
}
