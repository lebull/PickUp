## Context

The DJ selection panel in `DJSelectionPanel.tsx` currently hard-filters submissions by `daysAvailable` before building the visible list. Any DJ not available on the active evening is simply excluded. This was the original design intent, but it prevents organizers from reviewing all candidates and making intentional exceptions.

The lineup grid already has an `isUnavailable` flag that renders an alert state on cells when an assigned DJ is unavailable on that evening. We are extending the same concept upstream into the picker itself: show unavailable DJs, but flag them visually, and let the user choose whether to hide them entirely.

## Goals / Non-Goals

**Goals:**
- Replace the hard availability filter in the DJ selection panel with an opt-in "Available only" toggle.
- Render any unavailable DJ row in an alert/warning state (icon + tooltip + CSS modifier) in both slot-selected and browsing states.
- The availability toggle state should reset when the active evening changes (same lifecycle as the focus-stage reset).
- Apply consistently to the slot-selected state AND the browsing (no-slot) state.

**Non-Goals:**
- Changing the grid cell availability error display (already implemented in `slot-drag-drop-availability` change).
- Sorting unavailable DJs to the bottom of the list (sort order remains score-based; unavailability is visual-only).
- Persisting the filter toggle between sessions or across evening changes.
- Adding availability filtering to the submission list (`SubmissionList.tsx`).

## Decisions

**Decision: Opt-in filter toggle instead of default-hide**

The hard filter was convenient but lossy. Organizers may want to book a DJ who listed "Friday" but is able to make an exception, or to compare scores across all candidates. The toggle defaults to OFF (show all DJs) in both browsing and slot-selected states.

*Alternative considered*: Default the toggle to ON (available-only), matching current behavior. Rejected — the change is motivated by the need to *see* unavailable DJs; defaulting to ON adds friction without benefit.

*Alternative considered*: A separate "Show unavailable" toggle (default OFF). Semantically equivalent to an "Available only" toggle but more confusing labeling. "Available only" is simpler.

**Decision: Reset toggle on evening change, not on slot change**

The toggle is about the current day's context. Switching evenings invalidates availability relevance, so the toggle resets to OFF. Switching slots within the same evening preserves the user's filter preference (same rationale as the focus-stage reset lifecycle).

**Decision: Alert state is visual-only, assignment is never blocked**

Consistent with the existing grid-cell `isUnavailable` behavior: availability mismatches are a warning, not a hard block. Organizers have legitimate reasons to override.

**Decision: Single `isUnavailable` boolean computed per DJ row**

Use the same substring-match logic already in `LineupGrid.tsx` and `DJSelectionPanel.tsx`: `!s.daysAvailable.toLowerCase().includes(effectiveEvening.toLowerCase())`. No new data model changes needed.

**Decision: CSS modifier class `dj-row--unavailable` on the row**

Mirrors the `grid-slot--availability-error` pattern already in the grid. An icon (e.g., ⚠) is prepended to the DJ name cell and a `title` attribute shows the DJ's actual available days. Exact visual treatment (color, icon) is a CSS/design concern left to implementation.

## Risks / Trade-offs

- **Free-text `daysAvailable` false negatives** → Same pre-existing limitation noted in `slot-drag-drop-availability` design. Not worsened by this change.
- **More DJs visible by default** → Longer list; organizers familiar with the hard-filter may find the list noisier. Mitigated by the "Available only" toggle and the clear visual alert state.
- **Toggle state not persisted** → If a user reloads mid-session, the toggle resets. Acceptable given the session-scoped nature of lineup building.

## Migration Plan

No data migration required. The change is UI-only. The `daysAvailable` field and existing `isUnavailable` logic are reused as-is. Deployment is a standard front-end build. No rollback complexity.
