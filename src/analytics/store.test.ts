import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mode } from '../domain/model'

type Store = typeof import('./store')
let store: Store
const mode: Mode = 'impossible'
const storageKey = 'impossible-menu.analytics.v1'
let detach: (() => void) | undefined

beforeEach(async () => {
  vi.resetModules()
  window.localStorage.clear()
  vi.useFakeTimers({ toFake: ['Date', 'performance', 'setInterval', 'clearInterval', 'setTimeout'] })
  vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  vi.spyOn(document, 'hasFocus').mockReturnValue(true)
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
  store = await import('./store')
})

afterEach(() => {
  detach?.()
  detach = undefined
  store.clearSessions()
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('browser-local analytics', () => {
  it('uses separate run IDs and a stable anonymous participant ID, even after clearing runs', () => {
    const first = store.startSession(mode)
    store.finishSession(first.id, 'completed')
    store.clearSessions()
    const second = store.startSession(mode)
    expect(first.id).not.toBe(second.id)
    expect(first.participantId).toBe(second.participantId)
    expect(second.events.map(event => event.type)).toEqual(['experiment_started', 'mode_selected'])
  })

  it('adds each caller-deduplicated display, including revealed options, and counts decisions explicitly', () => {
    const session = store.startSession(mode)
    store.present(session.id, 'cuisine', 3)
    store.present(session.id, 'cuisine', 8)
    store.track(session.id, 'cuisine_selected', 'cuisine')
    store.track(session.id, 'decision_made', 'cuisine')
    store.track(session.id, 'decision_reversed', 'cuisine')
    store.track(session.id, 'previous_step_revisited', 'cuisine')
    store.track(session.id, 'recommendation_shown', 'cuisine')
    store.track(session.id, 'suggestion_accepted', 'cuisine')
    store.track(session.id, 'suggestion_rejected', 'cuisine')
    store.track(session.id, 'configuration_conflict', 'cuisine')
    store.changeStep(session.id, 'dish')
    store.present(session.id, 'dish', 5)
    store.changeStep(session.id, 'cuisine')
    store.present(session.id, 'cuisine', 8)
    expect(store.getSession(session.id)).toMatchObject({
      decisionsPresented: 24, decisionsMade: 1, optionChanges: 1, revisits: 1,
      recommendationsShown: 1, recommendationsAccepted: 1, recommendationsRejected: 1, conflicts: 1,
    })
  })

  it('attributes active time by stage and excludes hidden and blurred time separately', () => {
    const session = store.startSession(mode)
    detach = store.attachLifecycle(session.id)
    vi.advanceTimersByTime(1000)
    store.changeStep(session.id, 'dish')
    vi.advanceTimersByTime(2000)
    window.dispatchEvent(new Event('blur'))
    vi.advanceTimersByTime(3000)
    window.dispatchEvent(new Event('focus'))
    vi.advanceTimersByTime(1000)
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    document.dispatchEvent(new Event('visibilitychange'))
    vi.advanceTimersByTime(4000)
    // A focused but hidden page must remain inactive.
    window.dispatchEvent(new Event('focus'))
    vi.advanceTimersByTime(1000)
    const finished = store.finishSession(session.id, 'completed')
    expect(finished.totalMs).toBe(12000)
    expect(finished.activeMs).toBe(4000)
    expect(finished.activeByStep).toEqual({ cuisine: 1000, dish: 3000 })
    expect(finished.events.filter(event => event.type === 'visibility_changed')).toHaveLength(1)
    expect(finished.events.filter(event => event.type === 'focus_changed')).toHaveLength(3)
  })

  it('does not begin active time in an initially unfocused page', () => {
    vi.spyOn(document, 'hasFocus').mockReturnValue(false)
    const session = store.startSession(mode)
    vi.advanceTimersByTime(1500)
    expect(store.finishSession(session.id, 'abandoned').activeMs).toBe(0)
  })

  it('makes terminal outcomes idempotent and differentiates manual abandonment from interruption', () => {
    const manual = store.startSession(mode)
    store.finishSession(manual.id, 'abandoned')
    expect(store.finishSession(manual.id, 'completed').status).toBe('abandoned')
    const interrupted = store.startSession(mode)
    detach = store.attachLifecycle(interrupted.id)
    vi.advanceTimersByTime(1000)
    window.dispatchEvent(new Event('pagehide'))
    window.dispatchEvent(new Event('pagehide'))
    const result = store.getSession(interrupted.id)
    expect(result?.status).toBe('interrupted')
    expect(result?.events.filter(event => event.type === 'session_interrupted')).toHaveLength(1)
    expect(result?.events.some(event => event.type === 'experiment_abandoned')).toBe(false)
    store.track(interrupted.id, 'decision_made', 'cuisine')
    expect(store.getSession(interrupted.id)?.decisionsMade).toBe(0)
  })

  it('resumes a pagehide-interrupted live run from bfcache without counting time away', () => {
    const session = store.startSession(mode)
    detach = store.attachLifecycle(session.id)
    vi.advanceTimersByTime(1000)
    window.dispatchEvent(new Event('pagehide'))
    expect(store.getSession(session.id)?.status).toBe('interrupted')
    vi.advanceTimersByTime(60000)
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: false }))
    expect(store.getSession(session.id)?.status).toBe('interrupted')
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))
    expect(store.getSession(session.id)).toMatchObject({ status: 'in_progress', endedAt: null, totalMs: 1000 })
    vi.advanceTimersByTime(2000)
    const completed = store.finishSession(session.id, 'completed')
    expect(completed).toMatchObject({ status: 'completed', totalMs: 3000, activeMs: 3000 })
    expect(completed.events.at(-1)?.type).toBe('order_completed')
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))
    expect(store.getSession(session.id)?.status).toBe('completed')
  })

  it('interrupts a superseded run without a manual abandonment event or allowing a stale page to resume it', () => {
    const previous = store.startSession(mode)
    detach = store.attachLifecycle(previous.id)
    vi.advanceTimersByTime(1000)
    const next = store.startSession(mode)
    expect(store.getSession(previous.id)).toMatchObject({ status: 'interrupted', totalMs: 1000 })
    expect(store.getSession(previous.id)?.events.at(-1)).toMatchObject({
      type: 'session_interrupted', detail: { reason: 'superseded' },
    })
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))
    expect(store.getSession(previous.id)?.status).toBe('interrupted')
    expect(store.getSession(next.id)?.status).toBe('in_progress')
    expect(store.getSession(previous.id)?.events.some(event => event.type === 'experiment_abandoned')).toBe(false)
  })

  it('does not restore a cleared or replaced bfcache run', () => {
    const previous = store.startSession(mode)
    detach = store.attachLifecycle(previous.id)
    window.dispatchEvent(new Event('pagehide'))
    const next = store.startSession(mode)
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))
    expect(store.getSession(previous.id)?.status).toBe('interrupted')
    expect(store.getSession(next.id)?.status).toBe('in_progress')
    store.clearSessions()
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))
    expect(store.getSessions()).toEqual([])
  })

  it('persists periodically and interrupts unfinished runs on reload without counting time away', async () => {
    const session = store.startSession(mode)
    vi.advanceTimersByTime(5000)
    const saved = window.localStorage.getItem(storageKey)
    expect(saved).toContain('"activeMs":5000')
    // Simulate process death: timers cannot survive a document reload.
    vi.clearAllTimers()
    vi.advanceTimersByTime(60000)
    vi.resetModules()
    store = await import('./store')
    const recovered = store.getSession(session.id)
    expect(recovered).toMatchObject({ status: 'interrupted', totalMs: 5000, activeMs: 5000 })
    expect(recovered?.endedAt).toBe(session.startedAt + 5000)
    expect(recovered?.events.at(-1)?.type).toBe('session_interrupted')
  })

  it('survives malformed, invalid-schema, and unavailable local storage', async () => {
    for (const value of ['{broken', '{"version":9,"sessions":[]}', '{"version":1,"sessions":[{"id":"bad"}]}']) {
      window.localStorage.setItem(storageKey, value)
      vi.resetModules()
      store = await import('./store')
      expect(store.getSessions()).toEqual([])
    }
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    vi.resetModules()
    store = await import('./store')
    const session = store.startSession(mode)
    expect(store.finishSession(session.id, 'completed').status).toBe('completed')
  })

  it('defends snapshots, validates ratings, and unsubscribes listeners', () => {
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)
    const session = store.startSession(mode)
    session.ratings.confidence = 100
    expect(store.getSession(session.id)?.ratings).toEqual({})
    store.saveRatings(session.id, { confidence: 5, difficulty: 1, invalid: 6, fractional: 1.5, missing: NaN })
    expect(store.getSession(session.id)?.ratings).toEqual({ confidence: 5, difficulty: 1 })
    const calls = listener.mock.calls.length
    unsubscribe()
    store.track(session.id, 'decision_made', 'cuisine')
    expect(listener).toHaveBeenCalledTimes(calls)
    expect(store.getSession('missing')).toBeUndefined()
  })

  it('exports structured JSON and escaped formula-safe CSV summaries', async () => {
    const blobs: Blob[] = []
    const createObjectURL = vi.fn((blob: Blob) => { blobs.push(blob); return 'blob:local-test' })
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const session = store.startSession(mode)
    store.changeStep(session.id, '=SUM(1,2)"\n')
    store.finishSession(session.id, 'abandoned')
    store.exportJSON()
    store.exportCSV()
    const readBlob = (blob: Blob) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsText(blob)
    })
    const json: unknown = JSON.parse(await readBlob(blobs[0]))
    expect(json).toMatchObject({ version: 1, sessions: [{ id: session.id, status: 'abandoned' }] })
    const csv = await readBlob(blobs[1])
    expect(csv).toContain(`"'=SUM(1,2)""\n"`)
    expect(csv).toContain('participantId,mode,status')
    vi.runOnlyPendingTimers()
    expect(revokeObjectURL).toHaveBeenCalledTimes(2)
  })
})
