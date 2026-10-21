import { useEffect, useState } from 'react'
import { getSessions, subscribe } from './store'

export function useSessions() {
  const [sessions, setSessions] = useState(getSessions)
  useEffect(() => {
    const update = () => setSessions(getSessions())
    const unsubscribe = subscribe(update)
    update()
    return unsubscribe
  }, [])
  return sessions
}
