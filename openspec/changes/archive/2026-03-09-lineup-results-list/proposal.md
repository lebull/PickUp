## Why

Once a lineup is finalized, coordinators need to contact every DJ — both those who made it and those who did not — to communicate the results. There is currently no view that consolidates DJ contact information grouped by decision, making it tedious to draft and send acceptance and rejection emails. This is needed immediately after lineup building is complete.

## What Changes

- A new **Results List** tab is added to the main navigation.
- The results list groups accepted DJs by stage, showing DJ name, contact email, and Telegram/Discord for each.
- A separate **Did Not Make the Cut** section lists all non-accepted DJs (including discarded DJs) with the same contact fields, except those whose duplicate submission was assigned to a stage.
- Clicking any DJ row opens the existing submission detail view inline (same as the submission list).
- DJs with multiple (duplicate) submissions are de-duplicated on the results list:
  - If any of their submissions was assigned a slot, only the assigned submission(s) appear in the accepted section; no duplicate entry appears in the rejection section.
  - If none of their submissions was assigned, only one rejection entry is shown.
  - An informational alert lists all email addresses that require manual follow-up due to duplicate submissions.
- Genre and format are displayed alongside contact info as secondary context.

## Capabilities

### New Capabilities

- `lineup-results-list`: A read-only results view showing accepted DJs grouped by stage and a rejection list, with contact info and duplicate-submission de-duplication logic, plus a manual-review alert when duplicates are present.

### Modified Capabilities

_(none)_

## Impact

- `app/src/App.tsx` or main router — add new Results tab/route
- `app/src/components/` — new `ResultsList.tsx` component
- Reads from `project.assignments`, `project.stages`, `project.discardedSubmissions`, and the parsed `submissions` array
- No changes to data model or persistence
