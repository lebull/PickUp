## Why

Organizers currently have no way to visually distinguish stages at a glance in the lineup grid or submission list — all stages appear with the same default styling. Additionally, stages can only be added or deleted; there is no way to reorder them, forcing organizers to delete and recreate stages to achieve a desired column order in the lineup grid.

## What Changes

- Each stage gains an optional `color` property chosen from a curated palette of distinct colors
- The stage configuration panel shows a color swatch picker for each stage
- The lineup grid renders each stage column header (and occupied cells) tinted with the stage's assigned color
- The submission list displays a colored stage badge/indicator next to each submission that has been assigned to a stage
- The stage configuration panel supports drag-to-reorder so organizers can control the column order in the lineup grid

## Capabilities

### New Capabilities
- `stage-color`: Each stage has an optional display color chosen from a fixed palette. The color is reflected in the stage config panel, lineup grid column headers/cells, and submission list lineup indicators.
- `stage-reorder`: Stages in the configuration panel can be reordered via click-and-drag (HTML5 drag-and-drop). The stage order is persisted and determines column order in the lineup grid.

### Modified Capabilities
- `stage-config`: Stage editing UI gains a color picker swatch row and drag handles for reordering.
- `lineup-grid`: Stage column headers and occupied slot cells are tinted with the stage's color.
- `submission-list-lineup-indicator`: The lineup indicator shown for assigned submissions is tinted with the corresponding stage's color.

## Impact

- `app/src/types.ts` — `Stage` interface gains optional `color?: string` field
- `app/src/components/StageConfigPanel.tsx` — color palette picker UI + drag-and-drop reorder
- `app/src/components/LineupGrid.tsx` — apply stage color to column headers and cell backgrounds
- `app/src/components/SubmissionList.tsx` — apply stage color to lineup indicator badge
- `app/src/projectStore.ts` — `newStage()` default omits color (undefined = no color)
- Persistence: `color` field round-trips through JSON project export/import automatically
- No breaking changes to existing project files (color is optional; omitted color means unstyled)
