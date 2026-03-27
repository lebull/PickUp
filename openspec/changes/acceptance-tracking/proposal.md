## Why

After a lineup is finalized, organizers must contact each assigned DJ and record their acceptance or decline. Currently there is no way to track which DJs have responded or replace a DJ who says no — this information lives outside the app in spreadsheets or emails, creating friction and risking oversights when a substitute needs to be found.

## What Changes

- Each DJ slot assignment gains an acceptance status field (`pending` / `yes` / `no`).
- The Results tab lets users mark each assigned DJ's acceptance inline (`Yes` / `No` buttons per slot row).
- When a DJ declines (`no`), their slot row expands an inline DJ picker (same panel as the lineup builder) so the user can select a replacement immediately.
- DJs who previously declined a given slot are tracked and excluded from the replacement picker for that slot; this exclusion accumulates across multiple rounds of replacement.
- The Results list gains a generic text search field to quickly locate DJs by name, furry name, email, or other identifying fields.
- Each stage's slot list in the Results tab is grouped by day of the week, with a day-of-week heading per group.

## Capabilities

### New Capabilities
- `acceptance-status`: Per-slot acceptance tracking (`pending` / `yes` / `no`) on `DJSlotAssignment`; persisted in project data and displayed in the Results tab with action buttons.
- `results-replacement-picker`: Inline DJ selection flow within the Results tab for slots where a DJ has declined; excludes any DJs who previously rejected that same slot across any number of replacement rounds.
- `results-list-search`: Generic text search in the Results list that filters DJ rows by DJ name, furry name, email, or other identifying fields.
- `results-list-day-grouping`: Groups each stage's slot rows in the Results list by day of the week, with a labeled heading per day group.

### Modified Capabilities
- `lineup-results-list`: The Results list layout is extended to display acceptance status per slot row, host the replacement picker for declined slots, support the search filter, and render per-day group headings within each stage section.

## Impact

- **`types.ts`**: `DJSlotAssignment` gains `acceptanceStatus: 'pending' | 'yes' | 'no'` and `declinedBy: string[]` (accumulates submissionNumbers of DJs who declined).
- **`projectStore.ts`**: New actions to set acceptance status and record a declined DJ when a replacement is made.
- **`ResultsList.tsx`**: Major additions — acceptance status controls per row, conditional inline picker mount, search input, day-of-week group headers.
- **`DJSelectionPanel`**: Consumed from ResultsList (re-use, not modification) with an additional exclusion list prop.
- Data persistence: no new storage mechanism; changes live in `project.assignments`.
