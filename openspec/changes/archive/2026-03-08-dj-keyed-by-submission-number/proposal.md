## Why

DJ submissions are currently identified by `djName` (a free-text string) throughout the data model and UI. When two DJs submit under the same name — which has already happened with `rena` and `KHALIBER` — the app produces duplicate entries in the selection panel, broken deduplication logic, and incorrect assignment tracking. `submissionNumber` is a stable, unique identifier already present on every submission and is the correct primary key.

## What Changes

- **BREAKING** `SlotAssignment.djName` renamed to `SlotAssignment.submissionNumber` — stored assignments now reference submission number, not DJ name
- All assignment lookup, filtering, and deduplication logic switches from `djName` to `submissionNumber`
- The deduplication workaround in `loadSubmissions.ts` (keeping last entry per `djName`) is removed — all submissions are now kept, each uniquely identified by `submissionNumber`
- Display of DJ names throughout the UI continues to use `djName` (or the hidden-name alias), but lookups and keys always use `submissionNumber`
- The `DJSelectionPanel` card `key` prop and drag-data use `submissionNumber`
- `SubmissionList` keyboard navigation and lineup indicator use `submissionNumber`

## Capabilities

### New Capabilities

- `submission-identity`: Establishes `submissionNumber` as the canonical key for a submission across assignments, filtering, drag-and-drop, and UI state. Replaces all usages of `djName` as an identity field.

### Modified Capabilities

- `lineup-persistence`: `SlotAssignment` shape changes — `djName` field replaced by `submissionNumber`. Persisted projects with old `djName`-based assignments will need migration handling.
- `dj-selection-panel`: Panel filtering, exclusion logic, card keys, and drag data all switch from `djName` to `submissionNumber`.

## Impact

- `app/src/types.ts` — `SlotAssignment` interface
- `app/src/loadSubmissions.ts` — remove `djName` dedup workaround
- `app/src/components/DJSelectionPanel.tsx` — `assignedDjNames` → `assignedNumbers`, card keys, drag data, `handleAssign`
- `app/src/components/LineupGrid.tsx` — assignment lookup by `submissionNumber`
- `app/src/components/LineupView.tsx` — `handleAssign`/`handleRemove`/`handleAddSimultaneous` signatures
- `app/src/components/SubmissionList.tsx` — lineup indicator check
- `app/src/components/SubmissionDetail.tsx` — if it resolves submissions by key
- `app/src/projectStore.ts` — migration: on load, if an assignment has `djName` but no `submissionNumber`, attempt to resolve it from the loaded CSV submissions
