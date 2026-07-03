"use client"

export type LeanUxEvent = {
  id: string
  elapsedMs: number
  label: string
  detail?: string
}

const sessionKey = "kitaapp:leanux-session"
const eventsKey = "kitaapp:leanux-events"
const changeEvent = "kitaapp:leanux-events-updated"

const now = () => Math.round(performance.now())

const readStart = () => {
  const stored = window.localStorage.getItem(sessionKey)
  if (!stored) return null
  const parsed = Number(stored)
  return Number.isFinite(parsed) ? parsed : null
}

export function resetLeanUxSession() {
  window.localStorage.setItem(sessionKey, String(now()))
  window.localStorage.setItem(eventsKey, JSON.stringify([]))
  window.dispatchEvent(new Event(changeEvent))
}

export function recordLeanUxEvent(label: string, detail?: string) {
  const start = readStart() ?? now()
  if (!readStart()) window.localStorage.setItem(sessionKey, String(start))
  const events = getLeanUxEvents()
  const event: LeanUxEvent = {
    id: `${Date.now()}-${events.length}`,
    elapsedMs: Math.max(0, now() - start),
    label,
    detail,
  }
  window.localStorage.setItem(eventsKey, JSON.stringify([...events, event].slice(-80)))
  window.dispatchEvent(new Event(changeEvent))
}

export function getLeanUxEvents(): LeanUxEvent[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(eventsKey) ?? "[]")
    return Array.isArray(parsed) ? parsed.filter((event): event is LeanUxEvent => typeof event?.label === "string" && typeof event?.elapsedMs === "number") : []
  } catch {
    return []
  }
}

export function subscribeLeanUxEvents(callback: () => void) {
  window.addEventListener(changeEvent, callback)
  window.addEventListener("storage", callback)
  return () => {
    window.removeEventListener(changeEvent, callback)
    window.removeEventListener("storage", callback)
  }
}
