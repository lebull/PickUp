## Why

Two small but meaningful drag-and-drop friction points remain in the Lineup Builder: the simultaneous-stage cell cannot be clicked to open the DJ picker the same way sequential slots can, and the DJ selection panel's controls scroll away when working with a long DJ list, requiring the user to scroll back up to change context before dragging another DJ.

## What Changes

- Clicking anywhere on a `SimultaneousCell` in the lineup grid selects it and opens the DJ selection panel, consistent with sequential slot behavior.
- The DJ selection panel's header, slot tray, focus-stage filter row, and column-header row are made sticky so they remain visible while the DJ list scrolls beneath them.

## Capabilities

### New Capabilities

_(none — both changes affect existing capabilities only)_

### Modified Capabilities

- `lineup-grid-simultaneous`: Add a requirement that clicking the simultaneous cell body selects the slot (opens the DJ selection panel), in addition to the existing "Add DJ" button behavior.
- `dj-selection-panel`: Add a requirement that the panel's header section (stage/slot info, slot tray, focus-stage filter, column headers) is sticky within the panel's scrollable container, remaining visible while the DJ list scrolls.

## Impact

- `LineupGrid.tsx` — `SimultaneousCell` needs an `onClick` prop wired to a `onSelectSimultaneous` (or reused `onSimultaneousClick`) callback; the grid needs to track and pass `activeSlotKey` matching for simultaneous cells.
- `DJSelectionPanel.tsx` — CSS layout changes to establish a scrollable container for only the DJ list, with the header and controls sections having `position: sticky`.
- No data model, routing, or API changes required.
