## Why

Today the only way to move a DJ to a different slot is to remove them from the current slot (returning them to the pool) and then reassign them from the pool. This multi-step workflow is tedious during last-minute lineup adjustments. Additionally, assigned slots show only a name, making it impossible to visually verify genre placement without opening the DJ panel, and there is no visual warning when a DJ ends up in a slot on a day they declared they're unavailable.

## What Changes

- Occupied slot cells in both the day-view lineup grid and stage-view grid become **drag sources**: an organizer can drag from an occupied sequential cell and drop onto another cell to move or swap the DJ.
- Individual DJ badges inside simultaneous stage cells are also draggable: dragging a badge out moves that DJ to the target slot or simultaneous position.
- When dragging between sequential slots, the two DJs **swap** if the target is occupied, or the DJ **moves** if the target is empty. Dragging between sequential and simultaneous positions moves the DJ without going through the pool.
- Occupied sequential grid cells display the DJ's **genre** as a secondary line below the name. Simultaneous DJ badges also show genre.
- Occupied sequential slot cells gain an **in-cell × remove button** (on hover), consistent with the existing × button already present on simultaneous DJ badges. Clicking it removes the DJ and returns them to the pool — no DJ panel interaction required.
- Any slot cell (sequential or simultaneous) being dragged over displays a visible **drop target indicator** (outline) so the organizer can see where the DJ will land.
- Sequential grid cells and simultaneous DJ badges whose assigned DJ is not available on that cell's evening render in an **availability error state** — a distinct warning tint and a tooltip showing which days the DJ is actually available.

## Capabilities

### New Capabilities
- `slot-to-slot-drag`: Occupied sequential slot cells and simultaneous DJ badges are draggable; dragging moves or swaps assignments without going through the pool. Drop targets show a visual indicator during hover.
- `slot-genre-display`: Occupied sequential slot cells and simultaneous DJ badges display the assigned DJ's genre as a secondary detail.
- `slot-availability-error`: A sequential slot or simultaneous badge whose assigned DJ's declared availability does not include the cell's evening renders an error/warning state with the DJ's available days.

### Modified Capabilities
- `lineup-event-cell`: Extend the shared cell interaction contract to cover both sequential cells and simultaneous badges as drag *sources*, define move-vs-swap semantics including cross-type transfers, add in-cell remove (× button) to sequential cells, add drop-target visual indicator to all cells, and incorporate genre display and availability error requirements.

## Impact

- `LineupGrid.tsx` — sequential slot cells and simultaneous DJ badges gain `draggable` + `onDragStart`; all drop handlers (sequential cells and `SimultaneousCell`) decode whether the drag source is a slot/badge (slot-key payload) or a pool card and route accordingly.
- `StageGrid.tsx` — same drag-source changes mirrored for the stage-view grid.
- `LineupView.tsx` — new `handleMoveAssignment(from, to)` action covering sequential↔sequential swap/move and sequential↔simultaneous transfers, all without touching the pool.
- `App.css` — new `.grid-slot--availability-error` and `.simultaneous-dj-badge--availability-error` styles; `.slot-genre` secondary text; `.grid-slot--drag-over` drop-target outline; `.slot-remove-btn` hover-visible × button on sequential cells.
- No changes to CSV import, score calculation, or project persistence format.
