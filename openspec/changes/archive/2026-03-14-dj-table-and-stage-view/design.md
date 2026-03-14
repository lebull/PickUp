## Context

The lineup builder currently has two UX gaps:

1. **DJ table hidden until slot is selected**: `LineupView` only renders `DJSelectionPanel` when `activeSlot` is non-null. The right pane renders a static guidance message (`lineup-empty-state`) otherwise, hiding the DJ pool until the user clicks a slot. The `DJSelectionPanel` props type `activeSlot` as `ActiveSlot` (non-nullable), making it structurally impossible to render the table in a browsing state.

2. **No stage-spanning view**: The `LineupGrid` is structured as columns=stages, rows=time-slots for a single selected evening. There is no way to hold a stage constant and see all days. The evening selector in `LineupGrid` is the only navigation axis.

## Goals / Non-Goals

**Goals:**
- Render the DJ selection panel's DJ table in the right pane even when no slot is selected, with both standard and moonlight score columns visible for sorting.
- Add a "Stage View" mode to `LineupView` that holds a selected stage constant and shows all active event days as columns.
- In stage view, provide a stage selector so the user can pivot between stages.

**Non-Goals:**
- Drag-and-drop assignment from the no-slot-selected panel state (browsing only — assignment still requires a slot to be active).
- Changing the day-view layout or behavior.
- Sorting persistence across sessions.

## Decisions

### Decision 1: Extend `DJSelectionPanel` to accept `activeSlot | null` rather than creating a separate component

`DJSelectionPanel` already owns the DJ list rendering, sorting, filtering, and column layout. Creating a separate `DJBrowsePanel` would duplicate that logic. Instead, `activeSlot` is changed from `ActiveSlot` to `ActiveSlot | null` in the props interface. When null, the panel:
- Hides the slot tray (no slot to show)
- Shows a brief guidance message in place of the tray
- Renders both score columns (standard + ML) simultaneously, since there is no active context to prefer one
- Filters the DJ list by the current evening (passed as a new `currentEvening` prop) and discards, but without an active-slot exclusion

The `LineupView` ternary that currently switches between `DJSelectionPanel` and `lineup-empty-state` becomes unconditional — `DJSelectionPanel` is always rendered in the right pane.

**Alternative considered**: Always-visible separate `DJPoolPanel`. Rejected because it would duplicate all column and sort logic.

### Decision 2: Add a `StageGrid` component for the stage view, driven by a `viewMode` state in `LineupView`

The stage-view layout (days as columns, time-slots as rows for one stage) is structurally different enough from `LineupGrid` (stages as columns, time-slots as rows for one day) that adding a `viewMode` prop to `LineupGrid` would create a split-brain component. A dedicated `StageGrid` is cleaner and independently testable.

`LineupView` gains:
- `viewMode: 'day' | 'stage'` state (default `'day'`)
- `activeStageId: string | null` state (initialized to the first stage)
- A toggle control in the lineup header area to switch between modes
- Stage selector tabs (rendered when `viewMode === 'stage'`)

`StageGrid` renders:
- Header row: one column per active day for the selected stage
- Body rows: one row per sequential time slot
- Each cell: the DJ assigned to that stage/day/slot (same assignment model, same drag-drop and click callbacks)
- Simultaneous stages in stage view: a single full-height cell per day

**Alternative considered**: `viewMode` prop on `LineupGrid`. Rejected due to divergent column/row logic and increased component complexity.

### Decision 3: Both score columns visible in no-slot browsing state

When `activeSlot` is null, there is no app-context signal strong enough to hide one score column. Showing both lets the user sort by either score freely. The standard score column and ML score column are both rendered side by side, with sortable headers. When `activeSlot` becomes non-null (a slot is clicked), the existing context-based column visibility logic resumes.

## Risks / Trade-offs

- **`DJSelectionPanel` prop change is breaking**: Any call site that assumes `activeSlot` is non-nullable will need updating. Currently there is only one call site (`LineupView`), so risk is low.
- **`StageGrid` and `LineupGrid` share cell interaction logic** (drag-over, drop, slot-click): There will be some duplication in the new component. Mitigation: extract shared cell rendering into a helper if it grows unwieldy, but defer until needed.
- **Stage view uses same assignment data**: No new data model required; the stage view is a read/write view of the same `project.assignments` array.

## Open Questions

- None — both features are self-contained with no external dependencies or migration concerns.
