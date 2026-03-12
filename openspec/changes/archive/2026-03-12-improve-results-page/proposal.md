## Why

The Results page is the final coordination step before contacting DJs — coordinators use it to gather emails and confirm slot counts. Currently, columns are misaligned for blank rows (a layout regression), emails cannot be copied, and there is no at-a-glance count of confirmed DJs per stage or overall.

## What Changes

- **Fix column misalignment**: Blank-slot rows use `display: flex` while DJ rows use `display: grid`, causing visual column drift. Both row types must use a consistent layout so name, contact, and meta columns stay aligned across all rows.
- **Email copyability**: Contact email spans must be individually selectable or provide a copy-to-clipboard action so coordinators can grab a single address quickly.
- **Copy-all-emails per stage**: Each stage heading section gains a "Copy emails" button that writes all accepted DJ emails for that stage to the clipboard as a comma-separated list.
- **DJ count summary**: Each stage section displays an assigned-DJ count (excluding blank/blocked slots). A project-level total count is shown at the top of the accepted results area. A note clarifies that blocked slots are not included in the count.

## Capabilities

### New Capabilities
<!-- None — all changes are to the existing results list capability -->

### Modified Capabilities
- `lineup-results-list`: Row layout consistency (blank vs. DJ rows), email clipboard copy (per-entry and per-stage), and assigned-DJ count display with blocked-slot exclusion note.

## Impact

- `app/src/components/ResultsList.tsx` — layout fix, copy buttons, count calculation
- `app/src/App.css` — row layout normalization, copy-button styles, count badge styles
- `openspec/specs/lineup-results-list/spec.md` — new requirements for counts and email copy
