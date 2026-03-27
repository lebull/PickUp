## ADDED Requirements

### Requirement: Results list provides a text search field
The Results list SHALL include a persistent text search input that filters visible DJ rows across all stage sections.

#### Scenario: Search input is visible in empty state
- **WHEN** the Results list is displayed with no search query entered
- **THEN** a text input labeled or placeholder-labeled "Search" SHALL be visible at or near the top of the Results list

#### Scenario: Search filters rows by DJ name
- **WHEN** the user types text into the search input
- **THEN** only DJ rows whose DJ name contains the search text (case-insensitive) SHALL be visible

#### Scenario: Search filters rows by furry name
- **WHEN** the user types text that matches a DJ's furry name
- **THEN** rows matching on furry name SHALL remain visible even if the DJ name does not match

#### Scenario: Search filters rows by email
- **WHEN** the user types text that matches a DJ's contact email
- **THEN** rows matching on email SHALL remain visible

#### Scenario: Search filters rows by other identifying fields
- **WHEN** the user types text that matches a DJ's telegram/discord handle or phone number
- **THEN** rows matching on those fields SHALL remain visible

#### Scenario: Search applies across all stage sections simultaneously
- **WHEN** the user enters a search query
- **THEN** matching rows SHALL be shown regardless of which stage section they belong to
- **THEN** stage section headings SHALL remain visible even if all DJ rows in that section are filtered out

#### Scenario: Clearing search restores all rows
- **WHEN** the user clears the search input
- **THEN** all DJ rows SHALL be visible again with no filtering applied

#### Scenario: Search does not filter the rejection section heading
- **WHEN** a search query is active and no rejected DJs match
- **THEN** the "Did Not Make the Cut" section heading SHALL remain visible regardless of whether any rejection rows match
