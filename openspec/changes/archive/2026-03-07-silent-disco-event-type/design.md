## Context

The PickUp lineup builder currently models all stages as sequential: a stage has a slot duration and per-day schedule, and DJs are assigned to individual time slots (`slotIndex`). The application renders a grid where rows are time slots and columns are stages.

The FWA 2026 event schedule includes a "silent disco" track where up to 3 DJs play simultaneously through the entire event window — no slot rotation, no sequential hand-off. The existing data model and rendering pipeline have no concept of this format.

Key affected files: `types.ts` (data model), `lineupUtils.ts` (slot computation), `components/LineupGrid.tsx` (rendering), `components/StageConfigPanel.tsx` (configuration UI), `components/SlotPicker.tsx` (assignment picker).

## Goals / Non-Goals

**Goals:**
- Introduce a `stageType` discriminant (`"sequential" | "simultaneous"`) on the `Stage` type.
- Allow up to 3 DJs to be assigned to a simultaneous stage per evening, each with a `positionIndex` (1–3) rather than a `slotIndex`.
- Render simultaneous stages in the Lineup Grid as a single stacked cell (no slot rows).
- Add a stage-type selector to the Stage Config Panel (hiding slot-duration / per-day time fields for simultaneous stages since they are irrelevant for grid layout but still stored for display purposes).
- Keep the global DJ exclusion rule: any DJ assigned anywhere (sequential or simultaneous) is removed from the unscheduled pool.
- Preserve backward compatibility: existing persisted data without `stageType` defaults to `"sequential"`.

**Non-Goals:**
- Supporting more than 3 simultaneous DJs per stage.
- Mixed (partial-simultaneous) stages where some hours are sequential and others simultaneous.
- Exporting or printing the simultaneous layout differently from sequential.
- Per-position time windows within a simultaneous stage.

## Decisions

### Decision: Discriminated union vs. optional `stageType` field

**Choice**: Add `stageType: "sequential" | "simultaneous"` directly to the `Stage` interface (not a discriminated union split into two separate interfaces).

**Rationale**: The stage object is stored in an array and passed around freely. A full discriminated union would require type narrowing at every call site, significantly widening the changeset. A single optional field defaulting to `"sequential"` keeps the migration trivial: existing IndexedDB records just lack the field and are treated as sequential. TypeScript narrowing on `stage.stageType === 'simultaneous'` is still clean.

**Alternatives considered**: True discriminated union (`SequentialStage | SimultaneousStage`) — provides stronger typing but doubles the number of type guard checks needed across components and utilities.

---

### Decision: `positionIndex` vs. re-using `slotIndex` for simultaneous assignments

**Choice**: Keep `slotIndex` as-is for sequential assignments. Simultaneous assignments use `positionIndex: 1 | 2 | 3` and omit `slotIndex` (or set it to `-1` as a sentinel).

**Rationale**: Re-using `slotIndex` with a sentinel like `-1` would be implicit and confusing. A separate `positionIndex` field makes the intent explicit. Both fields are optional in the persisted `SlotAssignment` shape; TypeScript consumers narrow on `stage.stageType` to know which field applies.

**Alternatives considered**: Completely separate `SimultaneousAssignment` type in a union — cleaner type safety but requires changes to every function that iterates `assignments[]`.

---

### Decision: Simultaneous stage grid rendering

**Choice**: In `LineupGrid`, when rendering a column for a simultaneous stage, skip the normal slot-row iteration and instead render a single tall cell spanning the full height of the time axis. Inside that cell, render up to 3 DJ name badges (one per position) plus an "Add DJ" button when fewer than 3 are assigned.

**Rationale**: The time axis is still driven by sequential stages. Simultaneous stage columns sit in the same grid but show no row boundaries — they display as a single block. This avoids introducing a second grid or a completely separate layout component.

**Alternatives considered**: A separate "simultaneous lane" rendered below or beside the grid — cleaner visual separation but higher implementation complexity and UX inconsistency.

---

### Decision: Hide vs. disable slot-duration fields for simultaneous stages

**Choice**: In `StageConfigPanel`, hide (not disable) the slot-duration and per-day time-range fields when `stageType === "simultaneous"`.

**Rationale**: Simultaneous stages have no slot rows, so these fields are meaningless. Keeping them visible but disabled would confuse organizers. The per-day schedule values are not stored when type is simultaneous (or are ignored).

## Risks / Trade-offs

- **Risk**: Existing `lineupUtils.getSlotLabels` and `getEveningTimeAxis` functions are called with all stages including future simultaneous ones. If not guarded, they may return unexpected results. → **Mitigation**: Add early-return guard: if `stage.stageType === 'simultaneous'`, `getSlotLabels` returns `[]`. `getEveningTimeAxis` already aggregates, so a simultaneous stage contributing no labels is harmless.

- **Risk**: The DJ-pool exclusion query currently checks `assignments.some(a => a.djName === dj)` across all assignments. Simultaneous assignments use the same `djName` field, so the check works without modification — but developers may not realize this and add redundant logic. → **Mitigation**: Document in code comments that the pool exclusion is assignment-type-agnostic.

- **Risk**: The maximum-of-3 cap is enforced only in the UI. A data import or direct store manipulation could create 4+ assignments for a simultaneous stage. → **Mitigation**: Add a validation guard in the assignment reducer/store action as well as in the UI.

## Migration Plan

1. Deploy new code — `stageType` defaults to `"sequential"` via nullish coalescing when reading from IndexedDB, so all existing project data continues to work unchanged.
2. No IndexedDB schema version bump required (additive field).
3. No data migration script needed.
4. Rollback: revert the code change; old data round-trips safely because the `stageType` field is simply ignored by the previous version.

## Open Questions

- Should simultaneous stages display a "full event" time label in the grid cell, or just list the DJ names with no time annotation? (Proposal leans toward just DJ names + position badges — decided to keep it simple and revisit in UX polish.)
- Should a simultaneous stage still require per-day start/end times for display purposes (e.g., showing "20:00–02:00" as a subtitle)? Currently leaning no — the cell shows DJ names only.
