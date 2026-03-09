## Context

The Lineup Builder has two main components: `LineupGrid` (the schedule view) and `DJSelectionPanel` (the DJ picker). This change addresses multiple UX issues discovered during real use:

- Simultaneous stage cells currently `span` the full CSS grid height regardless of the stage's configured time window, making the visual layout inaccurate.
- The selected evening is client state only; page refreshes reset it to the first evening.
- The DJ picker panel shows a "current assignment" header for one slot, but users need to manage all positions of an event (especially simultaneous stages) at once.
- Various column presentation details (tooltip coverage, name column width, color use) diverge from what users expect.
- `handleAddSimultaneous` always writes to `positionIndex` captured at click time, so repeated picks overwrite the same slot instead of filling the next empty one.
- The "Clear Lineup" button is destructive, rarely used, and adds visual noise.

## Goals / Non-Goals

**Goals:**
- Simultaneous stage cells are sized/positioned on the time axis based on their `schedule[evening].startTime` / `endTime`.
- The viewed evening persists across page refresh via the URL.
- The DJ panel shows all slot positions for the selected event as a slot tray with drag-drop support.
- All DJ list column values expose a native `title` tooltip.
- DJ name column is narrower; assigned DJ indicators use stage color.
- Selecting a DJ for a simultaneous stage fills the next empty position.
- "Clear Lineup" button and its confirm dialog are removed.

**Non-Goals:**
- Changing how sequential stage slots are rendered (time positioning already works correctly).
- Resizing the split-pane layout or the panel's overall structure.
- Adding drag-and-drop between the slot tray AND the grid simultaneously.

## Decisions

### 1. Simultaneous cell time positioning: computed grid-row start/end

**Decision:** Add a `getSimultaneousRowRange(stage, evening, timeAxis)` utility that returns `{ gridRowStart: number; gridRowEnd: number }` in CSS grid 1-based row coordinates (adding 2 for the header row). `SimultaneousCell` will use `gridRow: "${start} / ${end}"` instead of `gridRow: "span N"`.

**Rationale:** The `timeAxis` array is already computed in `LineupGrid` and represents the unified sorted time labels. We can binary-search it for the stage's start/end minutes and derive grid row indices. This avoids any new data model changes — simultaneous stages already store `schedule[evening].startTime/endTime`.

**Alternative considered:** Storing `startRowIndex` / `rowSpan` as props. Rejected in favor of computing it from the existing time axis for consistency.

**Reusing existing `lineupUtils.ts` primitives:**
- `timeToMinutes` is already implemented in `lineupUtils.ts` but is currently private. It should be exported so `getSimultaneousRowRange` can call it directly rather than reduplicate it.
- The cross-midnight normalization (`m < 360 ? m + 24 * 60 : m`) appears in `getEveningTimeAxis`'s sort comparator and as an inline check in `getSlotLabels`. A private helper `toSortableMinutes(m: number)` should be extracted and shared by all three functions — `getEveningTimeAxis`, `getSlotLabels`, and the new `getSimultaneousRowRange` — eliminating the third copy.

**Edge cases handled:**
- If the simultaneous stage has no schedule for the evening, fall back to full-span.
- Cross-midnight: handled via `toSortableMinutes` (see above).
- If start time is before/after the time axis, clamp to the first/last row.

### 2. Selected evening in URL: child route segment

**Decision:** Add a nested route segment `:day` to the lineup path, making it `/project/:id/lineup/:day`. `LineupView` reads the param via `useParams` and calls `navigate` when the user clicks a different evening button.

**Rationale:** A URL segment (vs. query param) integrates cleanly with the existing React Router v6 nested route pattern already used for `/submissions` and `/lineup`. The existing `project-workspace-routing` spec already defines the tab routes; this extends the lineup route with one more level.

**Alternative considered:** `?day=Friday` query param. Equivalent in function but slightly less idiomatic for route-level state.

**Redirect behavior:** Navigating to `/project/:id/lineup` with no day segment redirects to the first active evening. If the `:day` param refers to an evening that is no longer active, fall back to the first active evening silently.

### 3. DJ panel slot tray: replace "current assignment" section

**Decision:** Replace the `dj-panel-current` section with a new `SlotTray` component rendered at the top of `DJSelectionPanel`. The tray shows:
- **Sequential slot:** One row with time label, assigned DJ name + genre (or "Empty" drop target), and a Remove button.
- **Simultaneous event:** Up to 3 rows, one per position, each showing time label (inherited from parent stage), assigned DJ + genre, or an empty drop-target placeholder.

Empty positions in the tray are `onDrop`/`onDragOver` targets accepting `application/dj-submission-number`. Clicking or dropping a DJ onto an empty position assigns them there. The "active" position (last one clicked in the grid) is highlighted in the tray.

**Rationale:** This gives the user a clear map of the event in the panel itself, enabling direct manipulation without going back to the grid. It also naturally solves the "remove doesn't deselect" requirement since the tray covers the full event rather than a single assignment.

**Note on `activeSlot` type:** The tray needs to know which position is currently "focused" so it can highlight it. `lineupView` state `activeSlot` already carries `positionIndex` for simultaneous slots; the tray just reads it.

### 4. Simultaneous slot assignment: fill next empty position

**Decision:** In `LineupView.handleAddSimultaneous`, after writing the assignment, derive the next empty position index and call `setActiveSlot({ ...activeSlot, positionIndex: nextEmpty })`. If all three slots are now full, leave the active slot as-is (or clear `activeSlot`).

**Rationale:** Mirrors the existing `findNextEmptySlot` pattern for sequential stages. The caller (`LineupGrid` / `DJSelectionPanel`) already propagates `positionIndex` through `activeSlot`, so updating it in `LineupView` is sufficient.

### 5. Stage color for DJ indicators: use `stage.color`

**Decision:** The `SlotTray` and any "assigned" row rendering in the panel will read `stage?.color` and apply it as a tint (using the existing `hexToTint` helper) for the occupied-position badges, matching the grid cell style.

**Rationale:** The grid already applies `hexToTint(color, 0.25)` to occupied sequential cells and `hexToTint(color, 0.12)` to simultaneous cells. Reusing the same helper keeps color treatment consistent.

### 6. Tooltip on all columns: add `title` attribute

**Decision:** Each `<span>` in `renderCard` receives a `title` attribute with the display value. Already done for `dj-col-format`; extend to all other columns by passing the raw string value.

**Rationale:** Minimal change, consistent with the existing implementation pattern.

### 7. Remove "Clear Lineup" button

**Decision:** Remove `handleClearLineup`, `showClearConfirm`/`setShowClearConfirm` state, the `lineup-footer` div, and the confirm dialog from `LineupView`. Remove related CSS.

**Rationale:** The feature is rarely used and can be recreated via project delete or re-import. Removing it reduces cognitive load and eliminates the risk of accidental data loss.

## Risks / Trade-offs

- **Simultaneous cell time alignment**: If a simultaneous stage's time window doesn't align with any sequential stage's slot boundaries, the cell rows may not align cleanly. Mitigation: clamping logic ensures it always renders within the grid; visual misalignment is acceptable given the nature of simultaneous events.
- **URL day persistence**: If a user bookmarks `/project/:id/lineup/Saturday` and then the Saturday stage is removed, the app falls back to the first active evening. The URL becomes stale but the app still works.
- **SlotTray complexity**: Adding the slot tray increases the responsibility of `DJSelectionPanel`. Mitigation: extract it as a sub-component (`SlotTray`) to keep concerns separated.

## Migration Plan

All changes are purely client-side and non-breaking:
1. In `lineupUtils.ts`: export `timeToMinutes`, extract shared `toSortableMinutes` helper, refactor `getSlotLabels` and `getEveningTimeAxis` to use it, then add `getSimultaneousRowRange` built on those primitives.
2. Update `SimultaneousCell` to use `gridRow: "${start} / ${end}"`.
3. Update router to add `:day` segment; update `LineupView` to read/write it.
4. Create `SlotTray` sub-component; replace `dj-panel-current` section.
5. Update `handleAddSimultaneous` in `LineupView` to advance active position.
6. Add `title` to all DJ list column spans.
7. Apply stage color to slot tray badges.
8. Remove Clear Lineup button and cleanup.

No data migration or server changes needed.

## Open Questions

- Should the `:day` URL segment use the full day name (e.g. `Saturday`) or a lowercase slug (e.g. `saturday`)? Lowercase slug is more URL-conventional.
- For the slot tray on sequential slots, should it show only the selected slot or show all slots for that sequential stage on that evening? (The request says "all slots for that event" — for sequential stages a single time slot IS the event, so one row seems correct.)
