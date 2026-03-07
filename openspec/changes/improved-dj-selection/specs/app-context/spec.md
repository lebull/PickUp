## ADDED Requirements

### Requirement: App-wide Standard/Moonlight context toggle
The application SHALL provide a persistent toggle control accessible from the global navigation or app header that switches the app between "Standard" and "Moonlight" contexts. This preference SHALL be stored in a React context (`AppPreferencesContext`) available to all components. The selected context SHALL NOT be persisted across page reloads.

#### Scenario: Default context is Standard
- **WHEN** the application first loads in a session
- **THEN** the active context SHALL be "Standard"
- **THEN** the toggle SHALL reflect the Standard state

#### Scenario: User switches to Moonlight context
- **WHEN** the user activates the Moonlight toggle
- **THEN** the active context SHALL become "Moonlight"
- **THEN** all components consuming `AppPreferencesContext` SHALL re-render to reflect Moonlight context

#### Scenario: User switches back to Standard context
- **WHEN** the user activates the Standard toggle while Moonlight is active
- **THEN** the active context SHALL revert to "Standard"
- **THEN** all components consuming `AppPreferencesContext` SHALL re-render to reflect Standard context

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
