## ADDED Requirements

### Requirement: Occupied event cell displays context-appropriate genre
An occupied event cell SHALL display the genre appropriate for the stage's context. When the stage has `useMoonlightScores: true`, the Moonlight genre (`mlGenre`) SHALL be shown. Otherwise, the main genre (`genre`) SHALL be shown. This applies to both sequential slot cells and simultaneous DJ badges.

#### Scenario: Sequential slot on Moonlight stage shows Moonlight genre
- **WHEN** a DJ is assigned to a sequential slot on a stage with `useMoonlightScores: true`
- **THEN** the slot cell SHALL display the submission's `mlGenre` value beneath the DJ name
- **WHEN** `mlGenre` is empty or absent
- **THEN** no genre label SHALL be shown in the cell

#### Scenario: Sequential slot on standard stage shows main genre
- **WHEN** a DJ is assigned to a sequential slot on a stage with `useMoonlightScores: false` or unset
- **THEN** the slot cell SHALL display the submission's `genre` value beneath the DJ name
- **WHEN** `genre` is empty or absent
- **THEN** no genre label SHALL be shown in the cell

#### Scenario: Simultaneous DJ badge on Moonlight stage shows Moonlight genre
- **WHEN** a DJ is assigned to a simultaneous stage with `useMoonlightScores: true`
- **THEN** the DJ's badge in the simultaneous cell SHALL display the submission's `mlGenre` value
- **WHEN** `mlGenre` is empty or absent
- **THEN** no genre label SHALL be shown in the badge

#### Scenario: Simultaneous DJ badge on standard stage shows main genre
- **WHEN** a DJ is assigned to a simultaneous stage with `useMoonlightScores: false` or unset
- **THEN** the DJ's badge in the simultaneous cell SHALL display the submission's `genre` value
- **WHEN** `genre` is empty or absent
- **THEN** no genre label SHALL be shown in the badge
