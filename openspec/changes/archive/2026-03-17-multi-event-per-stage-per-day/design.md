## Context

The app currently models each stage's schedule as `stage.schedule: Record<string, StageSchedule>`, where the record key is a day name ("Friday") and the value is a single `{ startTime, endTime }` pair. Sequential-stage `SlotAssignment` records are keyed by `(stageId, evening, slotIndex)`. The lineup grid renders exactly one column per stage per evening.

This year's event requires two separate silent-disco blocks on the same stage on the same day (e.g., an afternoon set and an evening set). These are independent events: each has its own start/end time window, its own DJ slots, and its own label. The current 1-event-per-stage-per-day constraint must be lifted.

## Goals / Non-Goals

**Goals:**
- Support 1..N named timed events for a sequential stage on any given active day
- Each event gets its own column in the lineup grid with a label
- Stage-config UI supports adding, labeling, and removing events per day
- A one-time migration script converts existing projects to the new data format before deploying the updated app

**Non-Goals:**
- Changing how simultaneous stage positions work (each event still holds up to 3 DJs)
- Changing the number of convention days
- UI drag-and-drop reordering of events within a day (can be added later)

## Decisions

### Decision 1: Extend `StageSchedule` to an array and add an optional `label`

**Choice**: Change `stage.schedule: Record<string, StageSchedule>` to `stage.schedule: Record<string, StageSchedule[]>`. Add an optional `label?: string` field to `StageSchedule`.

**Rationale**: An array-per-day is the minimal structural change. It is self-contained within the existing stage record and does not require a new top-level entity. The optional `label` allows organizers to describe each event (e.g., "Afternoon Set") without enforcing a naming scheme.

**Alternative considered**: A new `events: StageEvent[]` top-level field alongside the existing `schedule`. Rejected because it splits schedule data across two fields, complicates the stage-config UI, and requires all consumers to handle both fields.

### Decision 2: Add `eventIndex` to `SlotAssignment`

**Choice**: Add `eventIndex?: number` to `SlotAssignment`, defaulting to `0` for assignments that predate this change or for stages that have only one event. This field identifies which event within `stage.schedule[evening]` a slot belongs to.

**Rationale**: The existing `(stageId, evening, slotIndex)` tuple already uniquely identifies a slot when there is one event. Adding `eventIndex` extends the tuple to `(stageId, evening, eventIndex, slotIndex)` with no collisions. Default `0` means legacy assignments continue to resolve correctly after the migration that converts single schedules to single-element arrays.

**Alternative considered**: Encoding the event as a composite key string (e.g., `"Friday:0"`). Rejected because it is error-prone to parse and harder to query.

### Decision 3: Render multiple events as separate adjacent columns in the grid

**Choice**: A stage with N events on the active evening renders N columns in the lineup grid. Each column header shows the event label (or auto-label "Set 1", "Set 2", …) with the stage name as a super-header spanning all N columns.

**Rationale**: Separate columns preserve the existing visual language (each column = one schedulable block of time) and allow drag-and-drop to continue working per cell. Sub-rows within a shared column (alternative) would require extensive layout changes and make the time axis ambiguous when events have different durations.

**Alternative considered**: A collapsed/expandable "sub-event" row per stage. Rejected for the same layout-complexity reasons above.

### Decision 4: One-time migration script instead of load-time normalization

**Choice**: A small standalone Node/TypeScript script reads the existing IndexedDB export (or project JSON), converts each `stage.schedule[day]` plain-object value to a single-element array, and sets `eventIndex: 0` on all existing `SlotAssignment` records. The script writes the converted data back. The app itself only ever sees the new array format.

**Rationale**: Keeping migration logic out of the runtime code eliminates defensive branching in `projectStore`, type-guard noise in `lineupUtils`, and the risk of a silent conversion silently corrupting data on every load. Running the script once before deploying the updated app is a cleaner contract. After migration the app can treat `StageSchedule[]` and `eventIndex` as always-present without fallback paths.

## Risks / Trade-offs

- **Column count growth**: A stage running two events doubles its column count in the grid for that day. With many multi-event stages the grid can become wide. Mitigation: this is an edge case (rare per the use case) and the grid already handles variable column counts.
- **Time axis interleaving**: If two events on the same stage have overlapping time windows, the unified time axis will include rows from both; the second event column will appear to have gaps. Mitigation: the spec will REQUIRE that events on the same stage/day SHALL NOT have overlapping time ranges. The stage-config UI SHALL warn if overlapping times are detected.
- **Unique key correctness for assignments**: Any code that queries assignments by `(stageId, evening, slotIndex)` without `eventIndex` could misidentify slots. Mitigation: all lookup helpers must be updated to include `eventIndex` in their signature.

## Migration Plan

1. Before deploying the updated app, run the migration script (`scripts/migrate-multi-event.ts`) against any existing project data.
2. The script converts `stage.schedule[day]: StageSchedule` → `stage.schedule[day]: [StageSchedule]` and adds `eventIndex: 0` to all existing `SlotAssignment` records.
3. New projects created after this change always use the array form.
4. No rollback needed: this is a non-production organizer tool. If the old code is restored, it will ignore the `eventIndex` field and show index-0 event columns only — a safe degradation.

## Open Questions

- None — scope is well-understood from the existing use case.
