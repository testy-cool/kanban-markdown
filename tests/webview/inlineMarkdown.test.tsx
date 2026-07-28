// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderInlineMarkdown, excerptFromContent } from '../../src/webview/lib/inlineMarkdown'

function html(text: string): string {
  const { container } = render(<div>{renderInlineMarkdown(text)}</div>)
  return container.firstElementChild!.innerHTML
}

describe('renderInlineMarkdown', () => {
  it('leaves plain text alone', () => {
    expect(html('just words')).toBe('just words')
  })

  it('renders bold, italic, code and strikethrough', () => {
    expect(html('a **bold** b')).toBe('a <strong>bold</strong> b')
    expect(html('a *slanted* b')).toBe('a <em>slanted</em> b')
    expect(html('a _slanted_ b')).toBe('a <em>slanted</em> b')
    expect(html('a `code` b')).toBe('a <code>code</code> b')
    expect(html('a ~~gone~~ b')).toBe('a <del>gone</del> b')
  })

  it('reads ** as bold rather than two separate italics', () => {
    expect(html('**both**')).toBe('<strong>both</strong>')
    expect(html('__both__')).toBe('<strong>both</strong>')
  })

  it('keeps a link label and drops its address', () => {
    expect(html('see [the docs](https://example.com) now')).toBe('see the docs now')
  })

  it('nests marks inside each other', () => {
    expect(html('**bold with *italic* inside**'))
      .toBe('<strong>bold with <em>italic</em> inside</strong>')
  })

  it('treats everything inside backticks as literal', () => {
    expect(html('`**not bold**`')).toBe('<code>**not bold**</code>')
  })

  it('handles several marks in one line', () => {
    expect(html('**one** and *two* and `three`'))
      .toBe('<strong>one</strong> and <em>two</em> and <code>three</code>')
  })

  it('leaves underscores inside a word alone, as markdown does', () => {
    expect(html('call some_var_name here')).toBe('call some_var_name here')
    expect(html('a snake_case identifier')).toBe('a snake_case identifier')
  })

  it('leaves an unclosed mark as ordinary text', () => {
    expect(html('a ** dangling')).toBe('a ** dangling')
  })

  it('escapes rather than executes anything that looks like html', () => {
    render(<div data-testid="out">{renderInlineMarkdown('<img src=x onerror=boom>')}</div>)
    expect(screen.getByTestId('out').querySelector('img')).toBeNull()
    expect(screen.getByTestId('out').textContent).toBe('<img src=x onerror=boom>')
  })

  it('returns nothing for an empty string', () => {
    expect(renderInlineMarkdown('')).toEqual([])
  })
})

describe('excerptFromContent', () => {
  it('drops the title heading and keeps the rest', () => {
    expect(excerptFromContent('# The title\n\nThe body.')).toBe('The body.')
  })

  it('keeps everything when there is no title', () => {
    expect(excerptFromContent('No heading here.\nSecond line.')).toBe('No heading here. Second line.')
  })

  it('gives every block its own line and strips its marker', () => {
    const content = '# T\n## Sub\n- one\n* two\n1. three\n> quoted'
    expect(excerptFromContent(content)).toBe('Sub\none\ntwo\nthree\nquoted')
  })

  it('keeps a paragraph typed across several lines as one line', () => {
    expect(excerptFromContent('# T\nA sentence that\nwas wrapped by the editor.'))
      .toBe('A sentence that was wrapped by the editor.')
  })

  it('separates paragraphs with a line break', () => {
    expect(excerptFromContent('# T\nFirst one.\n\nSecond one.'))
      .toBe('First one.\nSecond one.')
  })

  it('drops code fence lines but keeps the code inside them', () => {
    expect(excerptFromContent('# T\n```bash\nnpm test\n```')).toBe('npm test')
  })

  it('keeps each line of a code block on its own line', () => {
    expect(excerptFromContent('# T\n```\nfirst\nsecond\n```'))
      .toBe('first\nsecond')
  })

  it('does not join a paragraph across a code block', () => {
    expect(excerptFromContent('# T\nBefore.\n```\ncode\n```\nAfter.'))
      .toBe('Before.\ncode\nAfter.')
  })

  it('gives each table row its own line and drops the dashes', () => {
    const content = '# T\n| a | b |\n| --- | --- |\n| 1 | 2 |'
    expect(excerptFromContent(content)).toBe('| a | b |\n| 1 | 2 |')
  })

  it('returns an empty string for a card that is only a title', () => {
    expect(excerptFromContent('# Only a title')).toBe('')
  })
})
