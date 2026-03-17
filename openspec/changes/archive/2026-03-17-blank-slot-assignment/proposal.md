## Why

Some lineup slots are intentionally unavailable — blocked for things like opening ceremonies, breaks, VIP sets, or other non-DJ events. Currently there is no way to represent these in the lineup; organizers have no way to mark a slot as blocked or explain why it is empty, leading to confusion in the results and lineup table.

## What Changes

- A **blank slot** option appears as a pinned entry at the top of the DJ picker list, above all DJ rows
- Clicking the blank slot option assigns it to the active slot, just like clicking a DJ
- The blank slot entry has an editable label (e.g., "Break", "Opening Ceremony") that the user can set or change at any time
- Blank-assigned slots render in the lineup grid and results list with the label displayed, visually distinct from both empty and DJ-assigned slots
- Blank slot labels are persisted in project state alongside DJ assignments

## Capabilities

### New Capabilities
- `blank-slot-assignment`: Defines the blank slot concept, its label, how it is assigned from the DJ picker, and how it is displayed and persisted as a special slot assignment type

### Modified Capabilities
- `dj-selection-panel`: Add the blank slot entry at the top of the DJ list; clicking it assigns the blank slot and closes the panel
- `lineup-grid`: Render blank-assigned slots with their label and distinct visual treatment
- `lineup-results-list`: Include blank-assigned slots in the results output, displaying their label

## Impact

- `src/types.ts`: New `BlankSlotAssignment` type or discriminated union variant for slot assignment
- `src/projectStore.ts`: Store blank slot label and handle blank assignment in lineup state
- `src/components/DJSelectionPanel.tsx`: Render pinned blank slot row at top of list
- `src/components/LineupGrid.tsx`: Render blank-assigned cells with label
- `src/components/ResultsList.tsx`: Include blank slots in results display
