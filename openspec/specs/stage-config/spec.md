## ADDED Requirements

### Requirement: Per-stage Use Moonlight Scores configuration
Each stage SHALL have an optional `useMoonlightScores` boolean field. When `useMoonlightScores` is `true` for a stage, the DJ selection panel for that stage SHALL sort by ML Score, show the Vibefit column, and filter the DJ list to submissions with `moonlightInterest === true`. The stage configuration panel SHALL provide a toggle for this field.

#### Scenario: Stage config shows Use Moonlight Scores toggle
- **WHEN** the organizer is editing a stage in the stage configuration panel
- **THEN** a "Use Moonlight Scores" toggle or checkbox SHALL be visible for that stage
- **THEN** the toggle reflects the current value of `useMoonlightScores` for the stage (default: off/false)

#### Scenario: Enabling Use Moonlight Scores persists to the stage
- **WHEN** the organizer enables the "Use Moonlight Scores" toggle on a stage
- **THEN** `useMoonlightScores` SHALL be set to `true` on that stage in the project data
- **THEN** the DJ selection panel for that stage SHALL subsequently apply Moonlight scoring and filtering

#### Scenario: Disabling Use Moonlight Scores reverts to standard behavior
- **WHEN** the organizer disables the "Use Moonlight Scores" toggle on a stage
- **THEN** `useMoonlightScores` SHALL be set to `false` on that stage
- **THEN** the DJ selection panel for that stage SHALL use Main Score sorting and show all available DJs regardless of `moonlightInterest`

#### Scenario: Stages default to standard scoring
- **WHEN** a new stage is created
- **THEN** `useMoonlightScores` SHALL default to `false` (or be absent, treated as false)
- **THEN** the toggle SHALL appear in the off state

#### Scenario: Multiple stages can independently have Moonlight Scores enabled
- **WHEN** one stage has `useMoonlightScores: true` and another has `useMoonlightScores: false`
- **THEN** the DJ selection panel for the Moonlight stage SHALL apply ML sorting and Moonlight filtering
- **THEN** the DJ selection panel for the standard stage SHALL apply Main Score sorting and show all DJs
