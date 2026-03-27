## Context

The Results view already supports bulk email copying for accepted DJs at the per-stage level through a shared modal and a helper that builds a comma-separated email list from visible result rows. The rejection section is built from a separate `rejectionList`, but it uses the same `DJRowItem` rendering path and already has the data needed to support the same bulk-copy interaction.

## Goals / Non-Goals

**Goals:**
- Add a bulk-copy entry point to the rejection section without introducing a separate email workflow.
- Keep the accepted-stage and rejected-section copy behavior visually and behaviorally consistent.
- Ensure the copied rejection email list includes only rejected DJs with non-empty email addresses.

**Non-Goals:**
- Changing how accepted-stage email copying works.
- Introducing email deduplication or validation rules beyond the current results-list behavior.
- Changing the duplicate-submission alert logic or rejection-list membership rules.

## Decisions

1. Reuse the existing `EmailModal` and `handleOpenEmailModal` flow.
   Rationale: The current modal already handles display, selection, and clipboard copy for a supplied label and email string. Passing the rejection rows through the same path keeps behavior aligned and avoids a second modal implementation.
   Alternative considered: Building a dedicated rejection copy control and modal. Rejected because it would duplicate UI and state handling for no functional gain.

2. Add a heading-row action to the rejection section that mirrors the accepted-stage section action.
   Rationale: Users already learn the "Copy emails" pattern from stage sections. Reusing that control in the rejection section minimizes UI surprise and preserves the Results view layout conventions.
   Alternative considered: Adding copy functionality only inside individual rows. Rejected because the requirement is bulk communication, not per-contact copying.

3. Continue filtering the copied address list by truthy `contactEmail` values at copy time.
   Rationale: This matches the accepted-stage behavior and prevents empty values from appearing in the clipboard payload.
   Alternative considered: Disabling the action when some rejected DJs lack emails. Rejected because partial bulk copy is still useful, and the current modal flow already tolerates sparse email data.

## Risks / Trade-offs

- [Users may assume the rejection copy action includes every rejected DJ, even those without email addresses] → Mitigation: Build the clipboard payload from available `contactEmail` values only, matching existing copy behavior.
- [The rejection section layout could drift from accepted sections if styled separately] → Mitigation: Reuse the existing heading-row and modal patterns instead of introducing unique markup.
- [Future changes to modal labeling may become stage-centric] → Mitigation: Treat the modal label as a generic section title and pass the rejection heading text through the same interface.