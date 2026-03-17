## ADDED Requirements

### Requirement: Moonlight context hides non-moonlight submissions in DJ picker
When the active app context is "moonlight", the DJ selection panel SHALL only display submissions where `moonlightInterest === true`. Submissions where `moonlightInterest === false` SHALL be hidden from the picker regardless of their score, availability, or assignment status.

#### Scenario: Non-moonlight submissions hidden in moonlight context
- **WHEN** the active app context is "moonlight"
- **THEN** the DJ selection panel SHALL only list submissions with `moonlightInterest === true`
- **THEN** submissions with `moonlightInterest === false` SHALL NOT appear in the list

#### Scenario: All eligible submissions shown in standard context
- **WHEN** the active app context is "standard"
- **THEN** the DJ selection panel SHALL list all submissions that pass availability and assignment filters
- **THEN** `moonlightInterest` value SHALL NOT affect visibility

#### Scenario: Empty state when no moonlight submissions available
- **WHEN** the active app context is "moonlight"
- **AND** all moonlight-opted-in submissions are either assigned, discarded, or unavailable on that evening
- **THEN** the panel SHALL display the "No available DJs for this slot" empty state
