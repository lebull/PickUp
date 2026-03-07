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

## 4. Submission List — Genre and Stage Preference Filters

- [ ] 4.1 Derive a deduplicated list of genre values from loaded submissions; render multi-select genre filter controls above the table
- [ ] 4.2 Implement genre filter logic: when genres are selected, only submissions matching at least one selected genre are shown; no selection shows all
- [ ] 4.3 Derive stage names from the project's configured stages; render multi-select stage preference filter controls
- [ ] 4.4 Implement stage preference filter logic: when stages are selected, only submissions with at least one matching value in `stagePreferences` are shown; no selection shows all
- [ ] 4.5 Ensure genre, stage, and day filters compose as an intersection (all active filters must match)

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
