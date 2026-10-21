import { Education } from '../analytics/Education'
import { duration } from '../analytics/metrics'
import { exportCSV, exportJSON, saveRatings } from '../analytics/store'
import { useSessions } from '../analytics/useSessions'

const QUESTIONS = [
  ['difficulty', 'How difficult was it to make your choices?'],
  ['mentalEffort', 'How much mental effort did the experience require?'],
  ['frustration', 'How frustrated did you feel during the experience?'],
  ['satisfaction', 'How satisfied are you with the experience?'],
  ['reuseLikelihood', 'How likely are you to use this platform again?'],
] as const

export function Debrief({ sessionId, onRestart, onDashboard }: {
  sessionId: string
  onRestart: () => void
  onDashboard: () => void
}) {
  const session = useSessions().find(item => item.id === sessionId)
  if (!session) {
    return (
      <section className="panel">
        <h1>Run not available</h1>
        <p>This run may have been cleared or could not be stored in this browser.</p>
        <button className="button" onClick={onRestart}>Start a new run</button>{' '}
        <button className="button button-secondary" onClick={onDashboard}>Open dashboard</button>
      </section>
    )
  }
  const status = {
    completed: 'Completed', abandoned: 'Manually abandoned',
    interrupted: 'Interrupted (page left or refreshed)', in_progress: 'Still in progress',
  }[session.status]
  return (
    <section className="debrief" aria-label="Experiment debrief">
      <header className="panel">
        <p className="eyebrow">Your experiment debrief</p>
        <h1>A moment to reflect.</h1>
        <p><strong>Status: {status}</strong> · Mode: {session.mode}</p>
        <p className="muted">There is no right speed or perfect order. These are observations about this run, not a judgment of your decisions.</p>
      </header>
      <section className="panel" aria-labelledby="run-metrics-title">
        <h2 id="run-metrics-title">What happened in your run</h2>
        <dl className="grid stats">
          <div><dt>Total elapsed time</dt><dd>{duration(session.totalMs)}</dd></div>
          <div><dt>Visible and focused time</dt><dd>{duration(session.activeMs)}</dd></div>
          <div><dt>Options presented</dt><dd>{session.decisionsPresented}</dd></div>
          <div><dt>Decisions made</dt><dd>{session.decisionsMade}</dd></div>
          <div><dt>Choices reversed</dt><dd>{session.optionChanges}</dd></div>
          <div><dt>Previous steps revisited</dt><dd>{session.revisits}</dd></div>
          <div><dt>Recommendations shown / accepted / rejected</dt><dd>{session.recommendationsShown} / {session.recommendationsAccepted} / {session.recommendationsRejected}</dd></div>
          <div><dt>Configuration conflicts</dt><dd>{session.conflicts}</dd></div>
          <div><dt>Last stage</dt><dd>{session.step}</dd></div>
        </dl>
        <h3>Active time by stage</h3>
        {Object.keys(session.activeByStep).length ? (
          <ul>{Object.entries(session.activeByStep).map(([step, ms]) => <li key={step}>{step}: {duration(ms)}</li>)}</ul>
        ) : <p className="muted">No visible, focused time recorded yet.</p>}
      </section>
      <section className="panel" aria-labelledby="ratings-title">
        <h2 id="ratings-title">How did it feel?</h2>
        <p id="rating-help" className="muted">Optional: choose 1 (not at all) through 5 (extremely). Answers save automatically in this browser only.</p>
        {QUESTIONS.map(([key, question]) => (
          <fieldset key={key} aria-describedby="rating-help" style={{ marginBlock: '1rem' }}>
            <legend>{question}</legend>
            {[1, 2, 3, 4, 5].map(rating => (
              <label key={rating} style={{ display: 'inline-flex', gap: '.3rem', padding: '.65rem' }}>
                <input type="radio" name={`${sessionId}-${key}`} value={rating}
                  checked={session.ratings[key] === rating}
                  onChange={() => saveRatings(sessionId, { [key]: rating })} />
                {rating}
              </label>
            ))}
          </fieldset>
        ))}
        <p role="status">{QUESTIONS.filter(([key]) => session.ratings[key] !== undefined).length} of 5 ratings saved locally.</p>
      </section>
      <Education />
      <section className="panel" aria-label="Next steps">
        <button className="button" onClick={onRestart}>Try another mode</button>{' '}
        <button className="button button-secondary" onClick={onDashboard}>Compare local runs</button>{' '}
        <button className="button button-secondary" onClick={exportJSON}>Export all runs + events (JSON)</button>{' '}
        <button className="button button-secondary" onClick={exportCSV}>Export all run summaries (CSV)</button>
      </section>
    </section>
  )
}
