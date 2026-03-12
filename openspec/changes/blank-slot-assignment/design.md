## Context

The lineup builder uses `SlotAssignment` objects that each reference a `submissionNumber` from the loaded DJ submissions. Currently, every filled slot must point to a real DJ submission. There is no way to represent a slot that is intentionally blocked — for things like opening ceremonies, breaks, closings, or other non-DJ activity — causing such slots to appear empty in the lineup grid and absent from results.

The `DJSelectionPanel` today lists only eligible DJ submissions. The `LineupGrid` renders cells based on whether a `SlotAssignment` exists for that slot. `ResultsList` only surfaces real DJ entries.

## Goals / Non-Goals

**Goals:**
- Allow any lineup slot to be assigned a "blank" (blocked) state from the DJ picker
- Each blank-assigned slot carries its own editable label (e.g., "Break", "VIP Set", "Opening Ceremony")
- Show blank-assigned slots in the lineup grid and results list with their individual label
- Label is editable at the time of assignment and after the fact

**Non-Goals:**
- Blocking entire stages or evenings
- Distinguishing between multiple types of blank slots

## Decisions

### Decision: Discriminated union `type: 'dj' | 'blank'` on `SlotAssignment`

`SlotAssignment` is split into a discriminated union: `DJSlotAssignment` (with `type: 'dj'` and a required `submissionNumber`) and `BlankSlotAssignment` (with `type: 'blank'` and an optional `blankLabel`). Both share the common slot-location fields (`stageId`, `evening`, `slotIndex`, `positionIndex`). `SlotAssignment` is the union of the two. `isBlankAssignment(a)` returns `a.type === 'blank'`.

**Rationale**: TypeScript narrows the type correctly at every usage site — code handling DJ assignments never accidentally sees `blankLabel`, and blank-handling code never touches `submissionNumber`. There is no risk of sentinel leakage into submission lookup logic, and intent is explicit in the type. The additional update sites (discriminator checks) are worth the correctness guarantee.

**Alternative considered**: Sentinel value `'__blank__'` in `submissionNumber`. Fewer type changes required, but every submission lookup must manually guard against the sentinel string and TypeScript provides no enforcement of that guard.

### Decision: Per-slot blank label stored in `SlotAssignment.blankLabel`

An optional `blankLabel?: string` field is added to `SlotAssignment`. When a blank assignment is created, the label provided at assignment time is stored directly on that record. When absent or empty, the effective label defaults to `"Blocked"`. No project-level field is needed.

**Rationale**: Per-slot labels allow each blocked slot to describe its own purpose ("Break", "VIP Set", "Opening Ceremony") without affecting other slots. Storing it directly on `SlotAssignment` keeps the data co-located with the assignment and requires no additional lookup. The sentinel value already identifies blank assignments; `blankLabel` is just a payload field on the same record.

**Alternative considered**: Project-level `blankSlotLabel` shared by all blank slots. Simpler initially but forces all blocked slots to carry the same description, which limits expressiveness and prompted this revision.

### Decision: Blank slot label is set via a text input in the DJ picker row

The blank slot row at the top of `DJSelectionPanel` includes a text input for the label to apply to the assignment. The input is pre-filled with `"Blocked"` and can be edited before clicking to assign. Clicking the row (outside the input) assigns the blank slot with the current input value as `blankLabel`. For already-assigned blank slots, clicking the cell reopens the panel with the same blank slot row, where the label can be updated (saving the edited value updates `blankLabel` on the existing `SlotAssignment`).

**Rationale**: The label input is at the natural decision point — the moment the organizer is choosing to block the slot, they can name it. Reusing the same panel flow for editing avoids a separate edit affordance on the grid cell.

## Risks / Trade-offs

- **Union update sites**: Existing code that constructs or destructures `SlotAssignment` must be updated to handle both variants. TypeScript will surface these as compile errors, making them easy to find.
- **Results list skips blank slots in "Did Not Make the Cut"**: Blank assignments are not real submissions, so they must be excluded from rejection-section logic.
- **Export/import compatibility**: If project JSON is shared, older versions will not know how to render `'__blank__'` submissions. This is acceptable — they will show as empty slots, which is safe.
- **Label editing UX**: Editing a label on an existing blank assignment requires opening the DJ panel for that slot, which is a slightly indirect path. An in-cell edit affordance could be added later but is out of scope for this change.
