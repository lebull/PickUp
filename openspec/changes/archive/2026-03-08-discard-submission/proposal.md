## Why

Event coordinators sometimes need to remove a submission from consideration before lineup building begins — for example, when a DJ accidentally submits twice or a submission is otherwise invalid. Currently there is no way to mark a submission as discarded, so these entries pollute the DJ pool and can cause confusion. This is needed now because lineup building relies on a clean, trustworthy submission list.

## What Changes

- Users can mark any submission as **discarded** from the submission list view.
- Discarded submissions are visually distinguished in the submission list (building on the existing in-lineup indicator mechanism).
- Submissions with a duplicate `djName` (where the other submission sharing that name is not yet discarded) display a **duplicate warning indicator**, alerting the user to a potential accidental double-submission.
- The duplicate warning resolves automatically once all but one submission with that name have been discarded.
- Discarded submissions are excluded from the DJ selection panel and cannot be added to the lineup.
- Discarded state is persisted with the project.

## Capabilities

### New Capabilities
- `submission-discard`: Ability to mark/unmark a submission as discarded from the submission list, with persistence in project state and exclusion from DJ pool.

### Modified Capabilities
- `submission-list-lineup-indicator`: The row-state visual indicator system must be extended to support a `discarded` state and a `duplicate-name` warning state, in addition to the existing `in-lineup` state.
- `submission-list`: The submission list must filter or visually suppress discarded submissions, and the discard action must be accessible from the list row.
- `dj-selection-panel`: Discarded submissions must be excluded from the DJ selection pool.

## Impact

- `types.ts`: Add `discarded` boolean field to `Submission` type (or to project state as a `Set<submissionNumber>`).
- `projectStore.ts`: Persist discarded submission numbers; expose toggle action.
- `SubmissionList.tsx` / `SubmissionList` component: Add discard toggle action to each row; render new indicator states.
- `DJPool` / `DJSelectionPanel`: Filter out discarded submissions from selectable DJs.
- `submission-list-lineup-indicator` spec: Extend to cover new visual states.
