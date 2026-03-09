## Context

The Lineup Grid (`LineupGrid.tsx`) renders two types of event cells: sequential slot cells (one per time slot per stage) and simultaneous stage cells (`SimultaneousCell`). Sequential cells already have `onDragOver`/`onDrop` handlers that call `onAssign` when a DJ card is dropped. Simultaneous cells do not.

The `LineupGrid` Props interface already includes `onAddSimultaneous(stageId, evening, positionIndex, submissionNumber)`, and it is already destructured — but aliased as `_onAddSimultaneous`, signaling it was wired at the parent boundary but never threaded into the cell render. `SimultaneousCellProps` has no `onDrop` prop. The `nextPosition` prop (already passed) happens to encode exactly what we need: the next open position index, or `null` when the cap is reached.

## Goals / Non-Goals

**Goals:**
- Add `onDragOver` and `onDrop` handlers to `SimultaneousCell`'s outer `div`.
- Wire `_onAddSimultaneous` from `LineupGrid` through to `SimultaneousCell` at both call sites.
- Reject drops silently when `nextPosition` is `null` (cap reached), setting `dropEffect = 'none'` to signal an invalid target.

**Non-Goals:**
- Changing the assignment data model or the `positionIndex` logic (`nextSimultaneousPosition` already handles this correctly).
- Adding visual drag-hover styling (CSS `:drop` / `dragenter` state) — acceptable as a future enhancement.
- Changing how sequential cells handle drops.

## Decisions

### 1. Add `onDrop` prop to `SimultaneousCellProps`

```
onDrop: (submissionNumber: string) => void
```

The `SimultaneousCell` component handles the mechanics of `e.preventDefault()`, `e.dataTransfer.getData(...)`, and cap-check guard (`nextPosition === null → return`). The callback receives only the `submissionNumber`, matching the pattern used by sequential cells. The parent call site in `LineupGrid` constructs the full `onAddSimultaneous(stageId, evening, pos, subNum)` call.

**Alternative considered:** Pass the raw `DragEvent` up to the parent. Rejected — it leaks DOM details across the component boundary and duplicates `stopPropagation`/`getData` logic.

### 2. Reuse `nextPosition` for cap enforcement

The `nextPosition` prop is already computed and passed. In `onDrop`, if `nextPosition === null` we return without calling the callback and set `e.dataTransfer.dropEffect = 'none'` on `onDragOver` so the cursor gives a "no drop" signal.

**Alternative considered:** Let `LineupGrid` guard the call. Rejected — `SimultaneousCell` already has the cap information via `nextPosition`, keeping the guard co-located with all the other cap logic in the component.

### 3. Rename `_onAddSimultaneous` at the destructure site

`_onAddSimultaneous` was prefixed with `_` to suppress lint warnings about an unused variable. After this change it is used, so the rename is required.

## Risks / Trade-offs

- **Drag initiating on a DJ badge** — A drag started on a DJ badge inside the cell (e.g., to reorder) could accidentally trigger the drop handler on the same cell. Currently there is no DJ-badge drag behavior; if added later it must call `stopPropagation` on the badge's `dragStart`. Low risk now, documented for future implementers.
- **Drop data key** — The drop uses `e.dataTransfer.getData('application/dj-submission-number')`. This key must match what `DJPool.tsx` sets on drag start. It already does for sequential cells, so no change is needed, but it's a coordination dependency to be aware of.
