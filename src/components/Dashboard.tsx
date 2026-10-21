import { useState } from 'react'
import type { Mode } from '../domain/model'
import { clearSessions, exportCSV, exportJSON } from '../analytics/store'
import { duration, percent, summarize } from '../analytics/metrics'
import { useSessions } from '../analytics/useSessions'
import { Education } from '../analytics/Education'

export function Dashboard({ onClose }: { onClose: () => void }) {
  const sessions = useSessions()
  const [filter, setFilter] = useState<Mode | 'all'>('all')
  const modes: Mode[] = ['simple', 'impossible']
  const filtered = filter === 'all' ? sessions : sessions.filter(session => session.mode === filter)
  const metrics = summarize(filtered)
  return (
    <section className="dashboard" aria-label="Analytics dashboard">
      <header className="panel">
        <p className="eyebrow">Anonymous · browser-local · no server</p>
        <h1>Your decision lab</h1>
        <p className="muted">Only runs saved in this browser appear here. Exports include all local runs, regardless of the current filter. No names, email addresses, or accounts are collected.</p>
        <button className="button button-secondary" onClick={onClose}>Back to experiment</button>
      </header>
      <section className="panel" aria-labelledby="metrics-title">
        <h2 id="metrics-title">Local results</h2>
        <label htmlFor="analytics-mode">Filter by mode </label>
        <select id="analytics-mode" value={filter} onChange={event => {
          const value = event.target.value
          setFilter(modes.find(mode => mode === value) ?? 'all')
        }}>
          <option value="all">All modes</option>
          {modes.map(mode => <option key={mode} value={mode}>{mode}</option>)}
        </select>
        {filtered.length === 0 && <p>No recorded runs for this selection yet.</p>}
        <dl className="grid stats">
          <div><dt>Anonymous browser participants</dt><dd>{metrics.participants}</dd></div>
          <div><dt>Runs</dt><dd>{metrics.runs}</dd></div>
          <div><dt>Completed / all runs</dt><dd>{metrics.completed} / {metrics.runs} ({percent(metrics.completionRate)})</dd></div>
          <div><dt>Average completed total time</dt><dd>{duration(metrics.averageTotalMs)}</dd></div>
          <div><dt>Median completed total time</dt><dd>{duration(metrics.medianTotalMs)}</dd></div>
          <div><dt>Average decisions / run</dt><dd>{metrics.averageDecisions?.toFixed(1) ?? '—'}</dd></div>
          <div><dt>Average reversals / run</dt><dd>{metrics.averageReversals?.toFixed(1) ?? '—'}</dd></div>
          <div><dt>Recommendation acceptance</dt><dd>{percent(metrics.acceptanceRate)} ({metrics.accepted} accepted / {metrics.accepted + metrics.rejected} responses)</dd></div>
          <div><dt>Recommendations shown</dt><dd>{metrics.shown}</dd></div>
          <div><dt>Most manually abandoned stage</dt><dd>{metrics.mostAbandoned}</dd></div>
          <div><dt>Abandoned / interrupted runs</dt><dd>{metrics.abandoned} / {metrics.interrupted}</dd></div>
        </dl>
        <p className="muted">A run is one attempt, not one participant. Timing is elapsed wall time; active time counts only while visible and focused. Unanswered recommendations are excluded from acceptance rate. Completion uses all recorded runs, including unfinished and interrupted runs.</p>
      </section>
      <section className="panel" aria-labelledby="mode-comparison-title">
        <h2 id="mode-comparison-title">Completion by mode</h2>
        {modes.filter(mode => filter === 'all' || mode === filter).map(mode => {
          const summary = summarize(sessions.filter(session => session.mode === mode))
          return (
            <div key={mode} style={{ marginBlock: '1rem' }}>
              <label htmlFor={`completion-${mode}`}>{mode}: {summary.completed}/{summary.runs} runs · {percent(summary.completionRate)} · Browser participants: {summary.participants}</label>
              <progress id={`completion-${mode}`} aria-label={`${mode} completion rate`}
                max={100} value={(summary.completionRate ?? 0) * 100} style={{ display: 'block', width: '100%' }} />
            </div>
          )
        })}
        {sessions.length === 0 && <p className="muted">Complete or leave a run to begin comparing modes.</p>}
      </section>
      <section className="panel" aria-labelledby="data-title">
        <h2 id="data-title">Your local data</h2>
        <div className="actions">
          <button className="button" onClick={exportJSON}>Export JSON (runs + events)</button>{' '}
          <button className="button button-secondary" onClick={exportCSV}>Export CSV summaries</button>{' '}
          <button className="button button-secondary" onClick={() => {
            if (window.confirm('Delete all analytics runs and ratings saved in this browser? This cannot be undone. Your anonymous browser ID will be retained.')) {
              clearSessions()
              setFilter('all')
            }
          }}>Clear local runs</button>
        </div>
      </section>
      <Education />
    </section>
  )
}
