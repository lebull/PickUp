/**
 * Curated stage color palette.
 * Red and yellow/amber hues are intentionally excluded — those are reserved
 * for application alert and warning states.
 */
export const STAGE_COLOR_PALETTE: string[] = [
  '#fb923c', // orange
  '#a16207', // gold
  '#4ade80', // lime green
  '#34d399', // mint
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#38bdf8', // light blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a78bfa', // lavender
  '#c084fc', // mauve
  '#d946ef', // fuchsia
  '#f472b6', // rose
  '#ec4899', // pink
  '#64748b', // slate
  '#94a3b8', // cool grey
]

/**
 * Convert a hex color string to a semi-transparent rgba() value.
 * @param hex  Hex color string, e.g. "#6366f1"
 * @param alpha  Opacity between 0 and 1 (default 0.2)
 */
export function hexToTint(hex: string, alpha = 0.2): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return 'transparent'
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
