## Context

The submissions browser is the primary tool for event organizers to review and select DJs. Currently it has three pain points:

1. **Day filter has no utility**: Day-availability filtering was useful during lineup building, but on the submissions page is redundant — organizers just want to browse all DJs. The toggle buttons consume prominent UI space without benefit.

2. **Confused status badges**: Lineup status ("✓ In Lineup") and submission quality issues ("⚠ Duplicate Name", "✕ Discarded") are rendered in the same table cell with similar badge styling. This makes it hard to scan the list and distinguish "this DJ has data issues" from "this DJ is already scheduled."

3. **Keyboard navigation requires Enter to navigate**: Arrow keys move a cursor highlight but don't change the detail panel until the user presses Enter. This breaks the expected flow for power users who want to quickly scan submissions.

**Current state:** `SubmissionList.tsx` renders day toggle buttons in the controls row, all row-state badges in the DJ Name column, and handles arrow key events by only updating cursor position (not triggering navigation).

## Goals / Non-Goals

**Goals:**
- Remove day filter controls from the submissions browser
- Add a fuzzy search bar that filters submissions by DJ name inline
- Create a "Stage Assignment" column that shows in-lineup stage badges separately from submission-quality badges
- Add a "View stage assignments" toggle that controls both the new column and row color tinting
- Make arrow key navigation immediately update the detail panel, scroll cursor row into view

**Non-Goals:**
- Fuzzy search on fields other than DJ name (genre, stages, etc.)
- Persisting the "View stage assignments" toggle state across sessions
- Changing the day filter behavior in the Lineup Builder pool view (unaffected)
- Changing any badge visual styling (colors, icons remain the same)

## Decisions

### Decision: Fuzzy search implementation — inline substring match, no library

**Choice:** Implement fuzzy search as a case-insensitive substring match on `djName` (or anonymized ID when Hidden Names active). No third-party fuzzy library.

**Rationale:** Submission lists are typically ≤200 rows; substring matching is fast enough to run on every keystroke without memoization overhead. A proper fuzzy library (Fuse.js) adds a dependency and tuning surface for marginal benefit at this scale. Substring match on the DJ name field is the dominant use case — organizers type part of a name to find a DJ, not approximate phonetic spellings.

**Alternative considered:** Fuse.js weighted matching. Rejected: over-engineered for the data scale; adds a dependency; harder for users to predict results.

### Decision: Stage Assignment column placement — after Preferred Stages, before Days Available removal

**Choice:** Insert the Stage Assignment column as the last column before optional columns (Vibefit). It receives assignments-related badge; the DJ Name column retains only quality-issue badges (Discarded, Duplicate Name).

**Rationale:** Keeps the logical grouping: left side is identity + scores + genre, right side is organizational (stage, vibefit). Stage assignment is metadata about the scheduling decision, not an intrinsic property of the DJ submission.

### Decision: Toggle state — local React state, not persisted

**Choice:** The "View stage assignments" toggle is local `useState` in `SubmissionsView`, defaulting to `false` (off).

**Rationale:** Stage assignment coloring is contextual to a working session. Persisting it would require adding a preference key and migration, with little user benefit. Users building lineuds will turn it on; others browsing for prospects don't need it.

**Alternative:** Persist in `AppPreferences`. Rejected: adds persistence overhead not justified for a view-mode toggle.

### Decision: Arrow key behavior — immediately call `onSelect`

**Choice:** Modify the `ArrowDown`/`ArrowUp` keyboard handler to call `onSelect(origIndex, displayedIndex)` immediately after updating cursor position, rather than waiting for Enter/Space.

**Rationale:** Matches the expected behavior of a master-detail list (like macOS Finder or email clients). The detail panel is always visible alongside the list; it should track the cursor in real time. Enter/Space continue to work as an explicit activate gesture.

**Risk:** If the user is scrolling quickly with arrow keys, each keydown triggers a navigation/state update. At ≤200 rows this is imperceptible. For pools in lineup builder this component is not used for selection so there is no conflict.

### Decision: Scroll-into-view — native `scrollIntoView({ block: 'nearest' })`

**Choice:** After updating cursor position, find the row element by `data-displayed-index` attribute and call `el.scrollIntoView({ block: 'nearest' })`.

**Rationale:** `block: 'nearest'` only scrolls when the element is outside the viewport, leaving the scroll position unchanged if the row is already visible. This is the standard pattern and requires no additional calculation.

## Risks / Trade-offs

- **Search removes day filter, not augments it**: Some organizers may have relied on the day filter to narrow candidates. The fuzzy name search provides different utility. Risk: minor feature regression for that workflow. Mitigation: the day availability data remains visible in the table; organizers can still see which days a DJ is available.
- **Arrow-key-immediate-navigate may feel noisy**: Rapid arrow key scanning fires navigation on every step. Mitigation: the detail panel update is in-place and fast; no network calls involved. Acceptable trade-off for the improved keyboard affordance.
- **Stage assignment toggle defaults to off**: New users may not discover stage assignment coloring. Mitigation: toggle is prominently labeled; color tinting was already subtle and not relied on as a primary signal.
