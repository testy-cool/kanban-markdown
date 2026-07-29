import type { ReactNode } from 'react'
import { diffLines, hasChanges, type LineOp, type WordOp } from '../../shared/textDiff'
import { renderInlineMarkdown } from '../lib/inlineMarkdown'
import { t } from '../lib/i18n'

/**
 * The card as it reads now, with what changed marked in place.
 *
 * It renders the markdown rather than showing the source, because the point is
 * to see the change in the text you actually read. Added text is tinted green,
 * removed text is struck through and left where it was.
 */

interface CardDiffProps {
  before: string
  after: string
}

export function CardDiff({ before, after }: CardDiffProps) {
  const ops = diffLines(before, after)

  if (!hasChanges(ops)) {
    return (
      <div className="px-3 py-6 text-sm text-fg-dim" data-testid="card-diff-empty">
        {t('diff.noChanges')}
      </div>
    )
  }

  const inCode = markCodeLines(ops)
  return (
    <div className="card-diff" data-testid="card-diff">
      {ops.map((op, index) => (
        <DiffLine key={index} op={op} code={inCode[index]} />
      ))}
    </div>
  )
}

/** Which lines sit inside a fenced code block, fences included. */
function markCodeLines(ops: LineOp[]): boolean[] {
  let open = false
  return ops.map((op) => {
    const fence = /^\s*```/.test(op.text)
    const code = open || fence
    if (fence) open = !open
    return code
  })
}

function DiffLine({ op, code }: { op: LineOp; code: boolean }) {
  if (op.text.trim() === '') {
    return <div className="card-diff-blank" data-change={op.type} />
  }
  return (
    <div className="card-diff-line" data-change={op.type}>
      <span className="card-diff-gutter" aria-hidden="true">
        {op.type === 'added' ? '+' : op.type === 'removed' ? '−' : ''}
      </span>
      <span className="card-diff-text">{renderLine(op, code)}</span>
    </div>
  )
}

/** Heading level, list marker and so on, so a diff still reads as the document. */
function renderLine(op: LineOp, code: boolean): ReactNode {
  const line = op.text

  if (code) {
    return <code className="card-diff-code">{line || ' '}</code>
  }

  const heading = /^(#{1,6})\s+(.*)$/.exec(line)
  if (heading) {
    const level = heading[1].length
    return (
      <span className="card-diff-heading" data-level={level}>
        {inline(op, heading[2])}
      </span>
    )
  }

  const bullet = /^(\s*)[-*+]\s+(.*)$/.exec(line)
  if (bullet) {
    return (
      <span className="card-diff-item" style={{ paddingLeft: `${bullet[1].length * 0.5}rem` }}>
        <span className="card-diff-marker">{'•'}</span>
        {inline(op, bullet[2])}
      </span>
    )
  }

  const numbered = /^(\s*)(\d+)\.\s+(.*)$/.exec(line)
  if (numbered) {
    return (
      <span className="card-diff-item" style={{ paddingLeft: `${numbered[1].length * 0.5}rem` }}>
        <span className="card-diff-marker">{numbered[2]}.</span>
        {inline(op, numbered[3])}
      </span>
    )
  }

  const quote = /^\s*>\s?(.*)$/.exec(line)
  if (quote) {
    return <span className="card-diff-quote">{inline(op, quote[1])}</span>
  }

  if (/^\s*(\*\s*){3,}$|^\s*(-\s*){3,}$/.test(line)) {
    return <span className="card-diff-rule" />
  }

  if (line.trimStart().startsWith('|')) {
    return <code className="card-diff-code">{line}</code>
  }

  return inline(op, line)
}

/**
 * Word marks win over formatting on an edited line.
 *
 * Where a line was rewritten rather than added whole, showing which words moved
 * says more than showing the line in bold, and trying to do both at once
 * produces marks that break across the formatting.
 */
function inline(op: LineOp, text: string): ReactNode {
  if (!op.words || op.type === 'equal') return renderInlineMarkdown(text)
  return op.words.filter(keepFor(op.type)).map((word, index) => (
    <span key={index} className="card-diff-word" data-change={word.type}>
      {word.text}
    </span>
  ))
}

/** The removed row shows what went, the added row shows what arrived. */
function keepFor(type: LineOp['type']) {
  return (word: WordOp) => (type === 'removed' ? word.type !== 'added' : word.type !== 'removed')
}
