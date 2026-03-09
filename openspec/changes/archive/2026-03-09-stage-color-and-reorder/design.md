## Context

The app manages DJ lineups across multiple stages. Currently `Stage` objects carry no color data and all stage columns in the lineup grid render with identical styling. Organizers working with 4–6 stages across multi-day events find it hard to scan the grid or quickly identify which stage a DJ in the submission list was assigned to.

The `StageConfigPanel` already owns stage CRUD; adding color selection and drag-to-reorder extends that same panel without new routes or services. No external libraries are strictly required — the browser's HTML5 Drag-and-Drop API is sufficient for reorder, and a hardcoded color palette avoids a color-picker dependency.

## Goals / Non-Goals

**Goals:**
- Add an optional `color` field to the `Stage` type storing a hex color string (transparent to existing JSON — missing means no color)
- Provide a fixed palette of visually distinct, accessible colors (excluding red and yellow, which are reserved for application alert states) to pick from in the stage config UI
- Reflect the chosen color in: stage config panel swatch, lineup grid column headers and occupied cells, submission list lineup-indicator badge
- Allow organizers to drag stages up/down in the config panel to control column order in the grid
- Persist order and color (as hex) through the existing project store (no schema migration needed — both are additive)

**Non-Goals:**
- Free-form arbitrary color input (e.g. open color-wheel picker) — the curated palette ensures colors remain visually distinct and don't conflict with alert colors
- Per-evening or per-day color overrides
- Animated or gradient stage colors
- Keyboard-accessible drag-and-drop (nice-to-have for a future pass; HTML5 D&D has known accessibility gaps)

## Decisions

### Decision: Fixed curated palette, stored as hex
**Choice**: Fixed palette of ~8 curated hex colors (no red or yellow tones) presented as swatches. The selected hex value is stored directly on `Stage.color`.  
**Rationale**: Storing hex directly is the simplest and most portable representation — no indirection through a lookup table at read time, and projects remain fully self-describing. The palette UI still constrains choices to visually safe options, preventing conflicts with red/yellow alert colors. Free-form open color-wheel input is still excluded. Alternatives considered: named palette keys (extra indirection layer with no benefit when the app owns both the palette definition and the renderer).

### Decision: Red and yellow hues excluded from palette
**Choice**: The stage color palette SHALL NOT include red, orange-red, or yellow hues. Suggested palette: indigo (`#6366f1`), violet (`#8b5cf6`), sky (`#0ea5e9`), teal (`#14b8a6`), emerald (`#10b981`), pink (`#ec4899`), fuchsia (`#d946ef`), slate (`#64748b`).  
**Rationale**: Red and yellow/amber are the conventional alert/warning colors in the application UI. Using them for stage identity would create false salience and confuse organizers scanning the submission list or grid for real warnings.

### Decision: Color applied via inline styles using stored hex
**Choice**: Use inline `style={{ backgroundColor: stage.color + '33' }}` (hex with alpha suffix for tints) rather than constructing class strings or maintaining a separate runtime lookup.  
**Rationale**: Hex stored directly on the stage object means no runtime palette map lookup. Inline styles are purge-safe. The `+ '33'` alpha approach (20% opacity) produces a readable tint without hiding text.### Decision: HTML5 Drag-and-Drop for stage reorder (no library)
**Choice**: Use `draggable` + `onDragStart`/`onDragOver`/`onDrop` on stage rows within the config panel.  
**Rationale**: Keeps the bundle small; reordering is only needed in the config panel (a modal, low interaction frequency). Libraries like `@dnd-kit` would add ~10 KB and complexity for a single small list.  
**Trade-off**: Accessibility gap (keyboard users cannot reorder) — acceptable for a coordinator tool used by a small trusted team.

### Decision: Color applied via inline styles, not dynamic Tailwind classes
**Choice**: Use inline `style={{ backgroundColor: palette[stage.color].bg }}` rather than constructing Tailwind class strings.  
**Rationale**: Tailwind purges unused dynamic class strings; inline styles are always safe and explicit. The palette object is a single source of truth.

### Decision: Submission list indicator uses stage color as accent
**Choice**: When a submission is in the lineup, the existing "✓ In Lineup" badge tints its background/border with the assigned stage's color from the palette.  
**Rationale**: Closes the feedback loop — organizers can see not just that a DJ is scheduled but which stage, at a glance, without opening the lineup grid.

## Risks / Trade-offs

- **Risk**: Drag-and-drop on touch devices is unreliable with native HTML5 API → **Mitigation**: Coordinators use desktop browsers; document as desktop-only feature. Add up/down arrow buttons in a future pass if needed.
- **Risk**: Stage color stored as hex; a future palette change doesn't invalidate stored values, but previously chosen colors may no longer appear in the picker → **Mitigation**: The picker always shows current palette options, but the stored hex is always rendered as-is. No data loss occurs.
- **Risk**: Reordering stages changes column order in the lineup grid mid-lineup, potentially confusing users → **Mitigation**: Reorder is only available in the config panel (modal), so the change is intentional and visible before saving.
- **Risk**: Light stage colors may not be readable on light backgrounds (and vice versa) → **Mitigation**: Curated palette uses mid-saturation hues with sufficient contrast; use semi-transparent tints on cell backgrounds rather than full fills.
