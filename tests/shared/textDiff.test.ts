import { describe, it, expect } from 'vitest'
import { diffLines, diffWords, similarity, hasChanges } from '../../src/shared/textDiff'

const text = (ops: { type: string; text: string }[], type: string) =>
  ops.filter(o => o.type === type).map(o => o.text)

describe('diffLines', () => {
  it('says nothing changed when nothing changed', () => {
    const ops = diffLines('one\ntwo', 'one\ntwo')
    expect(hasChanges(ops)).toBe(false)
    expect(ops.every(o => o.type === 'equal')).toBe(true)
  })

  it('marks a paragraph the watcher added', () => {
    const before = '# Card\n\nFirst line.'
    const after = '# Card\n\nFirst line.\n\nA new paragraph.'
    const ops = diffLines(before, after)
    expect(text(ops, 'added')).toContain('A new paragraph.')
    expect(text(ops, 'removed')).toEqual([])
  })

  it('keeps a removed line in place rather than dropping it', () => {
    const ops = diffLines('keep\ngone\nkeep two', 'keep\nkeep two')
    expect(text(ops, 'removed')).toEqual(['gone'])
    // It sits between the two lines that survived, not at the end.
    const positions = ops.map(o => o.type)
    expect(positions.indexOf('removed')).toBe(1)
  })

  it('marks the words that moved when a sentence was rewritten', () => {
    const ops = diffLines('The store ranks first in Romania.', 'The store sells books in Romania.')
    const removed = ops.find(o => o.type === 'removed')
    const added = ops.find(o => o.type === 'added')
    expect(removed?.words).toBeDefined()
    expect(added?.words).toBe(removed?.words)
    const addedWords = removed!.words!.filter(w => w.type === 'added').map(w => w.text).join('')
    expect(addedWords).toContain('sells')
    expect(addedWords).toContain('books')
  })

  it('does not word-mark two lines that have nothing to do with each other', () => {
    const ops = diffLines('Needs a decision from Vlad.', 'Bananas cost four lei.')
    expect(ops.find(o => o.type === 'removed')?.words).toBeUndefined()
    expect(ops.find(o => o.type === 'added')?.words).toBeUndefined()
  })

  it('handles windows line endings without reporting every line as changed', () => {
    const ops = diffLines('one\r\ntwo\r\n', 'one\ntwo\n')
    expect(hasChanges(ops)).toBe(false)
  })

  it('reports an empty card gaining its whole body', () => {
    // An empty card is one empty line, which matches the blank line between
    // the heading and the paragraph, so only the two written lines are new.
    const ops = diffLines('', '# Title\n\nBody.')
    expect(text(ops, 'added')).toEqual(['# Title', 'Body.'])
    expect(text(ops, 'removed')).toEqual([])
  })
})

describe('diffWords', () => {
  it('rebuilds each side exactly, spacing included', () => {
    const before = 'one  two three'
    const after = 'one two  four'
    const ops = diffWords(before, after)
    const left = ops.filter(o => o.type !== 'added').map(o => o.text).join('')
    const right = ops.filter(o => o.type !== 'removed').map(o => o.text).join('')
    expect(left).toBe(before)
    expect(right).toBe(after)
  })

  it('leaves an unchanged string with no marks', () => {
    expect(diffWords('same words', 'same words').every(o => o.type === 'equal')).toBe(true)
  })
})

describe('similarity', () => {
  it('is 1 for the same line and 0 for a line against nothing', () => {
    expect(similarity('a b c', 'a b c')).toBe(1)
    expect(similarity('a b c', '')).toBe(0)
  })

  it('rates a small edit higher than a full rewrite', () => {
    const edited = similarity('the store sells books', 'the store sells cheap books')
    const rewritten = similarity('the store sells books', 'delivery takes four days')
    expect(edited).toBeGreaterThan(rewritten)
  })
})
