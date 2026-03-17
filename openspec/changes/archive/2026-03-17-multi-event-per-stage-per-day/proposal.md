## Why

The lineup builder currently only supports one event per stage per day — the stage's schedule maps each day to a single start/end time block. This year we're running two silent discos on the same day, which cannot be represented in the current model. We need to support multiple distinct timed events on the same stage within a single day.

## What Changes

- A stage's per-day schedule can now hold **one or more named events** (each with its own start/end time and label), replacing the current single-schedule-per-day model.
- Slot assignments gain an `eventIndex` field to disambiguate which event on that stage/day a slot belongs to.
- The stage config UI gains controls to add, label, and remove multiple events on a single day.
- The lineup grid renders multiple events for the same stage on the same day as distinct adjacent columns (one per event), each with its own time axis contribution.
- Backward compatibility: existing projects with a single schedule per day are normalized on load — the single schedule becomes event index `0` with no label.

## Capabilities

### New Capabilities

- `stage-day-event`: A named, timed event block on a (stage, day) pair. A stage/day can have one or more of these, each with a label (e.g., "Afternoon Set", "Evening Set"), a start time, and an end time. This replaces the flat `StageSchedule` value in `stage.schedule[day]`.

### Modified Capabilities

- `stage-config`: The per-day schedule section must support adding/labeling/removing multiple events per day instead of a single start/end pair.
- `lineup-grid`: When a stage has multiple events on the active evening, render one column per event rather than one column per stage. Column headers show the event label (or a generated label like "Set 1", "Set 2" when unlabeled).

## Impact

- **`types.ts`**: `StageSchedule` (or its successor) must support an array of event entries. `SlotAssignment` gains an optional `eventIndex: number` field.
- **`lineupUtils.ts`**: `getSlotLabels()` and `getEveningTimeAxis()` must account for multiple events per stage, computing slots and the unified time axis correctly.
- **`projectStore.ts`**: Load-time normalization to convert legacy single-schedule-per-day data to the new multi-event structure.
- **`components/StageConfigPanel.tsx`**: UI additions for managing multiple events per day.
- **`components/LineupGrid.tsx`**: Column generation logic updated to expand stages with multiple events into multiple columns.
- No external dependencies or API changes.
