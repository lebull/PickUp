## ADDED Requirements

### Requirement: DJ selection panel excludes already-assigned DJs
The application SHALL exclude DJs from the selection panel list when they are already assigned to any slot. Exclusion SHALL be based on `submissionNumber`, not `djName`, so that two DJs with the same name are excluded independently.

#### Scenario: Assigned DJ is excluded from the available list
- **WHEN** the DJ selection panel is open
- **THEN** any DJ whose `submissionNumber` appears in any `SlotAssignment.submissionNumber` SHALL be excluded from the displayed list

#### Scenario: Two DJs with the same name are excluded independently
- **WHEN** two submissions share the same `djName` but have different `submissionNumber` values
- **AND** one has been assigned to a slot
- **THEN** only the assigned DJ (matched by `submissionNumber`) SHALL be excluded
- **THEN** the other DJ with the same name SHALL remain visible in the list

### Requirement: DJ card key and drag data use submissionNumber
Each DJ card in the selection panel SHALL use `submissionNumber` as its React `key` prop and as the drag-transfer payload, replacing the previous `djName`-based approach.

#### Scenario: Drag-and-drop assigns by submissionNumber
- **WHEN** a DJ card is dragged from the selection panel and dropped onto a slot
- **THEN** the drop handler SHALL read `submissionNumber` from the drag data
- **THEN** the resulting `SlotAssignment` SHALL reference that `submissionNumber`
