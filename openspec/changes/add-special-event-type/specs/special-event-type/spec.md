## ADDED Requirements

### Requirement: Special stage type is not day-bound
The system SHALL support a `special` stage type that does not require `activeDays`, day schedules, start/end times, or any day selection to be assignable.

#### Scenario: Organizer creates a special stage without selecting a day
- **WHEN** the organizer configures a stage with type `special`
- **THEN** the system SHALL accept the stage with no active day selection
- **THEN** the stage SHALL be available in the Special Events planning surface

### Requirement: Special stage assignment capacity is open-ended
For `special` stages, the system SHALL allow adding zero or more DJ assignments without enforcing a fixed slot limit. The UI SHALL allow adding additional DJs until the organizer stops selecting.

#### Scenario: Organizer adds more picks than normal stage slot count
- **WHEN** a special stage already has multiple assigned DJs
- **THEN** the system SHALL permit assigning another DJ to that same special stage
- **THEN** no "slot full" validation SHALL be applied

### Requirement: Special-stage assignment entries remain individually removable
Each DJ assigned to a special stage SHALL remain an individually removable entry, and removing one entry SHALL NOT remove other assignments for that stage.

#### Scenario: Removing one special-event assignment leaves others intact
- **WHEN** a special stage has three assigned DJs and the organizer removes one
- **THEN** the removed DJ SHALL no longer appear in that stage's assignment list
- **THEN** the remaining two assigned DJs SHALL remain assigned
