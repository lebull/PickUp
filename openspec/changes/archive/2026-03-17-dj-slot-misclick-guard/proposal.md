## Why

Users are accidentally replacing already-slotted DJs by clicking a DJ card in the selection panel while a filled slot is active. Because click-to-assign has the same effect as drag-and-drop-to-assign, a misclick on any name in the list silently overwrites the current occupant with no confirmation or undo prompt—a frustrating, hard-to-spot data loss.

## What Changes

- **DJ Selection Panel**: When the active slot already has a DJ assigned, clicking a DJ card in the list SHALL be a no-op. The click affordance (cursor, hover style, `aria-label`) SHALL reflect that the slot is occupied and must be emptied first.
- **DJ Selection Panel**: Drag-and-drop from a DJ card to the **slot tray** SHALL remain restricted to empty tray rows (already the case). Drag-and-drop from a DJ card onto an **occupied grid cell** SHALL remain functional—this is the intentional explicit-replace path.
- **LineupGrid**: No behavioral change needed. Occupied grid cells already accept drag-and-drop for replacement, and clicking an occupied cell just selects it as the active slot.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `dj-selection-panel`: Requirement change — clicking a DJ card SHALL NOT assign when the active slot is already occupied; only drag-and-drop and the Remove-then-click workflow allow replacement via this panel.

## Impact

- `app/src/components/DJSelectionPanel.tsx` — guard in `handleAssign` and UI state of DJ cards when `currentAssignment` is present
- `app/src/components/DJSelectionPanel.css` (or inline styles) — occupied-slot card visual treatment (disabled/dimmed appearance, cursor change)
- No API or data-store changes required
- Existing drag-and-drop paths are unaffected
