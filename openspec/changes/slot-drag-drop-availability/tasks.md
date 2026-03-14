## 1. Genre display in occupied cells and simultaneous badges

- [x] 1.1 In `LineupGrid.tsx`, retrieve genre from the `submissions` array for each occupied sequential slot and render a `<span className="slot-genre">` below the DJ name inside the occupied-cell `<button>`
- [x] 1.2 In `StageGrid.tsx`, apply the same genre secondary-line rendering to occupied sequential slot cells
- [x] 1.3 Add a `<span className="slot-genre">` inside `.simultaneous-dj-badge` in `LineupGrid.tsx`'s `SimultaneousCell` component, passing the genre from the `submissions` lookup
- [x] 1.4 Apply the same simultaneous badge genre span in `StageGrid.tsx`
- [x] 1.5 Add `.slot-genre` CSS rule in `App.css` (smaller font, muted color, truncated with ellipsis)

## 2. Drag sources — sequential cells and simultaneous badges

- [x] 2.1 In `LineupGrid.tsx`, set `draggable={true}` on occupied (non-blank) sequential slot `<button>` elements and add `onDragStart` that sets `application/dj-slot-key` (`{ stageId, evening, slotIndex, eventIndex }`) and `application/dj-submission-number` with `effectAllowed = 'move'`
- [x] 2.2 In `StageGrid.tsx`, add the same `draggable` + `onDragStart` to occupied sequential cells
- [x] 2.3 In `LineupGrid.tsx`'s `SimultaneousCell`, add `draggable={true}` and `onDragStart` to each `.simultaneous-dj-badge`, encoding `{ stageId, evening, positionIndex, eventIndex }` in `application/dj-slot-key`
- [x] 2.4 Apply the same simultaneous-badge `draggable` + `onDragStart` in `StageGrid.tsx`
- [x] 2.5 Ensure blank marker cells do NOT receive `draggable`

## 3. `handleMoveAssignment` action and drop wiring

- [x] 3.1 Define a `SlotCoord` union type in `LineupView.tsx` covering `{ stageId, evening, slotIndex, eventIndex }` (sequential) and `{ stageId, evening, positionIndex, eventIndex }` (simultaneous)
- [x] 3.2 Add `handleMoveAssignment(from: SlotCoord, to: SlotCoord)` in `LineupView.tsx` covering all cases: sequential↔sequential (move/swap/blank), simultaneous→sequential, sequential→simultaneous (capacity check), simultaneous→simultaneous same-cell no-op
- [x] 3.3 Expose `onMoveAssignment` prop through `LineupGrid` and `StageGrid` component interfaces
- [x] 3.4 Update `onDrop` on every sequential slot cell in `LineupGrid.tsx` and `StageGrid.tsx` to check `application/dj-slot-key` first (call `onMoveAssignment`) then fall back to `application/dj-submission-number` (call `onAssign`)
- [x] 3.5 Update `SimultaneousCell.onDrop` to check `application/dj-slot-key` first; if full and source is a slot-key, set `dropEffect = 'none'` in `onDragOver` and ignore the drop; otherwise call `onMoveAssignment`
- [x] 3.6 Wire `handleMoveAssignment` from `LineupView.tsx` down to both `LineupGrid` and `StageGrid`

## 4. In-cell remove button for sequential cells

- [x] 4.1 In `LineupGrid.tsx`, add a `<button className="slot-remove-btn">×</button>` inside each occupied (non-blank) sequential slot cell; wire its `onClick` to call `onRemove(stage.id, evening, slotIndex, eventIndex)` with `e.stopPropagation()`
- [x] 4.2 Apply the same change to sequential cells in `StageGrid.tsx`
- [x] 4.3 Add `.slot-remove-btn` CSS in `App.css`: absolutely positioned top-right of the cell, hidden by default, visible on parent `:hover` / `:focus-within`, styled to match `.simultaneous-dj-remove`

## 5. Drop target visual indicator

- [x] 5.1 Add local `isDragOver` state to sequential slot cells in `LineupGrid.tsx`; set it in `onDragEnter`/`onDragLeave`/`onDrop` and apply `grid-slot--drag-over` CSS class
- [x] 5.2 Apply the same `isDragOver` state and class to sequential slot cells in `StageGrid.tsx`
- [x] 5.3 Update `SimultaneousCell` to apply a `grid-slot--drag-over` class during dragover when capacity allows (skip when full)
- [x] 5.4 Add `.grid-slot--drag-over` CSS rule in `App.css` (e.g., `outline: 2px solid #4a90d9`)

## 6. Availability error state

- [x] 6.1 In `LineupGrid.tsx`, for each occupied (non-blank) sequential cell, compute `isUnavailable` and apply `grid-slot--availability-error` class + `title="Available: <daysAvailable>"` when the DJ is not available on that evening
- [x] 6.2 In `StageGrid.tsx`, apply the same check using the day column name as the evening
- [x] 6.3 In `LineupGrid.tsx`'s `SimultaneousCell`, pass availability info per badge and apply `simultaneous-dj-badge--availability-error` class + `title` on each badge when the DJ is unavailable on that cell's evening
- [x] 6.4 Apply the same simultaneous badge availability check in `StageGrid.tsx`
- [x] 6.5 Add `.grid-slot--availability-error` and `.simultaneous-dj-badge--availability-error` CSS rules in `App.css` (amber/warning border or tint, visually distinct from normal occupied state)

## 7. Validation & cleanup

- [x] 7.1 Manually test: drag sequential slot A → empty sequential slot B — DJ moves, A is empty
- [x] 7.2 Manually test: drag sequential slot A → occupied sequential slot B — DJs swap, no pool involvement
- [x] 7.3 Manually test: drag sequential slot A → blank sequential slot B — DJ moves to B, blank stays at A
- [x] 7.4 Manually test: drag simultaneous badge → empty sequential slot — DJ moves, badge removed
- [x] 7.5 Manually test: drag sequential slot → simultaneous cell with capacity — DJ added to simultaneous, sequential slot emptied
- [x] 7.6 Manually test: drag sequential slot → full simultaneous cell — no-op, no-drop cursor shown, no indicator shown
- [x] 7.7 Manually test: pool card dropped onto occupied sequential slot — existing DJ returns to pool (unchanged behavior)
- [x] 7.8 Manually test: × button on occupied sequential cell removes DJ and returns them to pool without opening DJ panel
- [x] 7.9 Manually test: drag target outline appears on valid drop targets and disappears on drop or drag-leave
- [x] 7.10 Manually test: availability error appears on sequential cell and simultaneous badge when DJ is placed on a day outside their `daysAvailable`
- [x] 7.11 Verify genre line appears in both day-view and stage-view for sequential cells and simultaneous badges
