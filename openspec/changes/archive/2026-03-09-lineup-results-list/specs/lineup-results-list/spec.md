## ADDED Requirements

### Requirement: Results tab is accessible from project workspace navigation
The application SHALL provide a "Results" tab in the project workspace header navigation when submissions are loaded. The tab SHALL navigate to `/project/:id/results`.

#### Scenario: Results tab is visible when submissions are loaded
- **WHEN** submissions have been loaded for a project
- **THEN** the navigation SHALL display a "Results" tab alongside "Submissions" and "Lineup Builder"

#### Scenario: Results tab is absent when no submissions are loaded
- **WHEN** no submissions are loaded for a project
- **THEN** the "Results" tab SHALL NOT be displayed in the navigation

### Requirement: Accepted DJs are listed grouped by stage
The Results view SHALL display a section for each stage that has at least one assigned DJ. Each section SHALL use the stage name as a heading. Within each stage section, assigned DJs SHALL be listed with: DJ name, contact email, Telegram/Discord, genre, and format/gear.

#### Scenario: Each stage with assignments has its own section
- **WHEN** the lineup has assignments across one or more stages
- **THEN** the Results view SHALL render one section per stage that has at least one assigned DJ
- **THEN** stages SHALL be ordered according to the stage order in `project.stages`

#### Scenario: Each accepted DJ entry shows contact info and secondary fields
- **WHEN** an assigned DJ entry is displayed
- **THEN** the DJ name SHALL be the primary label
- **THEN** contact email and Telegram/Discord SHALL be prominently visible
- **THEN** genre and format/gear SHALL be displayed as secondary info

#### Scenario: Empty state when no assignments exist
- **WHEN** no DJs have been assigned to any slot in the project
- **THEN** the Results view SHALL display an informational message indicating no lineup has been built yet

### Requirement: Non-accepted DJs are listed in a "Did Not Make the Cut" section
The Results view SHALL include a section listing all DJs who do not appear in the accepted section, including discarded DJs. A DJ SHALL be excluded from this section only if another submission sharing their `djName` was assigned to a stage.

#### Scenario: Unassigned non-discarded DJ appears in rejection section
- **WHEN** a submission is not discarded and not assigned to any slot
- **WHEN** no other submission with the same `djName` is assigned to a slot
- **THEN** that DJ SHALL appear in the "Did Not Make the Cut" section

#### Scenario: Discarded DJ appears in rejection section
- **WHEN** a submission is discarded
- **WHEN** no other submission with the same `djName` is assigned to a slot
- **THEN** that DJ SHALL appear in the "Did Not Make the Cut" section

#### Scenario: DJ is excluded from rejection section when their duplicate was accepted
- **WHEN** a submission shares a `djName` with another submission that is assigned to a slot
- **THEN** that submission SHALL NOT appear in the "Did Not Make the Cut" section

### Requirement: Duplicate-name submissions are de-duplicated in the rejection section
When multiple submissions share the same `djName` and none are assigned, exactly one rejection entry SHALL be shown for that DJ.

#### Scenario: One rejection entry shown for a DJ with multiple unassigned submissions
- **WHEN** two or more submissions share the same `djName`
- **WHEN** none of those submissions are assigned to a slot
- **THEN** exactly one entry SHALL appear for that DJ in the "Did Not Make the Cut" section
- **THEN** the representative entry SHALL prefer a non-discarded submission over a discarded one

### Requirement: Manual-review alert lists duplicate-submission contact details
When at least one `djName` appears on multiple submissions in the project, the Results view SHALL display an informational alert. The alert SHALL list the contact email and Telegram/Discord (if present) for each affected DJ group, so coordinators know which addresses require manual handling.

#### Scenario: Alert is shown when duplicate-name submissions exist
- **WHEN** any `djName` matches two or more submissions in the project (regardless of discard or assignment status)
- **THEN** an informational alert SHALL be visible in the Results view
- **THEN** the alert SHALL list the contact email and Telegram/Discord for each such DJ group

#### Scenario: Alert is not shown when no duplicate names exist
- **WHEN** every `djName` in the project appears on exactly one submission
- **THEN** no duplicate-submission alert SHALL be displayed

### Requirement: Clicking a DJ entry opens submission detail in a side panel
The Results view SHALL allow clicking any DJ entry (in either the accepted or rejection section) to open the submission detail in a side panel using the existing `SubmissionDetail` component.

#### Scenario: Clicking a DJ entry opens their submission detail
- **WHEN** the user clicks on a DJ entry in the Results view
- **THEN** the `SubmissionDetail` panel SHALL open for that submission's data
- **THEN** the detail panel SHALL display the same content as in the Submissions view

#### Scenario: Clicking the same entry again or a close action dismisses the panel
- **WHEN** the user closes or dismisses the detail panel
- **THEN** the Results view SHALL return to showing the full-width results list
