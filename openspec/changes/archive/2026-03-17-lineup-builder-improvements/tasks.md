## 1. Simultaneous Stage Time-Based Positioning

- [x] 1.1 In `lineupUtils.ts`: export `timeToMinutes`; extract a private `toSortableMinutes(m: number)` helper (applies the `< 360 → +24h` normalization); refactor `getSlotLabels` and `getEveningTimeAxis` to use it in place of their inline copies
- [x] 1.2 Add `getSimultaneousRowRange(stage, evening, timeAxis)` to `lineupUtils.ts` built on `timeToMinutes` and `toSortableMinutes`, returning `{ gridRowStart: number; gridRowEnd: number }` in CSS 1-based grid rows (header = row 1, first data row = row 2)
- [x] 1.3 Update `SimultaneousCell` in `LineupGrid.tsx` to accept `gridRowStart` and `gridRowEnd` props and apply them as `gridRow: "${start} / ${end}"` instead of `gridRow: "span N"`
- [x] 1.4 Update the call site in `LineupGrid.tsx` to compute `gridRowStart`/`gridRowEnd` from `getSimultaneousRowRange` and pass them to `SimultaneousCell`; fall back to full span when stage has no schedule configured for the evening
- [x] 1.5 Verify simultaneous cells align correctly with adjacent sequential stage time rows in the browser

## 2. Selected Evening in URL

- [x] 2.1 Add a nested route `:day` to the lineup path in `App.tsx` (e.g. `/project/:id/lineup/:day`), and add a redirect from `/project/:id/lineup` (no day segment) to the first active evening
- [x] 2.2 Update `LineupView` to read the `:day` param via `useParams`, resolve it against `activeEvenings` (falling back to the first active evening if invalid), and initialize `selectedEvening` from it
- [x] 2.3 Replace `setSelectedEvening(day)` with a `navigate` call that updates the URL segment so evening selection writes to browser history
- [x] 2.4 Verify page refresh preserves the selected evening and browser back/forward navigates between evenings

## 3. Slot Tray in DJ Selection Panel

- [x] 3.1 Extract a `SlotTray` sub-component in `DJSelectionPanel.tsx` that accepts the active slot, all assignments for the active event, submissions, stage color, and callbacks (`onAssign`, `onRemove`, `onAddSimultaneous`, `onPositionSelect`)
- [x] 3.2 Render the tray with a row per position: for sequential slots, one row; for simultaneous events, three rows (Position 1–3)
- [x] 3.3 Each tray row shows: slot time label (sequential) or position label (simultaneous), assigned DJ name and genre, or "Empty" placeholder with drop-target styling
- [x] 3.4 Apply stage color tint (using `hexToTint`) to assigned tray rows; empty rows have no tint
- [x] 3.5 Wire `onDragOver` / `onDrop` to empty tray rows so DJs can be dragged from the available list directly onto an empty slot position
- [x] 3.6 Wire the Remove button on each tray row to call `onRemove` / `onRemoveSimultaneous` without clearing `activeSlot` or closing the panel
- [x] 3.7 Replace the `dj-panel-current` section in the panel's JSX with the new `SlotTray`

## 4. Simultaneous Slot Assignment — Fill Next Empty Position

- [x] 4.1 Update `handleAddSimultaneous` in `LineupView.tsx` to always write to the next empty position index (not the one captured in `activeSlot.positionIndex`), matching the `findNextEmptySlot` pattern used for sequential stages
- [x] 4.2 After assigning, advance `activeSlot.positionIndex` to the next empty position; if all three positions are now full, leave `activeSlot` unchanged (panel stays open)
- [x] 4.3 Update `DJSelectionPanel.handleAssign` for simultaneous slots: pass the next empty position rather than `activeSlot.positionIndex!` (or let `LineupView` own the advancement from step 4.2)

## 5. DJ List Column Presentation

- [x] 5.1 Add `title={djLabel(s)}` to the `dj-col-name` span in `renderCard`
- [x] 5.2 Add `title={scoreLabel(s)}` to the `dj-col-score` span
- [x] 5.3 Add `title={s.genre || '—'}` to the `dj-col-genre` span
- [x] 5.4 Add `title={s.stagePreferences.filter(Boolean).join(', ') || '—'}` to the `dj-col-stages` span
- [x] 5.5 Add `title={s.mlVibefit || '—'}` to the `dj-col-vibefit` span (Moonlight only)
- [x] 5.6 Reduce `dj-col-name` CSS width in `DJSelectionPanel` styles (e.g. from current value to a narrower fixed or percentage-based width)

## 6. Remove Clear Lineup

- [x] 6.1 Remove `showClearConfirm` state, `setShowClearConfirm`, and `handleClearLineup` function from `LineupView.tsx`
- [x] 6.2 Remove the `lineup-footer` div containing the "Clear Lineup" button from the render output
- [x] 6.3 Remove the confirm dialog overlay JSX (`showClearConfirm && (...)`) from `LineupView.tsx`
- [x] 6.4 Remove `.lineup-footer` and related confirm-dialog CSS (`.confirm-overlay`, `.confirm-dialog`, `.confirm-actions`) from the lineup styles
