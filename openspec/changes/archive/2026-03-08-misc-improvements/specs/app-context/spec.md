## MODIFIED Requirements

### Requirement: App-wide Standard/Moonlight context toggle
The application SHALL provide a persistent toggle control accessible from the global navigation or app header that switches the app between "Standard" and "Moonlight" contexts. This preference SHALL be stored in a React context (`AppPreferencesContext`) available to all components. The selected context SHALL be persisted in `localStorage` so it survives page reloads. Preferences SHALL NOT be stored in the project file, as multiple users share the same project.

#### Scenario: Default context is Standard on first ever load
- **WHEN** the application loads and no preference has been stored in localStorage
- **THEN** the active context SHALL be "Standard"
- **THEN** the toggle SHALL reflect the Standard state

#### Scenario: Persisted context is restored on reload
- **WHEN** the user has previously set a context (Standard or Moonlight) and reloads the page
- **THEN** the active context SHALL be restored to the previously selected value from localStorage

#### Scenario: User switches to Moonlight context
- **WHEN** the user activates the Moonlight toggle
- **THEN** the active context SHALL become "Moonlight"
- **THEN** all components consuming `AppPreferencesContext` SHALL re-render to reflect Moonlight context
- **THEN** the new value SHALL be persisted to localStorage

#### Scenario: User switches back to Standard context
- **WHEN** the user activates the Standard toggle while Moonlight is active
- **THEN** the active context SHALL revert to "Standard"
- **THEN** all components consuming `AppPreferencesContext` SHALL re-render to reflect Standard context
- **THEN** the new value SHALL be persisted to localStorage

#### Scenario: Toggle is visible and accessible from all project views
- **WHEN** the user is viewing any route within a project workspace (submissions, lineup, etc.)
- **THEN** the context toggle SHALL be visible and operable without navigating away

### Requirement: AppPreferencesContext provides context value to component tree
The `AppPreferencesContext` SHALL expose `appContext: 'standard' | 'moonlight'` and a setter to all descendant components via a custom hook `useAppPreferences`.

#### Scenario: Components can read active context
- **WHEN** a component calls `useAppPreferences()`
- **THEN** it SHALL receive the current `appContext` value ('standard' or 'moonlight')

#### Scenario: Hook throws outside provider
- **WHEN** `useAppPreferences()` is called outside of `AppPreferencesContext.Provider`
- **THEN** it SHALL throw a descriptive error

### Requirement: App-wide hidden names toggle persists across reloads
The `hiddenNames` preference SHALL be stored in `localStorage` so it is restored when the user reloads the page. It SHALL NOT be stored in the project file.

#### Scenario: Default hidden-names state on first ever load
- **WHEN** the application loads and no hiddenNames preference has been stored in localStorage
- **THEN** `hiddenNames` SHALL be `false`

#### Scenario: Persisted hidden-names state is restored on reload
- **WHEN** the user has previously enabled or disabled hidden names and reloads the page
- **THEN** `hiddenNames` SHALL be restored to the previously stored value

#### Scenario: Changing hidden-names persists to localStorage
- **WHEN** the user toggles the hidden names control
- **THEN** the new value SHALL be written to localStorage immediately
