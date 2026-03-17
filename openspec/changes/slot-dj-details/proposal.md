## Why

When reviewing or adjusting an already-built lineup, organisers need quick access to scores, notes, and gear info for DJs already slotted — without leaving the panel or clicking away. Currently the slot tray only shows the DJ name and genre, and slotted cells in the grid offer no hover detail at all.

## What Changes

- **Slot tray in DJ Selection Panel**: For each filled slot row, add score (avg) and format/gear beside the existing name/genre display.
- **Score peek tooltip — expanded content**: Update `renderPeekContent` to also show the context-appropriate average score (total) and the DJ's format/gear line at the top of the tooltip, so the same detail is available regardless of trigger point.
- **Slot tray hover peek**: Enable score peeking on the DJ name or score cell within each filled slot-tray row (both sequential and simultaneous), mirroring the existing hover behaviour on DJ cards.
- **Lineup grid hover peek**: Enable score peeking when hovering over an occupied sequential grid cell, using the same tooltip mechanism.

## Capabilities

### New Capabilities

### Modified Capabilities
- `dj-selection-panel`: Slot tray rows for filled slots SHALL display score and format/gear fields; hovering over the score/name triggers the score peek tooltip.
- `dj-score-peek`: Tooltip SHALL additionally show the overall average score and format/gear at the top of the breakdown popup.
- `lineup-grid`: Occupied sequential slot cells SHALL trigger the score peek tooltip on hover.

## Impact

- `app/src/components/DJSelectionPanel.tsx` — slot tray rows, `renderPeekContent`, peek state trigger points in tray rows
- `app/src/components/LineupGrid.tsx` — add hover peek state and tooltip render to occupied sequential cells
- No data model, API, or routing changes required
