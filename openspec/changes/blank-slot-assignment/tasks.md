## 1. Data Model

- [x] 1.1 Split `SlotAssignment` in `types.ts` into a discriminated union: `DJSlotAssignment` (`type: 'dj'`, required `submissionNumber`) and `BlankSlotAssignment` (`type: 'blank'`, optional `blankLabel?`); export `SlotAssignment = DJSlotAssignment | BlankSlotAssignment`
- [x] 1.2 Add `isBlankAssignment(a: SlotAssignment): a is BlankSlotAssignment` type-guard (returns `a.type === 'blank'`) — export from `types.ts`
- [x] 1.3 Add a `getBlankLabel(a: BlankSlotAssignment): string` helper that returns `a.blankLabel || 'Blocked'`
- [x] 1.4 Fix all TypeScript compile errors from the union change (construction sites that don't yet include `type:`, and any narrowing needed in selectors)

## 2. DJ Selection Panel — Blank Slot Row

- [x] 2.1 Add a pinned blank slot row as the first item in `DJSelectionPanel` DJ list
- [x] 2.2 The blank slot row SHALL contain a text input pre-filled with `"Blocked"` for the label; the user can edit it before assigning
- [x] 2.3 Clicking the blank slot row (outside the input) creates a `BlankSlotAssignment` (`type: 'blank'`, `blankLabel` set to the input value if non-empty) for the active slot and closes the panel
- [x] 2.4 When the panel is opened for an already-blank slot, pre-fill the label input with the existing `blankLabel` (or `"Blocked"`)
- [x] 2.5 Ensure blank slot row is always first regardless of active filter, search, or stage focus grouping

## 3. Lineup Grid — Blank Cell Display

- [x] 3.1 Update sequential cell rendering in `LineupGrid` to detect blank assignments (`isBlankAssignment`) and display `getBlankLabel(assignment)`
- [x] 3.2 Apply distinct visual styling to blank-assigned cells (muted/italic text, no stage color tint)
- [x] 3.3 Update simultaneous stage cell rendering to display `getBlankLabel(assignment)` for blank-assigned positions
- [x] 3.4 Ensure clicking a blank-assigned sequential cell opens the DJ selection panel with label input pre-filled

## 4. Results List — Blank Slot Display

- [x] 4.1 Update the accepted section in `ResultsList` to include blank-assigned slots alongside DJ entries
- [x] 4.2 Render blank entries with `getBlankLabel(assignment)` as the label and the slot time (sequential) or position label (simultaneous), with no contact/scoring fields
- [x] 4.3 Exclude blank assignments from the "Did Not Make the Cut" section logic

## 5. Slot Tray — Blank Slot Awareness

- [x] 5.1 Update the slot tray in `DJSelectionPanel` to display `getBlankLabel(assignment)` for blank-assigned positions
- [x] 5.2 Ensure blank-assigned tray rows do not apply stage color tint

## 6. Unscheduled Pool — Blank Assignment Exclusion

- [x] 6.1 Ensure `isBlankAssignment` is used to exclude blank assignments from the unscheduled DJ pool (blank slots should not appear as "unassigned DJs")
- [x] 6.2 Verify that any selector computing "assigned submission numbers" only processes assignments where `isBlankAssignment(a) === false` (TypeScript narrowing ensures `submissionNumber` is only accessed on `DJSlotAssignment`)
