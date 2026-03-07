## Why

The FWA event schedule includes a "silent disco" format where up to 3 DJs perform simultaneously throughout the entire event window, unlike the standard stage format where DJs play sequentially in assigned time slots. The current data model and UI assume all stages use sequential slot-based scheduling, so there is no way to represent or configure a simultaneous-play event.

## What Changes

- Introduce a `stageType` field on `Stage` to distinguish between `"sequential"` (current behavior, slot-based) and `"simultaneous"` (silent disco — all assigned DJs play the full event window at the same time).
- **New Capabilities**: A simultaneous stage has no slot grid rows; instead it holds a flat list of up to 3 DJ assignments for the entire event window.
- The Lineup Grid SHALL render simultaneous stages differently: no row-per-slot structure, just a single multi-DJ assignment cell per day column.
- The Stage Config Panel SHALL allow organizers to choose a stage type when creating or editing a stage.
- The assignment model for simultaneous stages uses a new assignment variant (no `slotIndex`, instead a position index 1–3).
- Maximum of 3 DJs may be assigned to any simultaneous stage per evening. The UI SHALL enforce this cap.
- The DJ pool exclusion rule still applies: a DJ assigned to any slot (sequential or simultaneous) is removed from the unscheduled pool globally.

## Capabilities

### New Capabilities
- `simultaneous-stage`: Introduces the `simultaneous` stage type — configuration, data model, assignment rules (max 3 DJs, no slot index), and persistence shape for stages where all DJs play the whole event window at the same time.
- `lineup-grid-simultaneous`: Rendering behavior for simultaneous stages in the Lineup Grid — a single stacked multi-DJ cell replacing the slot row structure, with add/remove DJ controls capped at 3.
- `stage-config-type-selector`: UI control in the Stage Config Panel to select stage type (`sequential` vs `simultaneous`) when creating or editing a stage, with appropriate field visibility changes (slot duration and per-day time inputs hidden/shown based on type).

### Modified Capabilities
- `stage-config`: The `Stage` data model gains a required `stageType` field (`"sequential" | "simultaneous"`). Existing stages without the field SHALL default to `"sequential"`. Stage deletion behavior is unchanged.
- `lineup-grid`: Grid rendering and slot assignment interactions must account for the new `simultaneous` stage type column layout.
- `lineup-persistence`: The `SlotAssignment` type must accommodate simultaneous assignments (no `slotIndex`; adds a `positionIndex` 1–3). Serialization and restore logic must handle both variants.

## Impact

- `app/src/types.ts` — `Stage` gains `stageType`; `SlotAssignment` gains optional `positionIndex` and `slotIndex` becomes optional for the simultaneous variant (or a discriminated union is introduced).
- `app/src/components/StageConfigPanel.tsx` — add stage type selector UI.
- `app/src/components/LineupGrid.tsx` — branch rendering on `stageType`.
- `app/src/lineupUtils.ts` — slot computation functions must skip/short-circuit for simultaneous stages.
- `app/src/projectStore.ts` — no schema migration needed; `stageType` defaulting handles old data.
- No new npm dependencies required.
