## 1. Data Model

- [x] 1.1 Add optional `label?: string` field to `StageSchedule` type in `types.ts`
- [x] 1.2 Change the `schedule` field on `Stage` from `Record<string, StageSchedule>` to `Record<string, StageSchedule[]>` in `types.ts`
- [x] 1.3 Add optional `eventIndex?: number` field to `SlotAssignment` type in `types.ts`

## 2. Migration Script

- [x] 2.1 Create `app/scripts/migrate-multi-event.ts` that reads project JSON from stdin (or a file path argument), converts each `stage.schedule[day]` plain-object to a single-element array, adds `eventIndex: 0` to all existing `SlotAssignment` records, and writes the result to stdout (or back to the file)
- [x] 2.2 Add a `migrate` npm script entry in `package.json` to make it easy to run: `ts-node scripts/migrate-multi-event.ts`

## 3. Utility Functions

- [x] 3.1 Update `getSlotLabels()` in `lineupUtils.ts` to accept a `StageSchedule` entry (no signature break needed — it already takes a `StageSchedule`) — verify no callers pass a stage-level schedule directly
- [x] 3.2 Update `getEveningTimeAxis()` in `lineupUtils.ts` to iterate all events in each stage's schedule array for the selected evening and union their time slots into the shared axis
- [x] 3.3 Add a helper `getEventLabel(event: StageSchedule, index: number): string` that returns `event.label` if set, otherwise `"Set ${index + 1}"`
- [x] 3.4 Update any helper that looks up slot assignments by `(stageId, evening, slotIndex)` to also match on `eventIndex` (default `0`)

## 4. Lineup Grid Component

- [x] 4.1 Update column generation in `LineupGrid.tsx` to expand stages with multiple events into multiple adjacent columns (one per event, ordered by eventIndex)
- [x] 4.2 Add a grouped super-header row spanning all event columns for stages with more than one event, showing the stage name
- [x] 4.3 Update single-event stages to continue rendering a single column with no super-header (unchanged visual appearance)
- [x] 4.4 Pass `eventIndex` through slot-click handlers so that slot assignment records capture the correct `eventIndex`
- [x] 4.5 Update auto-advance logic to stay within the same `(stageId, eventIndex)` pair

## 5. Stage Config Panel Component

- [x] 5.1 In `StageConfigPanel.tsx`, replace the single start/end time pair per day with a list of event entries per day
- [x] 5.2 Add an "Add Event" button per active day row (sequential stages only) that appends a new empty event entry
- [x] 5.3 Add a remove button per event entry that removes it (with confirmation if assignments exist for that event)
- [x] 5.4 Add a label input per event entry (optional, placeholder "e.g. Evening Set")
- [x] 5.5 Implement inline overlap validation: when start/end times for any event change, check all events on the same day and display an error message if any two events overlap
- [x] 5.6 Keep the cross-midnight "↷ next day" indicator working per event entry

## 6. Simultaneous Stage Multi-Event

- [x] 6.1 Update `getSimultaneousRowRange()` in `lineupUtils.ts` to accept an `eventIndex` parameter (default 0) and use `events[eventIndex]` for the row span calculation
- [x] 6.2 Expand `stageColumns` in `LineupGrid.tsx` to include simultaneous stages with multiple events as multiple adjacent columns (same as sequential)
- [x] 6.3 Add `eventIndex` to props for `onAddSimultaneous`, `onRemoveSimultaneous`, and `onSimultaneousClick` in `LineupGrid.tsx`; pass it through all simultaneous cell callbacks and `activeSlotKey` comparisons
- [x] 6.4 Update `handleAddSimultaneous`, `handleRemoveSimultaneous`, and `handleAddBlankSimultaneous` in `LineupView.tsx` to accept and filter by `eventIndex`
- [x] 6.5 Add `eventIndex?: number` to `ActiveSlot` in `DJSelectionPanel.tsx`; filter simultaneous slot tray assignments by `eventIndex`
- [x] 6.6 Show the "+ Add Event" button for simultaneous stages in `StageConfigPanel.tsx` (remove the sequential-only gate)

## 7. Tests

- [x] 6.1 Add unit tests for `getEveningTimeAxis()` with a stage that has two non-overlapping events on the same evening
- [x] 6.2 Add unit test for the migration script: a project with plain-object schedules and assignments without `eventIndex` is correctly converted to the new format
- [x] 6.3 Add unit test for overlap validation logic: overlapping events produce an error, non-overlapping events pass
