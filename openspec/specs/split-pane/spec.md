## Requirements

### Requirement: SplitPane renders two children in a resizable horizontal split
The `SplitPane` component SHALL render exactly two children side-by-side in a flex row with a draggable divider between them. The user SHALL be able to drag the divider to resize the relative widths of the two panes. The split ratio SHALL default to a configurable initial value and SHALL be clamped to configurable minimum widths for each pane.

#### Scenario: Two panes render at the initial split ratio
- **WHEN** `SplitPane` is mounted with an `initialSplit` percentage
- **THEN** the left pane SHALL occupy approximately that percentage of the container width
- **THEN** the right pane SHALL occupy the remaining width

#### Scenario: User drags the divider to resize panes
- **WHEN** the user presses and holds the pointer on the divider handle and moves horizontally
- **THEN** the left pane width SHALL update continuously as the pointer moves
- **THEN** the right pane SHALL occupy the remaining width

#### Scenario: Dragging is clamped by minimum widths
- **WHEN** the user drags the divider such that the left pane would be narrower than `minLeft` percent
- **THEN** the left pane width SHALL be clamped to `minLeft` percent
- **WHEN** the user drags such that the right pane would be narrower than `minRight` percent
- **THEN** the left pane width SHALL be clamped to `100 - minRight` percent

#### Scenario: Divider is visually distinct and indicates resize affordance
- **WHEN** `SplitPane` is rendered
- **THEN** the divider element SHALL be visually distinguishable from the pane content
- **THEN** the cursor over the divider SHALL indicate a horizontal resize (`col-resize`)

#### Scenario: SplitPane fills its parent container
- **WHEN** `SplitPane` is rendered inside a flex or positioned parent
- **THEN** it SHALL expand to fill the available width and height of its container

### Requirement: SubmissionsView and LineupView use SplitPane for their split layout
Both `SubmissionsView` (list to detail panel) and `LineupView` (grid to DJ selection panel) SHALL use the `SplitPane` component for their two-pane layout instead of bespoke CSS split classes.

#### Scenario: SubmissionsView renders list and detail inside SplitPane
- **WHEN** a submission is selected in `SubmissionsView`
- **THEN** the submission list SHALL be in the left pane of a `SplitPane`
- **THEN** the detail panel SHALL be in the right pane of the same `SplitPane`
- **THEN** the user SHALL be able to resize the split between them

#### Scenario: LineupView renders grid and DJ panel inside SplitPane
- **WHEN** a lineup slot is active in `LineupView` and the DJ selection panel is open
- **THEN** the lineup grid SHALL be in the left pane of a `SplitPane`
- **THEN** the `DJSelectionPanel` SHALL be in the right pane
- **THEN** the user SHALL be able to resize the split between them
