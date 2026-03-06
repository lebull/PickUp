## 1. Dependencies & Types

- [x] 1.1 Add `idb` package to `app/package.json` and install
- [x] 1.2 Define `Stage` type: `{ id, name, activeDays, startTime, endTime, slotDuration }`
- [x] 1.3 Define `SlotAssignment` type: `{ stageId, evening, slotIndex, djName }`
- [x] 1.4 Define `LineupState` type: `{ stages: Stage[], assignments: SlotAssignment[], rowCount: number }`

## 2. Persistence Layer

- [x] 2.1 Create `src/lineupStorage.ts` — open/init IndexedDB store via `idb`
- [x] 2.2 Implement `saveLineup(fileName: string, state: LineupState): Promise<void>`
- [x] 2.3 Implement `loadLineup(fileName: string): Promise<LineupState | null>`
- [x] 2.4 Implement `clearLineup(fileName: string): Promise<void>`
- [x] 2.5 Add row-count mismatch detection in `loadLineup` return value (include `rowCountMismatch: boolean`)

## 3. Stage Configuration

- [x] 3.1 Create `src/components/StageConfigPanel.tsx` — modal/sidebar for CRUD of stages
- [x] 3.2 Implement add stage action (default values, editable inline)
- [x] 3.3 Implement edit stage field (name, activeDays checkboxes, startTime, endTime, slotDuration)
- [x] 3.4 Implement delete stage — warn if assignments exist, require confirmation
- [x] 3.5 Derive slot labels helper: `getSlotLabels(stage: Stage): string[]`

## 4. Lineup Grid

- [x] 4.1 Create `src/components/LineupGrid.tsx` — outer grid container with evening selector
- [x] 4.2 Render evening selector buttons (days with at least one active stage)
- [x] 4.3 Render grid columns for stages active on selected evening using CSS Grid
- [x] 4.4 Render slot rows with time labels derived from stage config
- [x] 4.5 Render empty slot cells as interactive (click to assign)
- [x] 4.6 Render occupied slot cells displaying assigned DJ name with visual distinction

## 5. DJ Assignment Interaction

- [x] 5.1 Create `src/components/SlotPicker.tsx` — dropdown/popover listing unscheduled DJs for selected slot
- [x] 5.2 Wire "click empty slot → open SlotPicker" flow
- [x] 5.3 Wire "click occupied slot → show reassign/remove options" flow
- [x] 5.4 Implement assign action (updates `LineupState.assignments`, closes picker)
- [x] 5.5 Implement remove action (removes assignment, DJ returns to pool)

## 6. DJ Pool Panel

- [x] 6.1 Create `src/components/DJPool.tsx` — sidebar listing unassigned DJs for current evening
- [x] 6.2 Filter pool to DJs whose `daysAvailable` includes the selected evening
- [x] 6.3 Exclude already-assigned DJs from pool (or visually dim them)
- [x] 6.4 Clicking a pool entry when a slot is selected assigns the DJ

## 7. App Integration

- [x] 7.1 Add `activeMode: 'submissions' | 'lineup'` state to `App.tsx`
- [x] 7.2 Render mode toggle tabs in `app-header`
- [x] 7.3 Conditionally render `LineupGrid` + `DJPool` or `SubmissionList` + `SubmissionDetail` based on mode
- [x] 7.4 On CSV import, call `loadLineup(fileName)` and restore state if found
- [x] 7.5 Display row-count mismatch warning banner when restored lineup has mismatched row count
- [x] 7.6 Wire debounced auto-save: whenever `LineupState` changes, call `saveLineup`
- [x] 7.7 Add "Clear Lineup" button in lineup mode with confirmation dialog

## 8. Styling

- [x] 8.1 Add CSS for schedule grid layout (CSS Grid, column/row headers, slot cells)
- [x] 8.2 Style empty vs. occupied slot cells
- [x] 8.3 Style DJ pool panel (sidebar layout, list items, dimmed/assigned state)
- [x] 8.4 Style stage config panel (form fields, add/delete controls)
- [x] 8.5 Style mode toggle tabs consistent with existing app header
