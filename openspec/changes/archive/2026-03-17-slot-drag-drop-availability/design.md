## Context

The lineup grids (`LineupGrid.tsx` for day-view, `StageGrid.tsx` for stage-view) currently support one drag direction: pool → slot. A DJ card in the DJ Selection Panel carries the MIME type `application/dj-submission-number`. Drop handlers on every slot receive that payload and call `handleAssign`. Occupied slots are visually inert as drag sources; redistribution requires a two-step remove-then-reassign workflow. Additionally, occupied cells display only a name, and there is no visual indication when a DJ placed in a slot is unavailable on that day.

## Goals / Non-Goals

**Goals:**
- Occupied sequential slot cells become drag sources so DJs can be moved or swapped between slots without touching the pool.
- Individual DJ badges inside simultaneous stage cells become drag sources so DJs can be moved to any other slot or simultaneous position.
- Occupied sequential cells gain an in-cell × remove button (on hover), matching the existing × button on simultaneous badges.
- All valid drop targets display a visible outline while a drag is over them.
- Occupied sequential cells and simultaneous DJ badges display the assigned DJ's genre as a secondary detail.
- Sequential slots and simultaneous badges whose assigned DJ is unavailable on that evening render a distinct error state with an inline available-days message.
- Parity across day-view (`LineupGrid.tsx`) and stage-view (`StageGrid.tsx`).

**Non-Goals:**
- Reordering positions *within* a single simultaneous cell by drag (position indices are unordered).
- Dragging blank slot markers.
- Cross-project drag operations.
- Undo/redo history (out of scope).

## Decisions

### Decision 1: Dual MIME type in dataTransfer

**Choice**: Occupied sequential slot cells and simultaneous DJ badges set a second MIME type `application/dj-slot-key` (JSON: `{ stageId, evening, slotIndex?, eventIndex, positionIndex? }`) in addition to `application/dj-submission-number`. Sequential cells include `slotIndex`; simultaneous badges include `positionIndex`. Drop handlers on all targets check for `application/dj-slot-key` first; if present, they call `handleMoveAssignment`. If absent, they fall back to `application/dj-submission-number` (pool-card path, unchanged).

**Alternatives considered**:
- _Single new MIME type only (remove submission-number from dragged slots)_: Would break the slot-tray drop zones in the DJ Selection Panel, requiring more invasive changes.
- _Shared drag context via React state/ref_: Avoids serialization but breaks across iframe/window boundaries and is harder to test. The HTML5 dataTransfer approach is consistent with the existing pool-drag implementation.

### Decision 2: `handleMoveAssignment` semantics

The action accepts source and target descriptors, each identifying either a sequential slot or a simultaneous position:

- `{ stageId, evening, slotIndex, eventIndex }` — sequential slot
- `{ stageId, evening, positionIndex, eventIndex }` — simultaneous position

**Sequential → Sequential (empty target)**: remove source, write new assignment at target.  
**Sequential → Sequential (occupied target)**: atomically swap coordinates — no pool involvement.  
**Sequential → Sequential (blank target)**: DJ takes target; blank moves to source slot.  
**Simultaneous → Sequential (empty)**: remove from simultaneous position, write as sequential.  
**Simultaneous → Sequential (occupied)**: swap — displaced sequential DJ moves to the vacated simultaneous position.  
**Sequential → Simultaneous (has capacity)**: remove from sequential, add to next available simultaneous position.  
**Sequential → Simultaneous (full)**: no-op — `dropEffect = 'none'` on dragover, drop ignored.  
**Simultaneous → Simultaneous (same cell)**: no-op.  
**Blank as source**: blank markers are not `draggable`.

`handleMoveAssignment` lives in `LineupView.tsx` alongside the existing `handleAssign` / `handleRemove`, keeping all assignment mutation logic co-located.

### Decision 3: In-cell remove button for sequential cells

**Choice**: An occupied sequential slot cell renders a small `×` button (`<button class="slot-remove-btn">`) absolutely positioned in the top-right corner of the cell, hidden by default and revealed on `:hover` / `:focus-within`. Clicking it calls the existing `onRemove` prop (already wired to `handleRemove` in `LineupView.tsx`) and stops propagation so it doesn't also open the DJ panel. This mirrors the existing `.simultaneous-dj-remove` button pattern exactly — no new props or state needed.

**Alternative considered**: Requiring the DJ panel for all removes (status quo). Rejected — too many clicks for a routine adjustment.

### Decision 4: Drop target visual indicator via `dragOver` state

**Choice**: Each slot cell maintains a local `isDragOver` boolean using `onDragEnter` / `onDragLeave` / `onDragOver` / `onDrop` to toggle a `.grid-slot--drag-over` CSS class that renders a 2px outline. This is already done for the `simultaneous-dj-badge` area indirectly via CSS, so this makes it consistent. React state is used per-cell rather than a shared context to avoid re-rendering the entire grid on every drag move.

**Alternative considered**: A single parent-level drag-over state. Rejected — would re-render all cells on every `dragover` event (fires ~60fps), causing visible jank.

### Decision 5: Genre display via inline secondary text

For sequential cells, genre is derived from `submissions.find(...)?.genre` and rendered as a `<span class="slot-genre">` below the name inside the occupied-cell `<button>`. For simultaneous badges, the same `<span class="slot-genre">` is added inside `.simultaneous-dj-badge` below the existing name span. No new props needed in either component.

### Decision 6: Availability error is informational only — no drop blocking

**Choice**: When a DJ's `daysAvailable` does not include the cell's evening, the sequential cell or simultaneous badge renders an `--availability-error` modifier class and a `title` attribute set to `"Available: <daysAvailable>"`. The error is a visual warning only; all assignment, drag, and removal operations remain fully functional. Availability mismatches are editorially valid.

**Alternative considered**: Blocking the drop. Rejected — organizers need the freedom to override DJ availability declarations.

## Risks / Trade-offs

- **Drag payload size**: JSON slot-key is small (<100 bytes). No concern.
- **Swap atomicity**: Both grid components call `setState` once with the full updated assignments array, so there is no risk of a partial swap being rendered.
- **Blank-swap edge case**: If a DJ is dragged onto a blank and then the blank is dragged somewhere (impossible — blanks are not draggable), the state stays consistent. The blank simply remains at the source slot after the swap.
- **Availability false-negative**: `daysAvailable` is a free-text CSV column. If an organizer entered "Fri/Sat" instead of "Friday, Saturday", the includes-check will fail. This is a pre-existing limitation of the current filtering approach, not introduced by this change.
- **DragLeave false-fires**: `onDragLeave` fires when the cursor moves over a child element inside the cell. The `slot-remove-btn` child inside occupied cells can trigger a spurious leave. Mitigation: check `relatedTarget` on leave, or use a `dragenter` counter.

## Migration Plan

No data-model changes. No stored format changes. All changes are in React components and CSS only. No migration needed for existing project files.

## Open Questions

None.
