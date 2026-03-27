## MODIFIED Requirements

### Requirement: Define a simultaneous stage type
The `Stage` data model SHALL support a `stageType` field with values `"sequential"`, `"simultaneous"`, and `"special"`. A `special` stage represents invitation-style selections that are not tied to a convention day or schedule window. A special stage SHALL NOT require day schedule configuration and SHALL NOT enforce a maximum DJ cap by slot count.

#### Scenario: Stage type persisted correctly
- **WHEN** an organizer sets a stage's type to `"special"` and saves
- **THEN** the persisted `Stage` record contains `stageType: "special"`
- **THEN** reloading the project restores the special type without alteration

#### Scenario: Legacy data backward compatibility
- **WHEN** a project is loaded and a stage record has no `stageType` field
- **THEN** the application SHALL treat that stage as `stageType: "sequential"`
- **THEN** no data migration or user action SHALL be required

#### Scenario: Special stage has no fixed day requirement
- **WHEN** a stage is configured as `"special"`
- **THEN** the system SHALL permit the stage with no active day selection
- **THEN** special-stage assignments SHALL remain editable in Special Events view
