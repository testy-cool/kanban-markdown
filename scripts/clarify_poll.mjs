#!/usr/bin/env node
/**
 * Watches the clarification sidecars and prints a line whenever a question is
 * waiting to be answered.
 *
 * It exists so the watching agent can sleep on a Monitor instead of re-reading
 * every card on a timer. One JSON object per line, flushed immediately.
 *
 *   node scripts/clarify_poll.mjs [boardDir]
 *
 * boardDir defaults to .kanban/features under the current directory.
 */

import { readdir, readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const boardDir = resolve(process.argv[2] ?? '.kanban/features')
const clarifyDir = join(boardDir, '.clarify')
const INTERVAL_MS = 1000

/** Ids already announced, so a question is only reported once. */
const announced = new Set()

function emit(event) {
  process.stdout.write(JSON.stringify({ at: new Date().toISOString(), ...event }) + '\n')
}

async function readSidecars() {
  let names
  try {
    names = await readdir(clarifyDir)
  } catch {
    return []
  }

  const out = []
  for (const name of names) {
    if (!name.endsWith('.json')) continue
    try {
      const parsed = JSON.parse(await readFile(join(clarifyDir, name), 'utf8'))
      if (Array.isArray(parsed?.requests)) {
        out.push({ cardId: parsed.cardId ?? name.slice(0, -5), requests: parsed.requests })
      }
    } catch {
      // A half written file on the next tick will be whole. Nothing to say.
    }
  }
  return out
}

async function tick() {
  const sidecars = await readSidecars()
  const waiting = []

  for (const { cardId, requests } of sidecars) {
    for (const request of requests) {
      if (request?.status !== 'pending') {
        // A question that went back to pending should be announced again.
        if (request?.status === 'answered') announced.delete(request.id)
        continue
      }
      if (announced.has(request.id)) continue
      announced.add(request.id)
      waiting.push({
        cardId,
        id: request.id,
        quote: request.quote,
        occurrence: request.occurrence ?? 1,
        question: request.question,
      })
    }
  }

  if (waiting.length > 0) emit({ event: 'pending', count: waiting.length, requests: waiting })
}

emit({ event: 'watching', boardDir, clarifyDir })

// One pass immediately so a question asked before the watcher started is not
// left sitting there until the first interval elapses.
await tick()
setInterval(() => { void tick() }, INTERVAL_MS)
