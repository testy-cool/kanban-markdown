import { Fragment, createElement, type ReactNode } from 'react'

/**
 * Renders the inline part of markdown, which is what a card excerpt needs.
 *
 * This deliberately does not use the full markdown parser the editor uses. That
 * parser is the largest thing in the bundle, and pulling it into the card would
 * tie it to the board forever. An excerpt only needs bold, italic, code,
 * strikethrough and the visible half of a link, and that is small enough to do
 * here.
 */

interface Rule {
  /** The first capture group is the text inside the marks. */
  re: RegExp
  /** The element to wrap it in, or null to keep the text with no wrapper. */
  tag: 'strong' | 'em' | 'code' | 'del' | null
  /** Whether the text inside can itself contain marks. */
  nested: boolean
}

// Code comes first so that backticks win over everything inside them, which is
// how markdown behaves. Two character marks come before their one character
// versions so that ** is never read as two separate * marks.
const RULES: Rule[] = [
  { re: /`([^`]+)`/, tag: 'code', nested: false },
  { re: /\*\*([\s\S]+?)\*\*/, tag: 'strong', nested: true },
  { re: /(?<!\w)__([\s\S]+?)__(?!\w)/, tag: 'strong', nested: true },
  { re: /~~([\s\S]+?)~~/, tag: 'del', nested: true },
  { re: /\*([^*]+?)\*/, tag: 'em', nested: true },
  // Underscores only count at the edges of a word, so snake_case_names and
  // __dunder__ identifiers are left alone.
  { re: /(?<!\w)_([^_]+?)_(?!\w)/, tag: 'em', nested: true },
  // A link keeps its label and drops the address, which is no use on a card.
  { re: /\[([^\]]+)\]\([^)\s]*\)/, tag: null, nested: true },
]

export function renderInlineMarkdown(text: string): ReactNode[] {
  return render(text, 'i')
}

function render(text: string, keyPrefix: string): ReactNode[] {
  if (!text) return []

  // Whichever mark opens earliest in the string wins, so the text is consumed
  // left to right rather than by rule order.
  let earliest: { rule: Rule; match: RegExpExecArray } | null = null
  for (const rule of RULES) {
    const match = rule.re.exec(text)
    if (!match) continue
    if (!earliest || match.index < earliest.match.index) {
      earliest = { rule, match }
    }
  }

  if (!earliest) return [text]

  const { rule, match } = earliest
  const before = text.slice(0, match.index)
  const after = text.slice(match.index + match[0].length)
  const inner = match[1]

  const rendered = rule.nested
    ? render(inner, `${keyPrefix}n`)
    : [inner]

  const node: ReactNode = rule.tag
    ? createElement(rule.tag, { key: `${keyPrefix}m` }, ...rendered)
    : createElement(Fragment, { key: `${keyPrefix}m` }, ...rendered)

  return [
    ...(before ? [before] : []),
    node,
    ...render(after, `${keyPrefix}a`),
  ]
}

/**
 * Turns the body of a card into one run of text for the excerpt.
 *
 * The title heading is dropped, since the card already shows it. Block markers
 * are stripped because a bullet or a fence means nothing once the lines are
 * joined together, but the words inside them are kept.
 */
export function excerptFromContent(content: string): string {
  const lines = content.split('\n')
  const headingIndex = lines.findIndex(l => /^#\s+/.test(l))
  const body = headingIndex >= 0 ? lines.slice(headingIndex + 1) : lines

  return body
    .filter(l => !/^\s*```/.test(l))          // fence lines carry no words
    .filter(l => !/^\s*\|?\s*[-:| ]+\|/.test(l)) // table rules are punctuation
    .map(l => l
      .replace(/^\s*#{1,6}\s+/, '')            // heading marks
      .replace(/^\s*>\s?/, '')                 // quote marks
      .replace(/^\s*[-*+]\s+/, '')             // bullets
      .replace(/^\s*\d+\.\s+/, '')             // numbers
      .trim())
    .filter(l => l.length > 0)
    .join(' ')
}
