## REMOVED Requirements

### Requirement: App-wide Standard/Moonlight context toggle
**Reason**: The global Moonlight context toggle is replaced by per-stage `useMoonlightScores` configuration (see stage-config spec). Scores and Moonlight filtering are now controlled at the stage level, eliminating the need for an app-wide mode switch.
**Migration**: Remove the context toggle control from the app header/nav. Any existing `appContext` value stored in `localStorage` under `pickup_prefs_v1` SHALL be silently ignored on load (no crash). Operators should configure `useMoonlightScores` on each relevant stage in the project settings.

## MODIFIED Requirements

### Requirement: AppPreferencesContext provides context value to component tree
The `AppPreferencesContext` SHALL expose `timeFormat: '12h' | '24h'` and a setter to all descendant components via a custom hook `useAppPreferences`. The previously exposed `appContext` field is removed. The `hiddenNames` field and its setter remain unchanged.

#### Scenario: Components can read active time format
- **WHEN** a component calls `useAppPreferences()`
- **THEN** it SHALL receive the current `timeFormat` value (`'12h'` or `'24h'`)

#### Scenario: Hook throws outside provider
- **WHEN** `useAppPreferences()` is called outside of `AppPreferencesContext.Provider`
- **THEN** it SHALL throw a descriptive error

## ADDED Requirements

### Requirement: App-wide time format preference (12h / 24h)
The application SHALL provide a persistent toggle control in the app preferences that switches all time displays between 12-hour (AM/PM) and 24-hour formats. This preference SHALL be stored in `AppPreferencesContext` and persisted in `localStorage` so it survives page reloads. The default value SHALL be `'24h'` to preserve existing behavior for existing users.

#### Scenario: Default time format is 24-hour on first load
- **WHEN** the application loads and no `timeFormat` preference has been stored in `localStorage`
- **THEN** `timeFormat` SHALL be `'24h'`
- **THEN** all time labels throughout the app SHALL display in HH:MM format

#### Scenario: Persisted time format is restored on reload
- **WHEN** the user has previously set a time format preference and reloads the page
- **THEN** `timeFormat` SHALL be restored to the previously stored value

#### Scenario: Switching to 12-hour format updates all time labels
- **WHEN** the user sets `timeFormat` to `'12h'`
- **THEN** the new value SHALL be persisted to `localStorage` immediately
- **THEN** all components consuming `timeFormat` (grid row headers, slot tray) SHALL re-render with 12-hour formatted times

#### Scenario: Switching to 24-hour format updates all time labels
- **WHEN** the user sets `timeFormat` to `'24h'`
- **THEN** the new value SHALL be persisted to `localStorage` immediately
- **THEN** all time labels throughout the app SHALL display in HH:MM format

#### Scenario: Time format preference visible and accessible from app settings
- **WHEN** the user opens the app preferences controls
- **THEN** a 12h / 24h time format toggle SHALL be visible and operable
