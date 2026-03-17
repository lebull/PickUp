## ADDED Requirements

### Requirement: Occupied sequential slot cells display the DJ's genre
Every sequential slot cell with a real DJ assignment SHALL display the assigned DJ's genre as a secondary line below the DJ's name. The genre text SHALL be visually subordinate to the name (smaller font, muted color). If the DJ's genre is empty or unknown, only the name is shown (no blank secondary line).

#### Scenario: Occupied cell renders name and genre
- **WHEN** a sequential slot has a real DJ assigned and that DJ's genre is non-empty
- **THEN** the cell displays the DJ's name on the primary line
- **THEN** the cell displays the DJ's genre on a secondary line in a smaller, muted style

#### Scenario: Occupied cell with blank genre shows name only
- **WHEN** a sequential slot has a real DJ assigned and the DJ's genre field is empty
- **THEN** the cell displays only the DJ's name with no secondary line

#### Scenario: Blank marker cells do not show genre
- **WHEN** a sequential slot holds a blank marker assignment
- **THEN** no genre line is rendered (blank markers show only their label, unchanged)

#### Scenario: Stage view shows genre in occupied cells
- **WHEN** stage view is active and a sequential slot has a real DJ assigned
- **THEN** the cell displays both the DJ's name and genre, consistent with day-view behavior

### Requirement: Simultaneous DJ badges display the DJ's genre
Each DJ badge inside a simultaneous stage cell SHALL display the assigned DJ's genre as a secondary line below the DJ's name. The genre text SHALL use the same subordinate visual style as sequential cells. If the DJ's genre is empty, only the name is shown.

#### Scenario: Simultaneous badge shows name and genre
- **WHEN** a DJ is assigned to a simultaneous position and that DJ's genre is non-empty
- **THEN** the badge displays the DJ's name on the primary line
- **THEN** the badge displays the genre on a secondary line in a smaller, muted style

#### Scenario: Simultaneous badge with blank genre shows name only
- **WHEN** a DJ is assigned to a simultaneous position and the DJ's genre field is empty
- **THEN** only the DJ's name is shown in the badge
