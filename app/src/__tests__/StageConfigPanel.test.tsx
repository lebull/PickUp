import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StageConfigPanel } from '../components/StageConfigPanel'
import type { Stage } from '../types'

function makeSequentialStage(): Stage {
  return {
    id: 'stage-1',
    name: 'Main Stage',
    stageType: 'sequential',
    activeDays: ['Friday'],
    schedule: {
      Friday: [{ startTime: '20:00', endTime: '22:00', eventType: 'timed' }],
    },
    slotDuration: 60,
  }
}

function makeSpecialStage(): Stage {
  return {
    id: 'stage-special',
    name: 'VIP Showcase',
    stageType: 'special',
  }
}

describe('StageConfigPanel special type selector', () => {
  it('shows guidance and hides day/schedule controls when switched to Special', async () => {
    const user = userEvent.setup()
    render(
      <StageConfigPanel
        stages={[makeSequentialStage()]}
        assignments={[]}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    )

    expect(screen.getByText('Schedule by day')).toBeTruthy()

    await user.selectOptions(screen.getAllByRole('combobox')[0], 'special')

    expect(screen.queryByText('Schedule by day')).toBeNull()
    expect(screen.getByText('Special event setup')).toBeTruthy()
    expect(screen.getByText('Special stages are not day-bound and use open-ended picks.')).toBeTruthy()
  })

  it('restores day/schedule controls when switching from Special back to Sequential', async () => {
    const user = userEvent.setup()
    render(
      <StageConfigPanel
        stages={[makeSequentialStage()]}
        assignments={[]}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    )

    const typeSelect = screen.getAllByRole('combobox')[0]
    await user.selectOptions(typeSelect, 'special')
    expect(screen.queryByText('Schedule by day')).toBeNull()

    await user.selectOptions(typeSelect, 'sequential')
    expect(screen.getByText('Schedule by day')).toBeTruthy()
  })

  it('shows Special selected and allows save with no day/schedule inputs', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(
      <StageConfigPanel
        stages={[makeSpecialStage()]}
        assignments={[]}
        onSave={onSave}
        onClose={vi.fn()}
      />
    )

    expect((screen.getAllByRole('combobox')[0] as HTMLSelectElement).value).toBe('special')
    expect(screen.queryByText('Schedule by day')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSave).toHaveBeenCalledTimes(1)
    const savedStages = onSave.mock.calls[0][0] as Stage[]
    expect(savedStages[0].stageType).toBe('special')
  })
})
