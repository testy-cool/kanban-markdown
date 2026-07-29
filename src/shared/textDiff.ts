/**
 * Line and word diff, with no dependencies, so the webview and the tests can
 * both use it.
 *
 * Card bodies are short, a couple of hundred lines at most, so the plain
 * quadratic longest common subsequence is fast enough and gives better looking
 * results than the heuristics a streaming diff would need.
 */

export type ChangeType = 'equal' | 'added' | 'removed'

export interface WordOp {
  type: ChangeType
  text: string
}

export interface LineOp {
  type: ChangeType
  text: string
  /**
   * Set only where a removed line was paired with an added one, so the view can
   * mark the words that moved rather than repainting the whole line.
   */
  words?: WordOp[]
}

/** The longest common subsequence of two arrays, as pairs of indices. */
function commonPairs<T>(a: T[], b: T[]): Array<[number, number]> {
  const n = a.length
  const m = b.length
  // table[i][j] is the length of the best match of a[i:] against b[j:].
  const table: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1])
    }
  }

  const pairs: Array<[number, number]> = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      pairs.push([i, j])
      i++
      j++
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      i++
    } else {
      j++
    }
  }
  return pairs
}

function splitLines(text: string): string[] {
  return text.replace(/\r\n/g, '\n').split('\n')
}

/**
 * How alike two lines are, from 0 to 1, by the words they share.
 *
 * Used to decide whether a removed line and an added line are two versions of
 * the same sentence or two unrelated ones. Below the threshold they are shown
 * whole, because marking every word of an unrelated line helps nobody.
 */
export function similarity(before: string, after: string): number {
  const a = before.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const b = after.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (a.length === 0 && b.length === 0) return 1
  if (a.length === 0 || b.length === 0) return 0
  const shared = commonPairs(a, b).length
  return (2 * shared) / (a.length + b.length)
}

const PAIR_THRESHOLD = 0.4

/** Words with their trailing spaces kept, so rebuilding the line is exact. */
function tokenize(line: string): string[] {
  return line.match(/\s+|[^\s]+/g) ?? []
}

export function diffWords(before: string, after: string): WordOp[] {
  const a = tokenize(before)
  const b = tokenize(after)
  const pairs = commonPairs(a, b)

  const ops: WordOp[] = []
  const push = (type: ChangeType, text: string) => {
    if (!text) return
    const last = ops[ops.length - 1]
    if (last && last.type === type) last.text += text
    else ops.push({ type, text })
  }

  let i = 0
  let j = 0
  for (const [ai, bj] of pairs) {
    while (i < ai) push('removed', a[i++])
    while (j < bj) push('added', b[j++])
    push('equal', a[ai])
    i = ai + 1
    j = bj + 1
  }
  while (i < a.length) push('removed', a[i++])
  while (j < b.length) push('added', b[j++])
  return ops
}

/**
 * The lines of `after`, with the lines `before` lost marked in place.
 *
 * Removed lines are kept where they were so the reader can see what the text
 * used to say without opening anything else.
 */
export function diffLines(before: string, after: string): LineOp[] {
  const a = splitLines(before)
  const b = splitLines(after)
  const pairs = commonPairs(a, b)

  const ops: LineOp[] = []
  let i = 0
  let j = 0

  const flush = (removed: string[], added: string[]) => {
    // A removed line and an added line in the same run are usually one edited
    // sentence, so pair them up while both sides still have lines left.
    let k = 0
    while (k < removed.length && k < added.length) {
      if (similarity(removed[k], added[k]) >= PAIR_THRESHOLD) {
        const words = diffWords(removed[k], added[k])
        ops.push({ type: 'removed', text: removed[k], words })
        ops.push({ type: 'added', text: added[k], words })
      } else {
        ops.push({ type: 'removed', text: removed[k] })
        ops.push({ type: 'added', text: added[k] })
      }
      k++
    }
    for (let r = k; r < removed.length; r++) ops.push({ type: 'removed', text: removed[r] })
    for (let d = k; d < added.length; d++) ops.push({ type: 'added', text: added[d] })
  }

  for (const [ai, bj] of pairs) {
    const removed: string[] = []
    const added: string[] = []
    while (i < ai) removed.push(a[i++])
    while (j < bj) added.push(b[j++])
    flush(removed, added)
    ops.push({ type: 'equal', text: a[ai] })
    i = ai + 1
    j = bj + 1
  }
  flush(a.slice(i), b.slice(j))

  return ops
}

/** Whether anything actually differs, so the view can say so instead of showing nothing. */
export function hasChanges(ops: LineOp[]): boolean {
  return ops.some((op) => op.type !== 'equal')
}
