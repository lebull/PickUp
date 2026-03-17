## Context

The `DJSelectionPanel` exposes a DJ list where clicking any DJ card calls `handleAssign`, which directly invokes the parent's `onAssign` callback. There is no guard against calling `onAssign` when the active slot already has a DJ occupying it (`currentAssignment != null`). This means a single stray click on any name in the list silently replaces the slotted DJ—the same action as a deliberate assignment.

Drag-and-drop paths are separately handled: DJ cards are draggable and the LineupGrid's occupied cells accept drops by calling `onAssign`, which is the intended explicit-replace interaction. The slot tray rows already restrict drag-accept to empty rows (`onDragOver` and `onDrop` are only registered when `!assignment`), so tray-based drag replacement is also correctly blocked.

## Goals / Non-Goals

**Goals:**
- Prevent `handleAssign` from executing when the active sequential slot is already occupied
- Preserve drag-and-drop as the explicit replacement path (no change required)
- Preserve click-to-assign for empty slots (no change required)

**Non-Goals:**
- Simultaneous-stage slots (no `currentAssignment` concept applies; each position is independent)
- Adding an undo / confirmation dialog
- Changing how the grid cell click selects the active slot
- Modifying drag-and-drop behavior in any component

## Decisions

### Decision: Guard at `handleAssign` in `DJSelectionPanel`, not at the parent

**Chosen approach**: Add an early return to `handleAssign` when `currentAssignment` is truthy (non-blank sequential assignment).

**Alternatives considered**:
- Guard at `LineupView`'s `onAssign` handler — would protect against any caller but is further from the UX problem and harder to reflect in the UI state.
- Disable `onSlotClick` for occupied cells in `LineupGrid` — prevents opening an occupied slot in the panel at all, but loses the useful affordance of selecting an occupied slot to view its DJ.

**Rationale**: The fix belongs in the component responsible for assigning, where context (`currentAssignment`) is already computed. Minimal blast radius; no prop-drilling changes needed.

## Risks / Trade-offs

- [Low] Blank-slot assignments: `isBlankAssignment(currentAssignment)` must be checked so "Block Slot" occupants don't lock the panel. The guard should only fire for real DJ assignments.
  → Mitigation: already handled by the existing `currentAssignment` derivation which checks `!isBlankAssignment`; guard replicates same condition.

## Migration Plan

- No data migration required.
- No breaking API changes.
- Single file change in `DJSelectionPanel.tsx`.
- Rollback: revert the two file changes.
