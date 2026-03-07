## Why

The project workspace header has grown cluttered as more controls were added (Import CSV, Export, Standard/Moonlight toggle, Hidden Names toggle, submission count), making it hard to scan and use quickly. Additionally, both the Submissions view (list + detail) and the Lineup view (grid + DJ panel) share an identical left/right split layout pattern that is duplicated in CSS and markup with no shared abstraction or user-resizable divider.

## What Changes

- The project workspace header actions area is reorganised: secondary actions (Export, AppPreferencesControls) are collapsed into a dropdown "⚙ Settings" menu, reducing the number of always-visible controls in the header.
- The submission count is moved out of the header and into the submission list table controls area (or as a footer/label in the list component itself).
- A new `SplitPane` layout component is introduced that renders a resizable left/right (or top/bottom) split container using a draggable divider.
- Both `SubmissionsView` (list ↔ detail panel) and `LineupView` (grid ↔ DJ selection panel) are refactored to use `SplitPane` instead of their current bespoke flex/split CSS.

## Capabilities

### New Capabilities
- `nav-actions-menu`: Collapsible dropdown menu in the project workspace header that groups secondary actions (Export, preferences controls) under a single trigger button, decluttering the header.
- `split-pane`: Reusable `SplitPane` component that renders two children in a resizable left/right split with a draggable divider. Consumers specify an initial split ratio; the user can drag to resize.

### Modified Capabilities
- `submission-list`: Submission count moves from the header into the submission list controls area.

## Impact

- `App.tsx` (`ProjectWorkspace`): header markup changes; submission count `<span>` removed; new `NavActionsMenu` component added.
- `components/AppPreferencesControls.tsx`: moved inside the dropdown rather than rendered inline in the header.
- `components/SubmissionsView.tsx`: wrap list/detail split in `SplitPane`.
- `components/LineupView.tsx`: wrap grid/panel split in `SplitPane`.
- `components/SubmissionList.tsx`: add total/filtered count display to controls row.
- New file: `components/NavActionsMenu.tsx`
- New file: `components/SplitPane.tsx`
- `App.css`: remove bespoke split layout rules now covered by `SplitPane`.
