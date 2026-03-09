## Why

The Lineup Builder's schedule view and DJ selection panel have several UX gaps that make scheduling less intuitive and efficient. These improvements close those gaps to make building a lineup feel more natural.

## What Changes

- **Simultaneous events render by time**: Simultaneous stage cells will be sized and positioned based on their actual start/end times on the time axis, rather than spanning the full day height.
- **Selected day in route**: The currently viewed evening in the Lineup Builder will be part of the URL, so refreshing the page preserves the selected day.
- **DJ panel shows all slots**: When a slot is selected, the DJ selection panel will display all slot positions for that event, not just the currently assigned DJ. Empty slot positions will be valid drag-and-drop targets.
- **Remove doesn't deselect**: Clicking "Remove" on an assigned DJ will clear that position but leave the slot/event selected and the panel open.
- **Slot context in panel**: Each slot row will display its time and the assigned DJ's genre.
- **Tooltip on all DJ columns**: All column values in the DJ list will be exposed via native tooltip on hover, not just Format/Gear.
- **Narrower DJ name column**: The DJ name column width will be reduced to allow more room for other columns.
- **Simultaneous slot assignment fills empty positions**: When selecting a DJ for a simultaneous event, the DJ is added to the next empty position rather than replacing an already-filled one.
- **DJs use stage color**: Assigned DJ badges/indicators in the picker will use the stage's configured color rather than a hardcoded green.
- **Remove "Clear Lineup" button**: The bottom "Clear Lineup" action will be removed along with its supporting code.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `lineup-grid-simultaneous`: Simultaneous stage cells shall be positioned and sized on the time axis based on their actual start/end times, rather than spanning the full height of the grid.
- `project-workspace-routing`: The selected evening in the Lineup Builder shall be encoded as a URL segment so the view survives page refresh.
- `dj-selection-panel`: Multiple UX improvements: show all slot positions for the selected event (with empty slots as drop targets), retain selection after remove, expose all column values as tooltips, narrow the DJ name column, fill empty positions for simultaneous events, and use stage color for DJ indicators.

## Impact

- `LineupGrid.tsx` / simulation cell rendering logic
- `LineupView.tsx` / router integration for selected day
- `DJSelectionPanel.tsx` / slot display, style, and assignment logic
- `App.tsx` / router route definitions (if day segment is added)
- `lineupUtils.ts` / slot assignment helpers
- CSS / layout adjustments for column widths and color application
