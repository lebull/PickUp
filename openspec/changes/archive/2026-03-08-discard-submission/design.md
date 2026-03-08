## Context

The app stores submissions by parsing a CSV into `Submission` objects in memory (not persisted independently). Projects persist to IndexedDB via `projectStore.ts` and carry `assignments`, `stages`, `csvText`, etc. There is currently no mechanism to exclude a submission from consideration other than simply not adding it to the lineup.

The submission list already renders per-row state badges via the `submission-list-lineup-indicator` mechanism (tracking whether a submission's `submissionNumber` is present in `project.assignments`). This visual-state system is the natural extension point for a `discarded` state.

The `normalizeProject` function in `projectStore.ts` provides a forward-compatibility pattern: fields added in new versions can be defaulted in for legacy projects loaded from IndexedDB.

## Goals / Non-Goals

**Goals:**
- Allow users to mark/unmark a submission as discarded from the submission list.
- Persist the set of discarded submission numbers in the project (IndexedDB).
- Show a distinct visual state for discarded rows in the submission list.
- Show a duplicate-name warning on any row that shares a `djName` with another non-discarded submission.
- Exclude discarded submissions from the DJ selection panel.

**Non-Goals:**
- Permanently deleting submissions from the CSV data.
- Bulk discard operations.
- Audit logging or undo history for discard actions.
- Sorting/filtering discarded submissions out of the list by default (they remain visible with a visual indicator).

## Decisions

### Decision 1: Store discarded submissions as `discardedSubmissions: string[]` on `Project`

**Options considered:**
- A) Store as `string[]` (array of `submissionNumber`) on `Project`.
- B) Store as a boolean field directly on `Submission` objects.
- C) Keep a separate IndexedDB store for discard state.

**Choice: A**

`Submission` objects are derived from the CSV at runtime and are not persisted independently, so annotating them directly (B) would require either re-deriving them or storing mutations separately. A separate store (C) adds unnecessary complexity. Storing a `string[]` on `Project` is consistent with how `assignments` work, keeps state co-located, and leverages the existing `normalizeProject` backward-compat pattern to default it to `[]` for legacy projects.

At runtime, the array can be converted to a `Set<string>` for O(1) lookup when rendering the list.

### Decision 2: Duplicate-name detection computed at render time from live submission list

Duplicate DJ name detection is purely a derived value: for each submission, check whether any other non-discarded submission shares the same `djName`. This is computed in the component (or a selector) rather than stored, so it stays fresh as discards change. No additional persistence is needed.

### Decision 3: Discard action exposed as a row-level icon button, not a context menu

Given the existing row-badge pattern for the lineup indicator, a small icon button (e.g. a trash/ban icon) placed in the row's action area is the least-invasive addition. It avoids needing a context menu and is consistent with the direct-manipulation style of the app.

### Decision 4: Extend the row-state system to a priority-ordered multi-state model

Current states: `in-lineup` | `none`.  
New states: `in-lineup` | `discarded` | `duplicate-name` | `none`.

Priority order for display: `discarded` > `in-lineup` > `duplicate-name` > `none`. A discarded submission cannot meaningfully be "in lineup" (it would be filtered from selection), so `discarded` takes highest priority. `in-lineup` overrides `duplicate-name` because a booked submission is already resolved.

## Risks / Trade-offs

- **Risk**: User accidentally discards the wrong submission.  
  → **Mitigation**: The discard action is toggleable (undo by clicking again). No confirmation dialog required given the low stakes and easy reversibility.

- **Risk**: Legacy projects in IndexedDB lack `discardedSubmissions` field.  
  → **Mitigation**: `normalizeProject` defaults `discardedSubmissions` to `[]` for any project missing the field.

- **Risk**: Discarded submissions silently lost on project export/import.  
  → **Mitigation**: `discardedSubmissions` is a top-level field on `Project`, so it is included automatically in JSON export/import with no special handling required.

- **Trade-off**: Discarded submissions remain visible in the list (rather than hidden).  
  → This is intentional: coordinators need to see what was discarded and why, and may need to un-discard. Hiding them would require a filter toggle and adds scope; the visual indicator is sufficient.

## Migration Plan

1. Add `discardedSubmissions: string[]` to the `Project` type.
2. Update `normalizeProject` to default `discardedSubmissions` to `[]` for legacy records.
3. Extend the `ProjectContext` to expose a `toggleDiscardSubmission(submissionNumber: string)` action.
4. Update `SubmissionList` row rendering to compute and display the new indicator states.
5. Update `DJPool` / `DJSelectionPanel` to filter out discarded submissions.
6. No DB version bump required (additive field, handled by `normalizeProject`).

Rollback: removing the field from `normalizeProject` and the UI is sufficient; no data migration needed since the field is simply ignored by older code.

## Open Questions

- Should discarded submissions be visually collapsed/dimmed but still present, or should they optionally be hidden? (Deferred — show-all with indicator is the initial scope.)
- Should the duplicate-name warning appear on ALL submissions with that name, or only on the one that appears to be the duplicate (e.g., later submission number)? (Initial design: warn on all non-discarded duplicates; the coordinator decides which to discard.)
