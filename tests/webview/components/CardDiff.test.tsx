// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CardDiff } from '../../../src/webview/components/CardDiff'

describe('CardDiff', () => {
  it('says so when the answer changed nothing', () => {
    render(<CardDiff before="# Card\n\nSame." after="# Card\n\nSame." />)
    expect(screen.getByTestId('card-diff-empty')).toBeInTheDocument()
  })

  it('marks an added line and keeps a removed one on screen', () => {
    render(<CardDiff before={'# Card\n\nOld line.'} after={'# Card\n\nNew line.'} />)
    const rows = screen.getByTestId('card-diff').querySelectorAll('.card-diff-line')
    const added = Array.from(rows).filter(r => r.getAttribute('data-change') === 'added')
    const removed = Array.from(rows).filter(r => r.getAttribute('data-change') === 'removed')
    expect(added).toHaveLength(1)
    expect(removed).toHaveLength(1)
    expect(added[0].textContent).toContain('New line.')
    expect(removed[0].textContent).toContain('Old line.')
  })

  it('still renders the markdown rather than showing its source', () => {
    render(<CardDiff before={'Body.'} after={'## A heading\n\nBody.'} />)
    const heading = screen.getByTestId('card-diff').querySelector('.card-diff-heading')
    expect(heading).not.toBeNull()
    expect(heading?.getAttribute('data-level')).toBe('2')
    // The hashes are markup, so they are not part of what you read.
    expect(heading?.textContent).toBe('A heading')
  })

  it('does not treat a heading inside a code fence as a heading', () => {
    render(<CardDiff before={'x'} after={'```\n# not a heading\n```'} />)
    const view = screen.getByTestId('card-diff')
    expect(view.querySelector('.card-diff-heading')).toBeNull()
    const code = Array.from(view.querySelectorAll('.card-diff-code')).map(e => e.textContent)
    expect(code).toContain('# not a heading')
  })
})
