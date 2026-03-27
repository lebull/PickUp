## Context

The app already tracks slot-level acceptance and decline history, but declined state is not surfaced consistently where organizers make decisions. Three user-facing surfaces need to align on the same declined semantics:

- Submissions list row-state indicators
- Submission detail header area used across pages
- Results slot context panel (detail or replacement picker)

The change spans multiple React components and shared mapping utilities that connect a submission to its current/most-recent assignment context. The UI must remain consistent with hidden-names mode and support both sequential and simultaneous assignments.

## Goals / Non-Goals

**Goals:**
- Add a clear declined indicator in the submissions list with deterministic precedence against existing states.
- Show an explicit declined notice at the top of submission detail when the DJ has declined, including stage/day/slot context.
- Show slot-level prior-decline context in Results panel flows so a user can see who previously declined the selected slot.
- Ensure behavior works for sequential and simultaneous slots.
- Add tests for status computation and rendering across these surfaces.

**Non-Goals:**
- No changes to acceptance-state mutation rules or replacement flow mechanics.
- No redesign of the full submissions table layout beyond status indicator additions.
- No persistence schema migration beyond existing optional acceptance fields.

## Decisions

1. Reuse existing acceptance/assignment source of truth
- Decision: derive declined status from current slot assignments where `acceptanceStatus === 'no'` and preserve slot context from that assignment.
- Rationale: avoids duplicate state and keeps all surfaces consistent with lineup truth.
- Alternative considered: store a separate declined-submission index in project state. Rejected because it risks divergence and extra synchronization code.

2. Add declined state to submission-list indicator priority model
- Decision: extend row-state precedence to include declined status while keeping discarded as highest priority.
- Proposed priority: `discarded > declined > in-lineup > duplicate-name > none`.
- Rationale: a declined assignment is more actionable than generic in-lineup and should be visible without hiding discarded authority.
- Alternative considered: show multiple badges simultaneously. Rejected to avoid visual clutter and unclear precedence.

3. Add a shared declined context helper for detail surfaces
- Decision: create/reuse a helper that maps a submission number to declined assignment context (stage name, evening label, slot label, and simultaneous position label when relevant).
- Rationale: the same context is needed in submission detail and results panel banners; centralizing logic reduces drift and test duplication.
- Alternative considered: compute separately per component. Rejected due to repeated coordinate formatting logic.

4. Results panel top status placement follows active panel type
- Decision: render prior-decline status at the top of whichever right-hand panel is active for the slot (DJ detail or picker).
- Rationale: keeps context colocated with the immediate action area and satisfies requirement regardless of which panel is open.
- Alternative considered: show history only in row-level inline chips. Rejected because it is easy to miss and does not satisfy "top of detail/picker" request.

5. Hidden-names compatibility at presentation layer
- Decision: pass display-name resolver into declined-context rendering so names in notices honor hidden-names mode.
- Rationale: preserves existing privacy behavior in all contexts.
- Alternative considered: always show legal names in notices. Rejected as a privacy regression.

## Risks / Trade-offs

- [Ambiguous "any page" detail usage] -> Mitigation: implement in shared submission detail component/header so all callers inherit behavior.
- [Multiple declined slots for one DJ over time] -> Mitigation: define deterministic rule (show current declined assignment; if none current, show most recent declined history entry if available).
- [Badge precedence surprises users] -> Mitigation: capture precedence explicitly in specs and tests.
- [Simultaneous slot labeling complexity] -> Mitigation: reuse existing slot label utilities and add simultaneous-specific tests.

## Migration Plan

- No data migration required; existing optional fields already support behavior.
- Rollout is UI-only and backward compatible with records missing acceptance metadata.
- Rollback strategy: revert UI/spec changes; persisted project data remains valid.

## Open Questions

- Should submissions list declined badge include slot shorthand (for example, stage/day) or remain a simple state tag?
- If a DJ declined and was later reassigned/accepted, should historical decline still appear in detail by default, or only active declined status?
