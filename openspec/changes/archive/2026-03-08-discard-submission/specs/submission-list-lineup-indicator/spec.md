## MODIFIED Requirements

### Requirement: Visual indicator for DJs present in the lineup
The submission list SHALL display a visual indicator on each row reflecting the row's current state. State is determined by priority order: `discarded` > `in-lineup` > `duplicate-name` > `none`. Matching for `in-lineup` SHALL be performed by `submissionNumber`. Matching for `discarded` SHALL check `project.discardedSubmissions`. Matching for `duplicate-name` SHALL check whether any other non-discarded submission shares the same `djName`.

#### Scenario: Discarded row shows discarded badge
- **WHEN** a submission's `submissionNumber` is in `project.discardedSubmissions`
- **THEN** the row SHALL display a `discarded` badge (e.g. "✕ Discarded") and SHALL apply distinct discarded styling (e.g. muted/strikethrough appearance)
- **THEN** no other state badge (in-lineup, duplicate-name) SHALL be shown on that row

#### Scenario: In-lineup row has a badge
- **WHEN** a submission's `submissionNumber` matches an assignment in the current project's lineup AND the submission is not discarded
- **THEN** the corresponding submission row SHALL display a small badge or icon (e.g. "✓ In Lineup") within the row

#### Scenario: In-lineup row has distinct row styling
- **WHEN** a DJ is present in the lineup and not discarded
- **THEN** the submission row SHALL be styled distinctly (e.g. a tinted background or border accent) to visually separate it from unassigned rows

#### Scenario: Duplicate-name warning badge shown
- **WHEN** a submission is not discarded AND shares its `djName` with one or more other non-discarded submissions AND is not in the lineup
- **THEN** the row SHALL display a duplicate-name warning badge (e.g. "⚠ Duplicate Name")

#### Scenario: No indicator for DJs not in lineup, not discarded, not duplicate
- **WHEN** a DJ is not assigned to any lineup slot, not discarded, and has no duplicate name
- **THEN** no badge or special styling SHALL appear on that row

#### Scenario: Indicator updates when lineup changes
- **WHEN** the project lineup changes (a DJ is added or removed from a slot)
- **THEN** the submission list SHALL reflect the updated lineup indicator state without requiring a page reload

#### Scenario: Indicator updates when discard state changes
- **WHEN** a submission is discarded or un-discarded
- **THEN** all affected rows SHALL update their indicator state immediately
