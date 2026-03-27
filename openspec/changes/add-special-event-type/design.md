## Context

The lineup planner currently models assignable positions through day-bound stage schedules and two navigation modes (Day View and Stage View). Upcoming partner-run special events require assigning DJs to invitation tracks that do not map to any specific convention day, fixed time ranges, or fixed slot counts, while still flowing through the same selection and results workflows.

This change introduces a third lineup browsing surface (Special Events) and extends stage typing to support a `special` type alongside `sequential` and `simultaneous`. The design must preserve existing non-special behavior and avoid regressions in score-based selection and results generation.

## Goals / Non-Goals

**Goals:**
- Introduce a first-class `special` stage type that does not require active days, start/end times, or derived slot counts.
- Allow users to access special-event assignments from a tab adjacent to Day View and Stage View.
- Reuse existing DJ assignment and scoring behavior for special-event selections.
- Show special-event selections in Results under a dedicated section below "Did Not Make the Cut".
- Keep simultaneous-stage and sequential-stage workflows unchanged and fully supported.

**Non-Goals:**
- Redesigning existing day/stage grids.
- Adding external integrations for partner event export.
- Changing scoring formulas or applicant ranking logic.

## Decisions

1. Extend stage domain model with a third stage type.
- Decision: Add `special` to stage typing as a peer to `sequential` and `simultaneous`.
- Rationale: This directly matches organizer intent and avoids forcing special picks through day-based schedule structures.
- Alternative considered: Infer special events from missing times/slots. Rejected because inference is brittle and increases migration complexity.

2. Represent special-stage assignments as list-based picks, not day/slot cells.
- Decision: Store special selections in a special-stage assignment list with stable ordering and remove/edit controls.
- Rationale: No fixed slot count and no fixed day means list semantics fit naturally and avoid fake slot/day values.
- Alternative considered: Emulate synthetic slot indexes. Rejected because arbitrary slot fabrication creates misleading UI constraints.

3. Add a top-level Special Events tab in lineup navigation.
- Decision: Extend the existing view-mode control to include Day, Stage, and Special Events.
- Rationale: Keeps mental model consistent: users select a planning surface first, then assign DJs in that context.
- Alternative considered: Nest special events inside Stage View selector. Rejected because special events are cross-stage and non-temporal.

4. Results ordering keeps rejection semantics intact, then appends special-stage outcomes.
- Decision: Continue computing accepted/rejected lists for scheduled events as-is; render a separate special-events section after "Did Not Make the Cut".
- Rationale: Preserves existing communication workflow while making partner-event picks visible without mixing them into stage-based acceptance blocks.
- Alternative considered: Merge special events into accepted stage sections. Rejected because special events are not stage-slot outcomes and confuse acceptance interpretation.

## Risks / Trade-offs

- [Risk] Ambiguity between "accepted for lineup" and "selected for special event" could confuse operators.
  → Mitigation: Use explicit section titles and labels in Results and Special Events view.

- [Risk] Data migration edge cases for projects that assume every assignment has stage/day/slot indices.
  → Mitigation: Add migration guards and targeted tests for old and new assignment shapes.

- [Risk] Navigation complexity increases with a third tab.
  → Mitigation: Preserve existing defaults (Day View) and keep tab labels explicit and stable.

- [Trade-off] Introducing a new assignment shape increases conditional logic in utilities.
  → Mitigation: Centralize event-kind branching in dedicated helper functions and cover with unit tests.
