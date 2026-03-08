## Why

The DJ selection panel's current stage preference filter (multi-select toggle buttons that hide non-matching DJs) discards context rather than surfacing it. Selectors want to see how strongly each DJ prefers a particular stage — not just whether they prefer it at all — so they can make informed ranking decisions. Additionally, the panel has a hardcoded `width: 380px` that ignores the resizable `SplitPane` container it now lives in.

## What Changes

- The stage preference filter (multi-select toggles) is replaced by a single "focus stage" selector. When a stage is focused, DJs are grouped by their preference ranking for that stage (1st choice, 2nd choice, 3rd choice, 4th/5th choice, No preference). Within each group the existing sort order (active-context score descending) is preserved. When no stage is focused, the flat sorted list is shown as before.
- The panel width constraint (`width: 380px; flex-shrink: 0`) is removed so the panel fills the width allocated to it by `SplitPane`.

## Capabilities

### New Capabilities
- `dj-panel-stage-focus`: A single-select "focus stage" control in the DJ selection panel that groups the DJ list by each DJ's preference ranking for the selected stage, while preserving score-based ordering within groups.

### Modified Capabilities
- `dj-selection-panel`: The stage preference filter requirement is replaced by the stage focus grouping requirement; the panel's fixed-width constraint is removed.
- `dj-selection-filters`: The stage preference multi-select filter requirement is replaced by the stage focus grouping approach.

## Impact

- `app/src/components/DJSelectionPanel.tsx`: replace `selectedStages: Set<string>` state + multi-toggle filter with `focusStage: string | null` state + single-select control; add grouping logic; update render.
- `app/src/App.css`: remove `width: 380px; flex-shrink: 0` from `.dj-selection-panel`.
