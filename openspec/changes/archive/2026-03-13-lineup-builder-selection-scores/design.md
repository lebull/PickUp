## Context

`LineupView` orchestrates the split-pane layout: when `activeSlot` is non-null it renders a `SplitPane` with `LineupGrid` on the left and `DJSelectionPanel` on the right; when `activeSlot` is null it renders only the grid. This means the right pane does not exist when nothing is selected — the user sees empty space with no instruction.

The `findNextEmptySlot` helper scans across **all** sequential stages on the evening, so auto-advance after an assignment can silently change the active stage/event, which is confusing.

`DJSelectionPanel` renders both a main-score column and an ML-score column regardless of context; in standard mode the ML column is redundant clutter, and in moonlight mode the main column is.

Score breakdowns (individual judge technical/flow/entertainment values and judges' notes) are available on every `Submission` object but are never surfaced in the DJ picker.

## Goals / Non-Goals

**Goals:**
- Show a helpful guidance message in the right pane when no slot is selected
- Clearing the day selection clears the active slot immediately
- Auto-advance after an assignment never changes the active stage (event); it only advances the slot within the same stage
- DJ picker shows only the relevant score column for the current sort context
- A score value in the DJ picker reveals a rich breakdown (per-judge scores + notes) on hover

**Non-Goals:**
- Redesigning the split-pane layout or resizing behavior
- Changing the score model or adding new score data
- Adding score peek to any view other than the DJ picker

## Decisions

### Always render the split pane with a right pane placeholder
Rather than toggling the entire split pane on/off, always render the `SplitPane` layout with a lightweight `LineupBuilderEmptyState` placeholder on the right when `activeSlot` is null. This eliminates grid-layout shift when a slot is opened or closed and makes it obvious that a right pane exists.

**Alternative considered**: Show an overlay hint on the grid itself. Rejected — it obscures grid content and is harder to dismiss cleanly.

### Clear `activeSlot` in `handleSelectEvening`
The simplest fix: call `setActiveSlot(null)` inside `handleSelectEvening` before (or alongside) the `navigate` call. No structural change needed.

### Restrict auto-advance to same stage
`findNextEmptySlot` currently iterates all sequential stages. Change it to only scan slots within `currentSlot.stageId`. If no empty slot remains within that stage, return null and leave the active slot unchanged. This makes the event context sticky with zero ambiguity.

**Alternative considered**: Allow cross-stage advance but warn the user. Rejected — silent context switches are the core complaint.

### Hide the unused score column in the DJ picker
When `useMoonlight` is true, hide the `dj-col-main-score` column (header + cells). When false, hide `dj-col-ml-score`. Both columns have their own CSS class so this is a single conditional render per column, no layout rework needed.

### Score peek as a custom CSS hover tooltip
Native `title` attributes cannot render multi-line structured content. Use a CSS-only hover tooltip (`::after` pseudo-element) with a `data-tooltip` attribute, or a small inline `<div className="score-peek-tooltip">` that is `visibility: hidden` and made visible on `.dj-panel-card:hover`. Given the amount of content (3 judges × 3 subscores + notes), a React-rendered `<div>` inside the card with `display: none → block` on hover via CSS is cleaner and accessible.

The tooltip content for main score: J1 technical/flow/entertainment + J1 notes, same for J2 and J3. For ML score: ML technical/flow/entertainment + ML notes. Show "—" for any null value.

**Alternative considered**: Using a Radix UI or Floating UI popover library. Rejected — adds a dependency for a read-only display; CSS hover is sufficient.

## Risks / Trade-offs

- **Always-rendered split pane**: The right pane takes a fixed portion of horizontal space even when not in use. Mitigated by making the empty-state pane narrower (smaller initial split or a collapsible placeholder). → Keep the same initial split; the user can resize.
- **Same-stage-only auto-advance**: Users who prefer to fill all stages sequentially will need to click over to the next stage manually. → Acceptable; the explicit click is consistent with the "no implicit event changes" principle.
- **CSS hover tooltip on mobile**: Touch devices do not have hover. Score peek will be inaccessible on touch. → Out of scope for this change.

## Open Questions

~~Should the empty-state pane show a narrow strip (e.g., 20% width) or full half-width?~~
**Resolved**: The split pane is always resizable by the user. The empty-state pane uses the same initial split ratio as when the DJ picker is open; the user can drag the divider to allocate more or less space as they prefer. No special narrow-strip treatment needed.
