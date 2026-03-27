## Context

Three surfaces are touched by this change:

1. **Slot tray (`DJSelectionPanel` — `SlotTray`)**: Currently shows `name | genre | Remove`. Score and format/gear are not displayed for slotted DJs.
2. **Score peek tooltip (`renderPeekContent`)**: Currently shows per-judge subscores and notes. Does not show the aggregate average score or format/gear.
3. **Lineup grid (`LineupGrid`)**: Occupied sequential and simultaneous cells show only the DJ name (or name list). No hover detail of any kind.

The score peek tooltip mechanism already exists in `DJSelectionPanel` — a `scorePeek` state holds `{ sub: Submission; rect: DOMRect }` and a fixed-position overlay is rendered at the bottom of the panel. The challenge is that the grid is a separate component and does not currently have access to this tooltip infrastructure.

## Goals / Non-Goals

**Goals:**
- Show score (avg) and format/gear in each filled slot-tray row
- Add hover peek trigger to filled tray rows (sequential and simultaneous)
- Add hover peek trigger to occupied sequential and simultaneous cells in the lineup grid
- Extend the peek tooltip to include the aggregate avg score and format/gear at the head of its content

**Non-Goals:**
- Blank/blocked slot rows (no submission to peek)
- Persistence or expansion of peek state beyond hover
- Any changes to the DJ card peek trigger (already works)

## Decisions

### Decision: Lift `scorePeek` state and `renderPeekContent` into a shared hook/utility, not prop-drill through `LineupView`

**Chosen approach**: Extract `renderPeekContent` into a standalone helper function in `DJSelectionPanel.tsx` (or a small shared util) and replicate the tooltip overlay pattern in `LineupGrid` with its own local peek state.

**Alternatives considered**:
- Prop-drill a `onPeekSubmission` callback from `LineupView` → `LineupGrid` and render the tooltip in `LineupView` — avoids duplication but adds noise to the already large `LineupView` prop surface.
- Shared context for peek state — over-engineered for a simple hover tooltip.

**Rationale**: The tooltip is purely presentational and stateless once you have a `Submission`. Duplicating the small fixed-position overlay in `LineupGrid` is simpler than threading new callbacks through the component tree. `renderPeekContent` logic can be extracted to a utility to avoid literal duplication.

---

### Decision: Add score + format/gear as new spans in tray rows, next to the existing genre span

**Chosen approach**: Insert a `slot-tray-dj-score` span and reuse the existing `slot-tray-dj-genre` span position. The score span triggers the peek on hover.

**Alternatives considered**:
- A separate "detail row" below the name — more vertical space, harder to scan at a glance.

**Rationale**: Keeps the tray row compact; consistent with the card list which shows score inline.

---

### Decision: Extend tooltip content with avg score and format/gear as a header row

**Chosen approach**: Add a small header block at the top of `renderPeekContent` output that shows `Avg: X.XX` and `Gear: ...` before the per-judge breakdown.

**Alternatives considered**:
- Separate tooltip for tray/grid vs. card list — inconsistent UX.

**Rationale**: A single tooltip shape everywhere is easier to understand and maintain.

## Risks / Trade-offs

- [Low] `LineupGrid` does not have `submissions` prop access today for the peek tooltip content. It already receives `submissions` for display-name lookups, so this is not a new dependency.
  → No mitigation needed.

- [Low] Tooltip positioning in `LineupGrid` may need adjustment since cells are placed via CSS Grid, not a scrollable list.
  → Use `element.getBoundingClientRect()` the same way as the panel; fixed positioning handles any scroll offset correctly.

## Migration Plan

No data migration or breaking changes. All changes are additive UI enhancements confined to the two component files. Rollback is a revert of both files.
