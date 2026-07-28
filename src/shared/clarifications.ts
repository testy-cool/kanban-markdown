import type { CardClarifications, Clarification } from './types'

/**
 * Reading and writing the clarification sidecar, kept free of the file system
 * so both the extension and the tests can use it.
 *
 * One file per card rather than one file for the board, because the extension
 * and the watcher both write, and per card files mean they can only ever
 * collide on a card they are both working on.
 */

export function clarificationsFileName(cardId: string): string {
  // Card ids come from file names, so they are already safe, but a card whose
  // id arrived from somewhere else should not be able to climb out of the
  // folder.
  return `${cardId.replace(/[^a-zA-Z0-9._-]/g, '_')}.json`
}

export function parseClarifications(raw: string, cardId: string): CardClarifications {
  const empty: CardClarifications = { cardId, requests: [] }
  if (!raw.trim()) return empty

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return empty
  }
  if (!parsed || typeof parsed !== 'object') return empty

  const requests = (parsed as CardClarifications).requests
  if (!Array.isArray(requests)) return empty

  return {
    cardId: (parsed as CardClarifications).cardId || cardId,
    requests: requests.filter(isClarification),
  }
}

export function serializeClarifications(value: CardClarifications): string {
  return JSON.stringify(value, null, 2) + '\n'
}

function isClarification(value: unknown): value is Clarification {
  if (!value || typeof value !== 'object') return false
  const c = value as Clarification
  return (
    typeof c.id === 'string' &&
    typeof c.quote === 'string' &&
    typeof c.question === 'string' &&
    (c.status === 'pending' || c.status === 'working' || c.status === 'answered')
  )
}

export function newClarification(quote: string, question: string, occurrence = 1): Clarification {
  return {
    id: `clar-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    quote,
    occurrence,
    question,
    status: 'pending',
    askedAt: new Date().toISOString(),
    answeredAt: null,
    snapshotPath: null,
    summary: null,
  }
}

/** The one to show on the card face: anything unfinished beats anything done. */
export function headlineClarification(value: CardClarifications | null): Clarification | null {
  if (!value || value.requests.length === 0) return null
  const unfinished = value.requests.filter(r => r.status !== 'answered')
  const pool = unfinished.length > 0 ? unfinished : value.requests
  return pool[pool.length - 1]
}

export function countByStatus(value: CardClarifications | null): Record<Clarification['status'], number> {
  const counts = { pending: 0, working: 0, answered: 0 }
  for (const request of value?.requests ?? []) counts[request.status]++
  return counts
}
