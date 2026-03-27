## Context

Organizers finalize a lineup and then contact each assigned DJ to confirm participation. Responses (yes/no) currently must be tracked externally. When a DJ declines, finding a replacement requires switching to the Lineup Builder tab, locating the slot, and running the normal picker — losing the results context. There is also no way to quickly locate a specific DJ in the Results list when the roster is large.

Current state:
- `DJSlotAssignment` has no status or history fields; acceptance is implicit (presence in assignments).
- `ResultsList.tsx` is a read-only view — no mutation actions.
- `DJSelectionPanel` already implements all needed DJ-selection logic; it is consumed by `LineupView`.
- `projectStore` exposes assignment mutations used by `LineupView`.

## Goals / Non-Goals

**Goals:**
- Track per-slot acceptance status (`pending` / `yes` / `no`) on `DJSlotAssignment`, persisted in project data.
- Allow Results tab users to mark acceptance inline without leaving the tab.
- Provide an inline replacement picker in the Results tab for declined slots, excluding any DJ who previously declined that same slot.
- Add a text search field to the Results list.
- Group per-stage slot rows in the Results list by day of the week.

**Non-Goals:**
- Acceptance tracking for special-event assignments (no fixed slots; follow-on if needed).
- External notification or email sending.
- Score or filter changes to the DJ picker when used from Results (same behavior as in Lineup Builder, minus declined DJs).
- Acceptance tracking on simultaneous-stage positions beyond sequential slots — simultaneous positions ARE in scope for status display and replacement picker.

## Decisions

### 1. Store acceptance state directly on `DJSlotAssignment`

**Decision:** Add `acceptanceStatus?: 'pending' | 'yes' | 'no'` and `declinedBy?: string[]` to `DJSlotAssignment`. Both fields are optional with safe defaults (`'pending'` and `[]`) so existing saved data remains valid without migration.

**Alternatives considered:**
- Separate `acceptanceMap` at the project level (keyed by slot coordinates): Rejected — joins are error-prone and slot coordinates are not a stable key (eventIndex changes break lookups).
- A new `acceptanceRecords` array: Rejected — more complex to query and update than co-locating state on the assignment itself.

### 2. `declinedBy` accumulates on the assignment, not the slot coordinates

**Decision:** Each `DJSlotAssignment` carries `declinedBy: string[]` listing submissionNumbers of DJs who previously held that slot and declined. When a replacement is made, the departing DJ's submissionNumber is appended to `declinedBy` and carried over to the new assignment.

**Why:** The slot coordinates (stageId + evening + slotIndex + eventIndex) are stable keys for a physical slot, but the assignment object is replaced on each reassignment. Carrying `declinedBy` forward preserves the full history regardless of how many replacements occur.

### 3. Reuse `DJSelectionPanel` with an additional exclusion prop

**Decision:** Add an optional `excludedSubmissionNumbers?: Set<string>` prop to `DJSelectionPanel` that the panel combines with `discardedSubmissionNumbers` when filtering the DJ list. `ResultsList` passes the slot's `declinedBy` set via this prop.

**Alternatives considered:**
- Duplicate panel logic inside ResultsList: Rejected — violates DRY; complex panel logic (scores, filters, drag/drop) should not be duplicated.
- Filter inside projectStore / data layer: Rejected — filtering is a presentation concern tied to a specific slot's history.

### 4. Inline picker in ResultsList via local `activeReplacementSlot` state

**Decision:** `ResultsList` maintains a local `activeReplacementSlot` state (slot coordinate or null). When a slot row with `acceptanceStatus === 'no'` is clicked, `activeReplacementSlot` is set and a `DJSelectionPanel` is rendered inline (below or beside the stage table in a `SplitPane`). Selecting a DJ clears `activeReplacementSlot` and calls the normal assignment mutation.

**Why:** Keeping picker state local to ResultsList avoids lifting state into a shared context that the Results view doesn't otherwise need.

### 5. Search is client-side text filter on displayed DJ rows

**Decision:** A single uncontrolled text input at the top of ResultsList filters visible rows by matching against DJ name, furry name, email, telegram/discord, and phone. Filtering is case-insensitive substring matching. Filter applies across all stage sections simultaneously.

**Why:** The roster fits comfortably in memory; no debounce or server query needed. Simple substring matching covers all identifying fields a user might type.

### 6. Day grouping within each stage section

**Decision:** Within each stage's accepted-DJs section, slot rows are grouped under a `<h4>`-level day heading (e.g., "Friday"). The headings order matches the project's configured active days. Slots not attributable to a specific day fall in an "Other" group at the end.

**Why:** Mirrors how the Lineup Builder organizes slots by evening, making it easy to cross-reference.

## Risks / Trade-offs

- **Acceptance state lost on manual re-assignment from Lineup Builder**: If a user reassigns a slot via the Lineup Builder (not replacement flow), `acceptanceStatus` resets to `pending` and `declinedBy` is cleared. → Mitigation: Document expected workflow; user should use Results replacement flow for decline-driven substitutions. Optionally surface a warning in the future.
- **No migration needed for existing data**: Optional fields default safely. → No risk.
- **DJSelectionPanel prop surface grows**: One new optional prop keeps the interface backward-compatible. → Low risk.
- **Simultaneous-stage positions**: `positionIndex` slots use the same `DJSlotAssignment` type and therefore get the same acceptance fields automatically; the ResultsList rendering loop must handle `positionIndex` assignments when grouped by day. → Covered in specs.
