## 1. Extract score peek content into a shared utility

- [x] 1.1 Extract `renderPeekContent` from `DJSelectionPanel` into a standalone helper (e.g. `buildPeekContent`) in a new file `src/scorePeekUtils.tsx` (or inline export), accepting `(sub: Submission, useMoonlight: boolean) => ReactNode`
- [x] 1.2 Update `renderPeekContent` in `DJSelectionPanel` to add a header row showing the context-appropriate avg score (formatted to 2 decimal places) and `formatGear` before the existing judge breakdown
- [x] 1.3 Verify the existing DJ card score peek still works correctly after the extraction

## 2. Add score and format/gear to slot tray rows

- [x] 2.1 In the `SlotTray` sequential branch, add a score span and format/gear span to each filled non-blank row (beside the existing genre span); look up the `Submission` from `submissions` by `submissionNumber`
- [x] 2.2 Do the same for the simultaneous branch tray rows
- [x] 2.3 Pass `useMoonlight` (or the raw score to display) into `SlotTray` so the correct score (main vs. ML) is shown; update `SlotTrayProps` accordingly

## 3. Enable score peek in slot tray rows

- [x] 3.1 Thread `scorePeek` setter into `SlotTray` (add `onPeekEnter` / `onPeekLeave` callbacks or pass the setter directly via props); update `SlotTrayProps`
- [x] 3.2 Attach `onMouseEnter` / `onMouseLeave` handlers to the score span in each filled sequential tray row, triggering the `scorePeek` state in `DJSelectionPanel`
- [x] 3.3 Do the same for simultaneous tray position rows
- [x] 3.4 Guard peek trigger: only attach hover handlers when the DJ has at least one non-null score

## 4. Enable score peek in LineupGrid occupied cells

- [x] 4.1 Add local `gridPeek` state (`{ sub: Submission; rect: DOMRect } | null`) inside `LineupGrid`
- [x] 4.2 Import and use the shared peek content helper from task 1.1 to render the tooltip
- [x] 4.3 Attach `onMouseEnter` / `onMouseLeave` to each occupied non-blank sequential grid cell button; set/clear `gridPeek` state on hover
- [x] 4.4 Attach `onMouseEnter` / `onMouseLeave` to each individual DJ entry row inside `SimultaneousCell` for non-blank assignments; set/clear `gridPeek` via a passed callback
- [x] 4.5 Render the `score-peek-tooltip` overlay at the bottom of `LineupGrid`'s container, positioned via `getBoundingClientRect()` the same way the panel does
- [x] 4.6 Guard: only wire hover handlers when the DJ has at least one non-null score

## 5. Tests

- [x] 5.1 Add a test for the shared peek content helper: verify the header row includes avg score and format/gear
- [x] 5.2 Add a test for `SlotTray` sequential row: score and format/gear values are rendered
- [x] 5.3 Add a test for the grid peek on sequential cells: hovering an occupied cell with scores shows the tooltip; hovering with no scores does not
- [x] 5.4 Add a test for the grid peek on simultaneous cells: hovering a DJ entry with scores shows the tooltip; hovering with no scores does not
