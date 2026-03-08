## Context

Currently, `SlotAssignment` uses `djName` (a free-text string) as the foreign key linking an assignment back to a submission. `djName` is not unique — two DJs can submit under the same name, causing duplicate entries in the selection panel and broken exclusion logic. `submissionNumber` is already a field on every `Submission`, is assigned by the Google Form on intake, and is guaranteed unique per form response.

The `SubmissionsView` already bridges the gap via `submissions.find((s) => s.djName === a.djName)?.submissionNumber` — a lookup that itself breaks when names collide. `SubmissionList` and lineup indicator logic already use `submissionNumber` as the indicator key, but the data feeding it is derived through the broken `djName` lookup.

`loadSubmissions.ts` currently has a workaround that deduplicates by `djName`, discarding earlier submissions. This workaround must be removed once `submissionNumber` is the key.

## Goals / Non-Goals

**Goals:**
- Replace `SlotAssignment.djName` with `SlotAssignment.submissionNumber` as the canonical foreign key
- Remove the `djName`-deduplication workaround in `loadSubmissions.ts`
- Update all assignment creation, lookup, and display code to use `submissionNumber`
- Provide a forward-migration path for existing persisted projects (resolve `djName` → `submissionNumber` on load)
- Display layer continues to use `djName` (or hidden alias) — only the *identity* field changes

**Non-Goals:**
- Renaming `djName` on the `Submission` type itself
- Changing how DJ names are displayed anywhere
- Migrating old IndexedDB data automatically without a CSV being loaded

## Decisions

### Decision: `SlotAssignment.submissionNumber: string` replaces `djName`

`submissionNumber` is the form-assigned unique identifier (e.g., `"42"`). It is already present on every `Submission` and is stable across re-imports of the same CSV as long as the row order doesn't change. Alternative considered: use a UUID generated at parse time — rejected because it wouldn't survive re-import (assignments would become orphaned every time the CSV is reimported).

### Decision: Display in `LineupGrid` resolves submission at render time

When rendering a filled slot in `LineupGrid`, look up `submissions.find(s => s.submissionNumber === a.submissionNumber)` to get `djName` for display. This is O(n) per cell but the submission list is small (<200) and already passed as a prop.

### Decision: Drag-and-drop data key changes to `application/dj-submission-number`

The drag data type string changes from `application/dj-name` to `application/dj-submission-number`. This is purely internal to the browser drag event and has no persistence implications.

### Decision: Migration on project load — resolve `djName` → `submissionNumber` using loaded CSV

When opening an existing project, if an assignment has a `djName` field but no `submissionNumber`, attempt to find a matching submission by `djName` and patch in its `submissionNumber`. This handles existing saved projects gracefully without requiring a manual migration step. Assignments that cannot be resolved are dropped with a console warning.

### Decision: Remove `djName` dedup in `loadSubmissions.ts`

The dedup was a workaround for the name-collision bug. Once `submissionNumber` is the key, all submissions are kept. Each has a unique `submissionNumber` so no deduplication is needed.

## Risks / Trade-offs

- **Risk: Existing saved projects have `djName`-keyed assignments** → Mitigation: migration on load (see Decision above). Only fires if project has assignments but loaded CSV resolves them. Projects with no CSV loaded retain their (now-orphaned) assignments until a CSV is imported.
- **Risk: `submissionNumber` is a string from a form and could theoretically be blank** → Mitigation: `loadSubmissions.ts` already calls `.trim()` on all fields; empty submission numbers will be logged as warnings at parse time.
- **Risk: Re-importing a different CSV after assignments are made could break lookups** → This is the same risk that existed before (row count mismatch warning already exists). No new risk introduced.

## Migration Plan

1. Update `SlotAssignment` type (add `submissionNumber`, keep `djName` as optional legacy field during transition)
2. Update all write paths to emit `submissionNumber` instead of `djName`
3. On `getProject` load in `App.tsx`, run migration pass: if `a.submissionNumber` is missing and `a.djName` is present, resolve via submissions array
4. Remove `djName` from `SlotAssignment` type once migration pass is in place
5. Remove dedup workaround from `loadSubmissions.ts`
6. `tsc --noEmit` clean
