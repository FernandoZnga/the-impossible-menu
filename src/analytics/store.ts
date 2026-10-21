import type { Mode } from '../domain/model'

export type EventType =
  | 'experiment_started' | 'mode_selected' | 'cuisine_selected' | 'dish_selected'
  | 'ingredient_modified' | 'suggestion_accepted' | 'suggestion_rejected'
  | 'configuration_conflict' | 'previous_step_revisited' | 'decision_reversed'
  | 'validation_error' | 'checkout_started' | 'order_completed'
  | 'experiment_abandoned' | 'decision_made' | 'recommendation_shown'
  | 'visibility_changed' | 'focus_changed' | 'session_interrupted'

export interface AnalyticsEvent {
  id: string
  sessionId: string
  type: EventType
  step: string
  timestamp: number
  detail?: Record<string, string | number | boolean>
}

export interface Session {
  id: string
  participantId: string
  mode: Mode
  status: 'in_progress' | 'completed' | 'abandoned' | 'interrupted'
  startedAt: number
  endedAt: number | null
  step: string
  totalMs: number
  activeMs: number
  activeByStep: Record<string, number>
  decisionsPresented: number
  decisionsMade: number
  optionChanges: number
  revisits: number
  recommendationsShown: number
  recommendationsAccepted: number
  recommendationsRejected: number
  conflicts: number
  events: AnalyticsEvent[]
  ratings: Record<string, number>
}

const STORAGE_KEY = 'impossible-menu.analytics.v1'
const PARTICIPANT_KEY = 'impossible-menu.participant.v1'
const EVENT_TYPES: readonly string[] = [
  'experiment_started', 'mode_selected', 'cuisine_selected', 'dish_selected',
  'ingredient_modified', 'suggestion_accepted', 'suggestion_rejected',
  'configuration_conflict', 'previous_step_revisited', 'decision_reversed',
  'validation_error', 'checkout_started', 'order_completed', 'experiment_abandoned',
  'decision_made', 'recommendation_shown', 'visibility_changed', 'focus_changed',
  'session_interrupted',
]
const COUNTERS = [
  'totalMs', 'activeMs', 'decisionsPresented', 'decisionsMade', 'optionChanges',
  'revisits', 'recommendationsShown', 'recommendationsAccepted',
  'recommendationsRejected', 'conflicts',
] as const
interface Clock {
  tick: number
  visible: boolean
  focused: boolean
  timer: ReturnType<typeof setInterval>
}
let loaded = false
let participantId = ''
let sequence = 0
let sessions: Session[] = []
const clocks = new Map<string, Clock>()
const listeners = new Set<() => void>()

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
function nonnegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}
function numericRecord(value: unknown): value is Record<string, number> {
  return record(value) && Object.values(value).every(nonnegative)
}
function validEvent(value: unknown): value is AnalyticsEvent {
  return record(value) && typeof value.id === 'string' &&
    typeof value.sessionId === 'string' && typeof value.step === 'string' &&
    typeof value.type === 'string' && EVENT_TYPES.includes(value.type) &&
    nonnegative(value.timestamp) && (value.detail === undefined ||
      (record(value.detail) && Object.values(value.detail).every(item =>
        typeof item === 'string' || typeof item === 'boolean' ||
        (typeof item === 'number' && Number.isFinite(item)))))
}
function validSession(value: unknown): value is Session {
  return record(value) && typeof value.id === 'string' &&
    typeof value.participantId === 'string' && (value.mode === 'simple' || value.mode === 'impossible') &&
    typeof value.step === 'string' &&
    ['in_progress', 'completed', 'abandoned', 'interrupted'].includes(String(value.status)) &&
    nonnegative(value.startedAt) &&
    (value.endedAt === null || nonnegative(value.endedAt)) &&
    COUNTERS.every(key => nonnegative(value[key])) &&
    typeof value.activeMs === 'number' && typeof value.totalMs === 'number' &&
    value.activeMs <= value.totalMs &&
    numericRecord(value.activeByStep) && numericRecord(value.ratings) &&
    Object.values(value.ratings).every(rating => Number.isInteger(rating) && rating >= 1 && rating <= 5) &&
    Array.isArray(value.events) && value.events.every(event => validEvent(event) && event.sessionId === value.id)
}
function read(key: string): string | null {
  try { return window.localStorage.getItem(key) } catch { return null }
}
function write(key: string, value: string): void {
  try { window.localStorage.setItem(key, value) } catch { /* Continue in memory when storage is blocked or full. */ }
}
function uuid(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  if (globalThis.crypto?.getRandomValues) {
    return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)),
      byte => byte.toString(16).padStart(2, '0')).join('')
  }
  // Identifiers are labels, never authentication credentials.
  return `${Date.now().toString(36)}-${performance.now().toString(36).replace('.', '-')}-${++sequence}`
}
function copy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
function persist(): void {
  write(STORAGE_KEY, JSON.stringify({ version: 1, sessions }))
}
function notify(): void {
  for (const listener of listeners) listener()
}
function append(session: Session, type: EventType, step: string,
  detail?: AnalyticsEvent['detail'], timestamp = Date.now()): void {
  session.events.push({ id: uuid(), sessionId: session.id, type, step, timestamp, ...(detail ? { detail: copy(detail) } : {}) })
}
function load(): void {
  if (loaded) return
  loaded = true
  const savedParticipant = read(PARTICIPANT_KEY)
  participantId = savedParticipant && /^[a-zA-Z0-9-]{8,100}$/.test(savedParticipant) ? savedParticipant : uuid()
  write(PARTICIPANT_KEY, participantId)
  try {
    const data: unknown = JSON.parse(read(STORAGE_KEY) ?? 'null')
    if (record(data) && data.version === 1 && Array.isArray(data.sessions)) {
      sessions = data.sessions.filter(validSession)
    }
  } catch { sessions = [] }
  for (const session of sessions) {
    if (session.status !== 'in_progress') continue
    // Last persisted tick is the last observable instant, not time spent away.
    session.status = 'interrupted'
    session.endedAt = session.startedAt + session.totalMs
    append(session, 'session_interrupted', session.step, { reason: 'unfinished_on_load' }, session.endedAt)
  }
  persist()
}
function flush(session: Session): void {
  const clock = clocks.get(session.id)
  if (!clock || session.status !== 'in_progress') return
  const now = performance.now()
  const elapsed = Math.max(0, now - clock.tick)
  clock.tick = now
  session.totalMs += elapsed
  if (clock.visible && clock.focused) {
    session.activeMs += elapsed
    const previous = Object.hasOwn(session.activeByStep, session.step) ? session.activeByStep[session.step] : 0
    Object.defineProperty(session.activeByStep, session.step, {
      value: previous + elapsed, writable: true, enumerable: true, configurable: true,
    })
  }
}
function current(id: string): Session | undefined {
  load()
  return sessions.find(session => session.id === id)
}
function stop(id: string): void {
  const clock = clocks.get(id)
  if (clock) clearInterval(clock.timer)
  clocks.delete(id)
}
function interrupt(id: string, reason: 'pagehide' | 'superseded' = 'pagehide'): void {
  const session = current(id)
  if (!session || session.status !== 'in_progress') return
  flush(session)
  session.status = 'interrupted'
  session.endedAt = Date.now()
  append(session, 'session_interrupted', session.step, { reason })
  stop(id)
  persist()
  notify()
}

function startClock(session: Session): void {
  clocks.set(session.id, {
    tick: performance.now(), visible: typeof document !== 'undefined' && document.visibilityState !== 'hidden',
    focused: typeof document !== 'undefined' && document.hasFocus(),
    timer: setInterval(() => { flush(session); persist(); notify() }, 5000),
  })
}

export function startSession(mode: Mode): Session {
  load()
  for (const previous of sessions) {
    if (previous.status === 'in_progress') interrupt(previous.id, 'superseded')
  }
  const session: Session = {
    id: uuid(), participantId, mode, status: 'in_progress', startedAt: Date.now(),
    endedAt: null, step: 'cuisine', totalMs: 0, activeMs: 0, activeByStep: {},
    decisionsPresented: 0, decisionsMade: 0, optionChanges: 0, revisits: 0,
    recommendationsShown: 0, recommendationsAccepted: 0, recommendationsRejected: 0,
    conflicts: 0, events: [], ratings: {},
  }
  sessions.push(session)
  startClock(session)
  append(session, 'experiment_started', session.step)
  append(session, 'mode_selected', session.step, { mode })
  persist()
  notify()
  return copy(session)
}

export function track(sessionId: string, type: EventType, step: string,
  detail?: Record<string, string | number | boolean>): void {
  const session = current(sessionId)
  if (!session || session.status !== 'in_progress') return
  flush(session)
  append(session, type, step, detail)
  switch (type) {
    case 'decision_made': session.decisionsMade++; break
    case 'decision_reversed': session.optionChanges++; break
    case 'previous_step_revisited': session.revisits++; break
    case 'recommendation_shown': session.recommendationsShown++; break
    case 'suggestion_accepted': session.recommendationsAccepted++; break
    case 'suggestion_rejected': session.recommendationsRejected++; break
    case 'configuration_conflict': session.conflicts++; break
  }
  persist()
  notify()
}

export function changeStep(sessionId: string, step: string): void {
  const session = current(sessionId)
  if (!session || session.status !== 'in_progress' || session.step === step) return
  flush(session)
  session.step = step
  persist()
  notify()
}

export function present(sessionId: string, step: string, options: number): void {
  const session = current(sessionId)
  if (!session || session.status !== 'in_progress' || !Number.isInteger(options) || options < 0) return
  changeStep(sessionId, step)
  flush(session)
  // The caller deduplicates display occurrences, including dynamically revealed controls.
  session.decisionsPresented += options
  persist()
  notify()
}

export function finishSession(sessionId: string, status: 'completed' | 'abandoned'): Session {
  const session = current(sessionId)
  if (!session) throw new Error('Unknown analytics session')
  if (session.status === 'in_progress') {
    flush(session)
    session.status = status
    session.endedAt = Date.now()
    append(session, status === 'completed' ? 'order_completed' : 'experiment_abandoned', session.step)
    stop(sessionId)
    persist()
    notify()
  }
  return copy(session)
}

export function getSessions(): Session[] {
  load()
  sessions.forEach(flush)
  return copy(sessions)
}
export function getSession(id: string): Session | undefined {
  const session = current(id)
  if (!session) return undefined
  flush(session)
  return copy(session)
}
export function subscribe(listener: () => void): () => void {
  load()
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export function attachLifecycle(sessionId: string): () => void {
  const session = current(sessionId)
  if (!session || session.status !== 'in_progress' || typeof window === 'undefined') return () => {}
  const update = (kind: 'visibility_changed' | 'focus_changed', focused?: boolean) => {
    const clock = clocks.get(sessionId)
    if (!clock || session.status !== 'in_progress') return
    flush(session)
    clock.visible = document.visibilityState !== 'hidden'
    clock.focused = focused ?? document.hasFocus()
    track(sessionId, kind, session.step, kind === 'visibility_changed'
      ? { visible: clock.visible } : { focused: clock.focused })
  }
  // Synchronize without inventing lifecycle events on mount or StrictMode remount.
  const clock = clocks.get(sessionId)
  flush(session)
  if (clock) {
    clock.visible = document.visibilityState !== 'hidden'
    clock.focused = document.hasFocus()
  }
  const visibility = () => update('visibility_changed')
  const focus = () => update('focus_changed', true)
  const blur = () => update('focus_changed', false)
  let interruptedByPagehide = false
  const pagehide = () => {
    if (session.status !== 'in_progress') return
    interruptedByPagehide = true
    interrupt(sessionId)
  }
  const pageshow = (event: PageTransitionEvent) => {
    if (!event.persisted || !interruptedByPagehide) return
    interruptedByPagehide = false
    if (current(sessionId) !== session || session.status !== 'interrupted' ||
      sessions.some(other => other.id !== sessionId && other.status === 'in_progress')) return
    session.status = 'in_progress'
    session.endedAt = null
    // A fresh clock excludes the time spent frozen in the back/forward cache.
    startClock(session)
    persist()
    notify()
  }
  document.addEventListener('visibilitychange', visibility)
  window.addEventListener('focus', focus)
  window.addEventListener('blur', blur)
  window.addEventListener('pagehide', pagehide)
  window.addEventListener('pageshow', pageshow)
  return () => {
    flush(session)
    persist()
    document.removeEventListener('visibilitychange', visibility)
    window.removeEventListener('focus', focus)
    window.removeEventListener('blur', blur)
    window.removeEventListener('pagehide', pagehide)
    window.removeEventListener('pageshow', pageshow)
  }
}

export function saveRatings(sessionId: string, ratings: Record<string, number>): void {
  const session = current(sessionId)
  if (!session) return
  const clean = Object.fromEntries(Object.entries(ratings)
    .filter(([, value]) => Number.isInteger(value) && value >= 1 && value <= 5))
  session.ratings = { ...session.ratings, ...clean }
  persist()
  notify()
}

function download(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
export function exportJSON(): void {
  download('impossible-menu-analytics.json',
    JSON.stringify({ version: 1, exportedAt: Date.now(), sessions: getSessions() }, null, 2), 'application/json')
}
function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? '' : String(value)
  if (/^[\s]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}
export function exportCSV(): void {
  const rows = getSessions()
  const keys = ['id', 'participantId', 'mode', 'status', 'startedAt', 'endedAt', 'step',
    ...COUNTERS, 'activeByStep', 'ratings'] as const
  const csv = [keys.join(','), ...rows.map(session => keys.map(key => csvCell(
    typeof session[key] === 'object' && session[key] !== null ? JSON.stringify(session[key]) : session[key],
  )).join(','))].join('\r\n')
  download('impossible-menu-analytics.csv', csv, 'text/csv;charset=utf-8')
}
export function clearSessions(): void {
  load()
  for (const id of clocks.keys()) stop(id)
  sessions = []
  // Clearing runs deliberately retains the anonymous browser participant ID.
  persist()
  notify()
}
