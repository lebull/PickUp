## Why

The DJ lineup building experience has several friction points that slow down the picking process: the current "Block Slot" UX uses a pinned row in the DJ list that is disconnected from the slot actions (like "Remove") that live in the slot tray, Moonlight score context is applied globally when it really belongs to individual stages, and time labels are inconsistent across the app with no option for 12-hour display.

## What Changes

- **Block Slot action on the slot**: Empty slot tray rows in the DJ selection panel get a "Block Slot" button, mirroring how "Remove" works on occupied rows. The pinned "Blocked slot" row at the top of the DJ list is removed.
- **Per-stage Moonlight scores**: Each stage gains a "Use Moonlight Scores" toggle in its config. This replaces the global `appContext` Moonlight preference. The DJ panel always shows both Main Score and ML Score side-by-side.
- **Consistent time axis**: The lineup grid time axis spans uniformly from stage start to end; any gap in scheduled slots appears as an empty row rather than being hidden.
- **App-wide 12/24-hour time format**: A new app preference controls whether times are displayed in 12-hour (AM/PM) or 24-hour format, applied consistently across the grid, slot tray, and any other time labels.

## Capabilities

### New Capabilities
- `slot-block-action`: "Block Slot" button on empty slot tray rows in the DJ selection panel, replacing the pinned blocked-slot row in the DJ list

### Modified Capabilities
- `lineup-grid`: Time axis rendered as a continuous range from stage start to end with visible gap rows; time labels formatted per app-wide time format preference
- `dj-selection-panel`: Both Main Score and ML Score shown on each DJ row simultaneously; pinned "Blocked slot" row removed
- `stage-config`: New `useMoonlightScores` boolean per stage controls Moonlight-specific sorting and display behavior for that stage
- `app-context`: Global `appContext` Moonlight toggle removed; `timeFormat: '12h' | '24h'` preference added

## Impact

- `app/src/components/LineupGrid.tsx`: Add block button to empty cells; update time axis generation and label formatting
- `app/src/components/DJSelectionPanel.tsx`: Add ML Score column alongside Main Score; remove blocked slot row
- `app/src/components/StageConfigPanel.tsx`: Add `useMoonlightScores` toggle to stage config UI
- `app/src/AppPreferencesContext.ts` / `AppPreferencesControls.tsx`: Replace Moonlight toggle with time format preference
- `app/src/types.ts`: Add `useMoonlightScores?: boolean` to `Stage`; add `timeFormat` to preferences
- `app/src/lineupUtils.ts`: Update time axis logic to generate full continuous range with gap detection
