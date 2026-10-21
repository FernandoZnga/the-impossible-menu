import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Dashboard } from '../components/Dashboard'
import { Debrief } from '../components/Debrief'
import { clearSessions, finishSession, getSession, startSession } from './store'

beforeEach(() => {
  clearSessions()
})
afterEach(() => {
  clearSessions()
  vi.restoreAllMocks()
})

describe('local results components', () => {
  it('filters local mode metrics and requires confirmation before clearing runs', () => {
    const first = startSession('simple')
    finishSession(first.id, 'completed')
    const second = startSession('impossible')
    finishSession(second.id, 'abandoned')
    const onClose = vi.fn()
    render(<Dashboard onClose={onClose} />)
    expect(screen.getByText('1 / 2 (50%)')).toBeInTheDocument()
    expect(screen.getByText('simple: 1/1 runs · 100% · Browser participants: 1')).toBeInTheDocument()
    expect(screen.getByText('impossible: 0/1 runs · 0% · Browser participants: 1')).toBeInTheDocument()
    expect(screen.queryByRole('main')).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Filter by mode'), { target: { value: 'simple' } })
    expect(screen.getByText('1 / 1 (100%)')).toBeInTheDocument()
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    fireEvent.click(screen.getByRole('button', { name: 'Clear local runs' }))
    expect(getSession(first.id)).toBeDefined()
    confirm.mockReturnValue(true)
    fireEvent.click(screen.getByRole('button', { name: 'Clear local runs' }))
    expect(getSession(first.id)).toBeUndefined()
    expect(screen.getByText('No recorded runs for this selection yet.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Back to experiment' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows actual status and counters, and saves all five accessible rating groups', () => {
    const session = startSession('impossible')
    finishSession(session.id, 'abandoned')
    const onRestart = vi.fn()
    const onDashboard = vi.fn()
    const view = render(<Debrief sessionId={session.id} onRestart={onRestart} onDashboard={onDashboard} />)
    expect(screen.getByText('Status: Manually abandoned')).toBeInTheDocument()
    expect(screen.queryByRole('main')).not.toBeInTheDocument()
    const groups = screen.getAllByRole('group')
    expect(groups).toHaveLength(5)
    for (const question of [
      'How difficult was it to make your choices?',
      'How much mental effort did the experience require?',
      'How frustrated did you feel during the experience?',
      'How satisfied are you with the experience?',
      'How likely are you to use this platform again?',
    ]) expect(screen.getByRole('group', { name: question })).toBeInTheDocument()
    for (const group of groups) fireEvent.click(within(group).getByRole('radio', { name: '4' }))
    expect(getSession(session.id)?.ratings).toEqual({
      difficulty: 4, mentalEffort: 4, frustration: 4, satisfaction: 4, reuseLikelihood: 4,
    })
    expect(screen.getByRole('status')).toHaveTextContent('5 of 5 ratings saved locally.')
    view.unmount()
    render(<Debrief sessionId={session.id} onRestart={onRestart} onDashboard={onDashboard} />)
    expect(screen.getAllByRole('radio', { checked: true })).toHaveLength(5)
    fireEvent.click(screen.getByRole('button', { name: 'Try another mode' }))
    fireEvent.click(screen.getByRole('button', { name: 'Compare local runs' }))
    expect(onRestart).toHaveBeenCalledOnce()
    expect(onDashboard).toHaveBeenCalledOnce()
    act(() => clearSessions())
    expect(screen.getByRole('heading', { name: 'Run not available' })).toBeInTheDocument()
    expect(screen.queryByRole('main')).not.toBeInTheDocument()
  })
})
