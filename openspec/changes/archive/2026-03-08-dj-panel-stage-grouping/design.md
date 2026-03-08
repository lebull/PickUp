## Context

`DJSelectionPanel` currently has a multi-select stage preference filter: toggle buttons for each configured stage that hide DJs who don't list any selected stage. This discards ranking information — a DJ who has a stage as their 1st choice vs. 5th choice looks identical. The panel also has a hardcoded `width: 380px` that made sense when it was an overlay but is now inside a `SplitPane` right pane where it should flex to fill the allocated width.

## Goals / Non-Goals

**Goals:**
- Replace the multi-select filter with a single "focus stage" selector (radio-style buttons or a `<select>`) that groups DJs by their preference rank for that stage.
- Remove the fixed width so the panel fills its container naturally.

**Non-Goals:**
- Changing the sort order within groups (score descending stays).
- Supporting multi-stage grouping simultaneously.
- Persisting the focus stage across slot selections.

## Decisions

### Single-select control: radio-style buttons (same visual style as current toggles)
A row of stage buttons where clicking a stage focuses it (clicking again deselects — back to flat list). This mirrors the familiar day-toggle UX and avoids adding a `<select>` element that would break visual consistency.

### Grouping buckets
Five ordered buckets derived from `s.stagePreferences[0..4]`:
- **1st choice** — `stagePreferences[0] === focusStage`
- **2nd choice** — `stagePreferences[1] === focusStage`
- **3rd choice** — `stagePreferences[2] === focusStage`
- **4th / 5th choice** — `stagePreferences[3]` or `[4]` === focusStage
- **No preference** — focusStage does not appear anywhere in stagePreferences

Empty buckets are omitted. Within each bucket, existing score-descending order is preserved.

**Alternative considered**: a dropdown `<select>` — rejected to maintain visual consistency with toggle controls elsewhere in the panel and submission list.

### Panel width
Remove `width: 380px; flex-shrink: 0` from `.dj-selection-panel`. The `SplitPane` right pane already sets `flex: 1; min-width: 0`, so the panel will fill that space naturally.

## Risks / Trade-offs

- [Risk] "No preference" bucket may be very large, burying relevant DJs → Mitigation: it renders last so focused-preference DJs always appear first.
- [Risk] Empty `stagePreferences` entries (blank strings from CSV) could match incorrectly → Mitigation: filter falsy values before comparison (`s.stagePreferences.filter(Boolean)`), already done in the existing code.
