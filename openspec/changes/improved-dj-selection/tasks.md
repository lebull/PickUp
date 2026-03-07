## 1. AppPreferencesContext

- [ ] 1.1 Create `src/AppPreferencesContext.ts` with `AppPreferencesContext`, `AppPreferencesProvider`, and `useAppPreferences` hook exposing `appContext: 'standard' | 'moonlight'`, `hiddenNames: boolean`, and their setters
- [ ] 1.2 Wrap the app root (or router root) in `AppPreferencesProvider` in `main.tsx` or `App.tsx` so all routes can access the context
- [ ] 1.3 Add unit/smoke test: `useAppPreferences` throws outside provider; default values are `standard` and `false`

## 2. App Header Toggle Controls

- [ ] 2.1 Add a Standard/Moonlight context toggle button/segmented control to the app header or global nav — visible from all project workspace views
- [ ] 2.2 Add a Hidden Names toggle button (e.g., eye-slash icon or labelled button) to the app header, adjacent to the context toggle
- [ ] 2.3 Ensure both toggles call the appropriate setters from `useAppPreferences` and visually reflect the current state

## 3. Submission List — Default Sort by Active Context Score

- [ ] 3.1 Update `SubmissionList` (or `SubmissionsView`) to read `appContext` from `useAppPreferences`
- [ ] 3.2 Set default sort column to Final Main Score when `appContext === 'standard'`, and Final ML Score when `appContext === 'moonlight'`, both descending
- [ ] 3.3 When `appContext` changes, reset the sort column and direction to match the new context default
- [ ] 3.4 Ensure the Genre column remains visible in the submission list as a display-only column with no filter control

## 4. DJ Selection Panel — Replace SlotPicker Modal

- [ ] 4.1 Create `src/components/DJSelectionPanel.tsx` — a side panel component that accepts the active slot, submissions, stages, and assignments as props and displays a scored list of available DJs
- [ ] 4.2 Update `LineupView.tsx` to render the `DJSelectionPanel` beside the `LineupGrid` when a slot is active, instead of opening the `SlotPicker` modal; the layout switches to a two-column split (grid | panel) when a slot is selected
- [ ] 4.3 Remove or deprecate `SlotPicker.tsx` once the panel is wired up (keep file until panel is confirmed working)
- [ ] 4.4 The panel list SHALL display: DJ Name (or anonymous ID), active-context score, genre (display only — no filter), stage preferences, and vibefit (moonlight context only)
- [ ] 4.5 Clicking a DJ card in the panel assigns that DJ to the active slot and closes the panel
- [ ] 4.6 Implement HTML5 drag-and-drop: DJ cards in the panel SHALL be draggable; slot cells in `LineupGrid` SHALL be drop targets; dropping a DJ card onto a slot SHALL assign that DJ to that slot
- [ ] 4.7 Add a Stage Preference multi-select filter inside the panel (derives stage names from project configuration); filter logic matches the same intersection rules as the submission list
- [ ] 4.8 Ensure the panel closes when the user clicks outside it or presses Escape

## 5. Submission List — Hidden Names

- [ ] 5.1 Read `hiddenNames` from `useAppPreferences` in `SubmissionList`
- [ ] 5.2 When `hiddenNames` is true, display `DJ #N` (1-based load-order index) in the DJ Name column instead of the real name

## 6. Submission List — Vibefit Column

- [ ] 6.1 Add a Vibefit column to the submission table that is only rendered when `appContext === 'moonlight'`
- [ ] 6.2 Populate Vibefit cells from the submission's `j3Vibefit` (or equivalent) field; display "—" when absent

## 7. Submission Detail — Context-Aware Score Emphasis

- [ ] 7.1 Read `appContext` from `useAppPreferences` in `SubmissionDetail`
- [ ] 7.2 When `appContext === 'moonlight'`, render the Moonlight score section before the Main score section in the detail view
- [ ] 7.3 When `appContext === 'moonlight'`, display the Final ML Score prominently in the summary banner (in place of or alongside the Main Score)

## 8. Submission Detail — Hidden Names

- [ ] 8.1 Read `hiddenNames` from `useAppPreferences` in `SubmissionDetail`
- [ ] 8.2 When `hiddenNames` is true, replace the DJ Name heading with `DJ #N` and the Fur Name field with "—"
