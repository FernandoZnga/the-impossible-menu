import { describe, expect, it } from 'vitest'
import { duration, percent, summarize } from './metrics'
import type { Session } from './store'
import type { Mode } from '../domain/model'

function run(overrides: Partial<Session> = {}): Session {
  return {
    id: 'run', participantId: 'browser-1', mode: 'impossible' as Mode,
    status: 'completed', startedAt: 0, endedAt: 1000, step: 'cuisine',
    totalMs: 1000, activeMs: 500, activeByStep: { cuisine: 500 },
    decisionsPresented: 10, decisionsMade: 2, optionChanges: 1, revisits: 0,
    recommendationsShown: 1, recommendationsAccepted: 1, recommendationsRejected: 0,
    conflicts: 0, events: [], ratings: {}, ...overrides,
  }
}

describe('local summary metrics', () => {
  it('keeps participant and run counts separate and computes completed-only average and median', () => {
    const metrics = summarize([
      run(), run({ totalMs: 3000 }), run({ totalMs: 8000, participantId: 'browser-2' }),
      run({ status: 'abandoned', totalMs: 99999, step: 'dish', recommendationsAccepted: 0, recommendationsRejected: 1 }),
      run({ status: 'interrupted', totalMs: 99999, recommendationsAccepted: 0 }),
    ])
    expect(metrics).toMatchObject({
      runs: 5, participants: 2, completed: 3, abandoned: 1, interrupted: 1,
      averageTotalMs: 4000, medianTotalMs: 3000, completionRate: 0.6,
      averageDecisions: 2, averageReversals: 1, acceptanceRate: 0.75, mostAbandoned: 'dish (1)',
    })
    expect(summarize([run(), run({ totalMs: 3000 })]).medianTotalMs).toBe(2000)
  })
  it('handles empty samples and no answered recommendations without NaN', () => {
    expect(summarize([])).toMatchObject({ participants: 0, medianTotalMs: null, acceptanceRate: null, completionRate: null })
    expect(duration(null)).toBe('—')
    expect(duration(65000)).toBe('1m 5s')
    expect(percent(null)).toBe('—')
  })
})
