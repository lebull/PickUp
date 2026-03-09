## Context

The app has two main workspace views — Submissions and Lineup Builder — but no way to review the final outcome. Once a lineup is complete, coordinators must manually cross-reference assignments against the full submission list to draft acceptance and rejection emails. A Results view consolidates this into one place: who got a slot (grouped by stage) and who did not, with contact info front and center. The view is read-only and purely derived from existing data.

## Goals / Non-Goals

**Goals:**
- Add a Results tab and `/project/:id/results` route following the existing tab/route pattern
- Accepted section: assigned DJs grouped by stage, showing name, email, Telegram/Discord, genre, format
- Rejection section: all non-accepted DJs (including discarded), de-duplicated by `djName`
- Informational alert when duplicate-name submissions exist, listing emails that need manual handling
- Clicking any DJ entry opens the existing `SubmissionDetail` component in a side panel

**Non-Goals:**
- Sending emails from the app
- Editing or re-ordering lineup assignments from this view
- Copying/exporting the results list
- Deduplicating DJs with different `djName` spellings (same person, different names)

## Decisions

### Decision: New route at `/project/:id/results`, tab shown with submissions

Add a `results` route as a sibling to `submissions` and `lineup` in `App.tsx`. The "Results" tab in the header nav follows the same `NavLink` pattern and is shown under the same condition: `submissions !== null`. No new context or state management layer is needed — the component reads from the existing `ProjectContext`.

### Decision: De-duplication keyed on `djName`

Duplicate submissions are identified by shared `djName`. For each distinct `djName` group:
- If **any** submission in the group is assigned → all assigned submissions for that DJ appear in the accepted section; the group is excluded entirely from the rejection section.
- If **no** submission is assigned → exactly one entry appears in the rejection section. Prefer the non-discarded submission; if all are discarded, use the first one.

This approach matches how coordinators think (one person, multiple submissions) and is consistent with how duplicate-name detection works elsewhere in the app.

**Alternatives considered**: De-dup by `contactEmail` — rejected because the data is user-entered and may be missing; `djName` is already the established identity signal.

### Decision: Manual-review alert lists affected emails

When any `djName` group has more than one submission, show an informational banner listing the contact email (and Telegram/Discord if present) for each affected group. This tells coordinators which addresses they need to check manually (e.g., the person may have submitted under two names). The alert is always visible — no collapse needed for an edge-case notice.

### Decision: Side panel using local state, not URL

The submission detail pane is driven by a local `selectedSubmission` state in `ResultsList.tsx`, following the same `SplitPane` pattern as `SubmissionsView`. No URL parameter is needed for this read-only view.

**Alternatives considered**: URL-based (`?selected=<submissionNumber>`) for shareability — rejected as over-engineering; results links are not shared, and the extra router wiring adds complexity for no gain.

### Decision: Accepted section ordered by stage then slot

Stages are listed in `project.stages` array order. Within each stage, assignments are sorted by evening then `slotIndex` (or `positionIndex` for simultaneous slots). DJ name is the primary text; email, Telegram/Discord, genre, and format are secondary.

## Risks / Trade-offs

- [Risk] Two submissions from the same person with different `djName` spellings won't be de-duplicated → Mitigation: the manual-review alert covers only the known duplicate-name case; other cases require coordinator judgment and are out of scope.
- [Risk] Showing discarded DJs in the rejection section may surprise coordinators who expected them to be silently excluded → Mitigation: this is the correct behavior per requirements (they still need a "no thank you" email), and the discarded visual context from `SubmissionDetail` will clarify their status when clicked.
