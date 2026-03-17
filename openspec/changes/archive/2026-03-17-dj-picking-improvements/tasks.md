## 1. Data Model & Shared Utilities

- [x] 1.1 Add `useMoonlightScores?: boolean` to the `Stage` type in `types.ts`
- [x] 1.2 Add `timeFormat: '12h' | '24h'` to the app preferences type / localStorage schema
- [x] 1.3 Create `formatTimeLabel(hhmm: string, format: '12h' | '24h'): string` utility (in `lineupUtils.ts` or a new `timeUtils.ts`)
- [x] 1.4 Write unit tests for `formatTimeLabel` covering edge cases: midnight (00:00), noon (12:00), cross-midnight times, 24h pass-through

## 2. App Preferences — Remove Moonlight Toggle, Add Time Format

- [x] 2.1 Remove `appContext` / `setAppContext` from `AppPreferencesContext` and its provider
- [x] 2.2 Add `timeFormat` / `setTimeFormat` to `AppPreferencesContext` (default: `'24h'`)
- [x] 2.3 Update `AppPreferencesContext` localStorage persistence to save/restore `timeFormat` and drop `appContext`
- [x] 2.4 Remove the Moonlight context toggle from `AppPreferencesControls.tsx`
- [x] 2.5 Add a 12h / 24h time format toggle to `AppPreferencesControls.tsx`
- [x] 2.6 Update `AppPreferencesContext.test.tsx` to cover `timeFormat` default, persistence, and setter behavior

## 3. Stage Config — Use Moonlight Scores Toggle

- [x] 3.1 Add "Use Moonlight Scores" checkbox/toggle to each stage row in `StageConfigPanel.tsx`
- [x] 3.2 Wire the toggle to update `stage.useMoonlightScores` through the project store
- [x] 3.3 Verify new stages are created with `useMoonlightScores` defaulting to `false` / undefined

## 4. DJ Selection Panel — Both Scores, No Blocked-Slot Row

- [x] 4.1 Remove the pinned "Blocked slot" row from `DJSelectionPanel.tsx`
- [x] 4.2 Add a "Main" score column alongside the existing score display (always visible)
- [x] 4.3 Add an "ML" score column (always visible); display `"—"` when `mlScore` is null
- [x] 4.4 Remove `appContext`-based score column header switching (`"ML Score"` / `"Main Score"` → always `"Main"` + `"ML"`)
- [x] 4.5 Update sort logic: sort by `mlScore.avg` when `activeStage.useMoonlightScores`, else by `mainScore.avg`
- [x] 4.6 Update `moonlightInterest` filter: apply only when `activeStage.useMoonlightScores === true`
- [x] 4.7 Update Vibefit column visibility: show when `activeStage.useMoonlightScores === true` (was: `appContext === 'moonlight'`)
- [x] 4.8 Apply `formatTimeLabel` to slot tray time labels using `timeFormat` from `AppPreferencesContext`
- [x] 4.9 Remove all remaining references to `appContext` from `DJSelectionPanel.tsx`

## 5. DJ Selection Panel — Block Slot Action on Slot Tray

- [x] 5.1 Add a "Block Slot" button to empty slot tray rows in `DJSelectionPanel.tsx` (mirroring the "Remove" button on occupied rows)
- [x] 5.2 Wire the button to call `onAssignBlank` with default label `'Blocked'` and close the panel
- [x] 5.3 Ensure the button is absent on occupied slot tray rows (Remove button only on those)

## 6. Lineup Grid — Continuous Time Axis

- [x] 6.1 Update time axis generation in `lineupUtils.ts` to compute a shared axis spanning the union of all active sequential stages' time ranges on the evening
- [x] 6.2 Update `LineupGrid.tsx` to use the shared time axis and render empty non-interactive cells for stages with no slot at a given time row
- [x] 6.3 Apply `formatTimeLabel` with `timeFormat` preference to all row header time labels in `LineupGrid.tsx`
- [x] 6.4 Verify cross-midnight stages are correctly handled in the shared axis (20:00–02:00 wrapping)

## 7. Cleanup & Final Verification

- [x] 7.1 Remove any remaining imports or usages of `appContext` from components not updated above (`SubmissionsView`, `NavActionsMenu`, etc.)
- [x] 7.2 Run existing tests; fix any broken tests caused by `appContext` removal
- [x] 7.3 Verify blocked slot assigned via grid button persists and re-loads correctly
- [x] 7.4 Verify per-stage Moonlight scoring works independently across multiple stages in the same project
- [x] 7.5 Verify time format preference persists across page reloads and updates all time labels consistently
