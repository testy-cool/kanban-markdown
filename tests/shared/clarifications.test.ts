import { describe, it, expect } from 'vitest'
import {
  clarificationsFileName,
  parseClarifications,
  serializeClarifications,
  newClarification,
  headlineClarification,
  countByStatus,
} from '../../src/shared/clarifications'
import type { CardClarifications, Clarification } from '../../src/shared/types'

function request(overrides: Partial<Clarification> = {}): Clarification {
  return {
    id: 'clar-1',
    quote: 'the same sentence',
    occurrence: 1,
    question: 'which pages exactly?',
    status: 'pending',
    askedAt: '2026-07-28T09:00:00.000Z',
    answeredAt: null,
    snapshotPath: null,
    summary: null,
    ...overrides,
  }
}

describe('clarificationsFileName', () => {
  it('names the file after the card', () => {
    expect(clarificationsFileName('store-headline-2026-07-27')).toBe('store-headline-2026-07-27.json')
  })

  it('does not let an id climb out of the folder', () => {
    expect(clarificationsFileName('../../etc/passwd')).not.toContain('/')
    expect(clarificationsFileName('..')).toBe('...json')
  })
})

describe('parseClarifications', () => {
  it('reads back what it wrote', () => {
    const value: CardClarifications = { cardId: 'a', requests: [request()] }
    expect(parseClarifications(serializeClarifications(value), 'a')).toEqual(value)
  })

  it('gives an empty list for an empty or broken file', () => {
    expect(parseClarifications('', 'a')).toEqual({ cardId: 'a', requests: [] })
    expect(parseClarifications('{ not json', 'a')).toEqual({ cardId: 'a', requests: [] })
    expect(parseClarifications('null', 'a')).toEqual({ cardId: 'a', requests: [] })
    expect(parseClarifications('{"requests":"nope"}', 'a')).toEqual({ cardId: 'a', requests: [] })
  })

  it('drops entries that are not clarifications rather than the whole file', () => {
    const raw = JSON.stringify({ cardId: 'a', requests: [request(), { junk: true }, null] })
    expect(parseClarifications(raw, 'a').requests).toHaveLength(1)
  })

  it('rejects an unknown status', () => {
    const raw = JSON.stringify({ cardId: 'a', requests: [request({ status: 'wat' as never })] })
    expect(parseClarifications(raw, 'a').requests).toHaveLength(0)
  })
})

describe('newClarification', () => {
  it('starts pending, unanswered and with no snapshot', () => {
    const c = newClarification('a passage', 'why?')
    expect(c.status).toBe('pending')
    expect(c.answeredAt).toBeNull()
    expect(c.snapshotPath).toBeNull()
    expect(c.quote).toBe('a passage')
    expect(c.question).toBe('why?')
  })

  it('gives each one its own id', () => {
    expect(newClarification('a', 'b').id).not.toBe(newClarification('a', 'b').id)
  })
})

describe('headlineClarification', () => {
  it('is nothing when there are none', () => {
    expect(headlineClarification(null)).toBeNull()
    expect(headlineClarification({ cardId: 'a', requests: [] })).toBeNull()
  })

  it('prefers an unfinished one over a finished one', () => {
    const value: CardClarifications = {
      cardId: 'a',
      requests: [
        request({ id: 'done', status: 'answered' }),
        request({ id: 'waiting', status: 'pending' }),
      ],
    }
    expect(headlineClarification(value)?.id).toBe('waiting')
  })

  it('falls back to the most recent answered one', () => {
    const value: CardClarifications = {
      cardId: 'a',
      requests: [
        request({ id: 'first', status: 'answered' }),
        request({ id: 'second', status: 'answered' }),
      ],
    }
    expect(headlineClarification(value)?.id).toBe('second')
  })
})

describe('countByStatus', () => {
  it('counts each status', () => {
    const value: CardClarifications = {
      cardId: 'a',
      requests: [
        request({ id: '1', status: 'pending' }),
        request({ id: '2', status: 'working' }),
        request({ id: '3', status: 'answered' }),
        request({ id: '4', status: 'answered' }),
      ],
    }
    expect(countByStatus(value)).toEqual({ pending: 1, working: 1, answered: 2 })
  })

  it('counts nothing for a card with no file', () => {
    expect(countByStatus(null)).toEqual({ pending: 0, working: 0, answered: 0 })
  })
})
