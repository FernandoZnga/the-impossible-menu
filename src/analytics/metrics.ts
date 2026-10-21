import type { Session } from './store'

export function summarize(sessions: Session[]) {
  const completed = sessions.filter(session => session.status === 'completed')
  const times = completed.map(session => session.totalMs).sort((a, b) => a - b)
  const average = (values: number[]) => values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length : null
  const sum = (key: 'decisionsMade' | 'optionChanges' | 'recommendationsAccepted' | 'recommendationsRejected' | 'recommendationsShown') =>
    sessions.reduce((total, session) => total + session[key], 0)
  const abandonedStages = new Map<string, number>()
  for (const session of sessions) {
    if (session.status === 'abandoned') {
      abandonedStages.set(session.step, (abandonedStages.get(session.step) ?? 0) + 1)
    }
  }
  const mostAbandoned = [...abandonedStages.entries()].sort((a, b) => b[1] - a[1])
  const accepted = sum('recommendationsAccepted')
  const rejected = sum('recommendationsRejected')
  return {
    runs: sessions.length,
    participants: new Set(sessions.map(session => session.participantId)).size,
    completed: completed.length,
    abandoned: sessions.filter(session => session.status === 'abandoned').length,
    interrupted: sessions.filter(session => session.status === 'interrupted').length,
    completionRate: sessions.length ? completed.length / sessions.length : null,
    averageTotalMs: average(times),
    medianTotalMs: times.length ? times.length % 2 ? times[Math.floor(times.length / 2)]
      : (times[times.length / 2 - 1] + times[times.length / 2]) / 2 : null,
    averageDecisions: average(sessions.map(session => session.decisionsMade)),
    averageReversals: average(sessions.map(session => session.optionChanges)),
    accepted, rejected, shown: sum('recommendationsShown'),
    acceptanceRate: accepted + rejected ? accepted / (accepted + rejected) : null,
    mostAbandoned: mostAbandoned.length
      ? mostAbandoned.filter(([, count]) => count === mostAbandoned[0][1]).map(([step, count]) => `${step} (${count})`).join(', ')
      : 'None',
  }
}

export function duration(ms: number | null): string {
  if (ms === null) return '—'
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60_000)}m ${Math.floor((ms % 60_000) / 1000)}s`
}

export function percent(value: number | null): string {
  return value === null ? '—' : `${Math.round(value * 100)}%`
}
