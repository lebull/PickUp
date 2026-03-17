## Why

The submissions browsing experience has accumulated several friction points: the day-availability filter no longer serves a purpose on this page, the status badges (submission issues vs. lineup status) are visually indistinguishable and co-located in a way that causes confusion, and arrow-key navigation requires an extra keypress to actually view a DJ — defeating the purpose of quick keyboard browsing.

## What Changes

- Remove the "filter by days available" toggle buttons from the submissions view
- Add a fuzzy search bar to filter submissions by DJ name
- Move lineup stage assignment out of the DJ Name column into its own dedicated "Stage Assignment" column
- Add a "View stage assignments" toggle that controls visibility of both the Stage Assignment column and row color coding
- Arrow key navigation now immediately updates the detail panel without requiring Enter, and the cursor row is always scrolled into the viewport

## Capabilities

### New Capabilities
- `submission-list-search`: Fuzzy DJ name search bar replaces the days-available filter in the submissions browser controls
- `submission-list-stage-toggle`: "View stage assignments" toggle controls visibility of the stage assignment column and row color coding

### Modified Capabilities
- `submission-list`: Remove the "Filter list by days available" requirement; the day filter toggles are no longer present in the submissions browser
- `submission-list-lineup-indicator`: Stage assignment badge moves from the DJ Name column to a dedicated "Stage Assignment" column; badge renders in the new column when the stage assignment toggle is on
- `submission-list-keyboard-nav`: Arrow key navigation immediately navigates to the submission detail view (no Enter required); cursor row is always scrolled into the viewport after each arrow key press

## Impact

- `SubmissionList.tsx`: Remove day toggle controls and `activeDays` prop; add search input and fuzzy filter logic; add Stage Assignment column; add toggle prop for stage visibility; modify keyboard handler to fire `onSelect` on arrow movement
- `SubmissionsView.tsx`: Remove `activeDays` state; add search state; add stage-assignment-visible toggle state; pass new props to `SubmissionList`
- `submission-list` spec: Remove "Filter list by days available" requirement and related scenarios
- `submission-list-lineup-indicator` spec: Update column placement requirement; add toggle behavior
- `submission-list-keyboard-nav` spec: Update arrow key scenario to describe immediate navigation and scroll-into-view behavior
