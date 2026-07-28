// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ClarifyChip } from '../../../src/webview/components/ClarifyChip'
import type { CardClarifications, Clarification } from '../../../src/shared/types'

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

function card(requests: Clarification[]): CardClarifications {
  return { cardId: 'a-card', requests }
}

describe('ClarifyChip', () => {
  it('shows nothing when the card has no questions', () => {
    render(<ClarifyChip clarifications={null} />)
    expect(screen.queryByTestId('clarify-chip')).toBeNull()
    render(<ClarifyChip clarifications={card([])} />)
    expect(screen.queryByTestId('clarify-chip')).toBeNull()
  })

  it('shows the question itself, not just that there is one', () => {
    render(<ClarifyChip clarifications={card([request()])} />)
    expect(screen.getByText('which pages exactly?')).toBeInTheDocument()
  })

  it('says which stage the question is at', () => {
    const { rerender } = render(<ClarifyChip clarifications={card([request({ status: 'pending' })])} />)
    expect(screen.getByTestId('clarify-chip')).toHaveAttribute('data-status', 'pending')

    rerender(<ClarifyChip clarifications={card([request({ status: 'working' })])} />)
    expect(screen.getByTestId('clarify-chip')).toHaveAttribute('data-status', 'working')

    rerender(<ClarifyChip clarifications={card([request({ status: 'answered' })])} />)
    expect(screen.getByTestId('clarify-chip')).toHaveAttribute('data-status', 'answered')
  })

  it('shows an unfinished question ahead of a finished one', () => {
    render(<ClarifyChip clarifications={card([
      request({ id: '1', status: 'answered', question: 'old one' }),
      request({ id: '2', status: 'pending', question: 'new one' }),
    ])} />)
    expect(screen.getByText('new one')).toBeInTheDocument()
    expect(screen.queryByText('old one')).toBeNull()
  })

  it('counts the ones it is not showing', () => {
    render(<ClarifyChip clarifications={card([request({ id: '1' }), request({ id: '2' }), request({ id: '3' })])} />)
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('offers Compare only once there is a snapshot to compare against', () => {
    const onCompare = vi.fn()
    const { rerender } = render(
      <ClarifyChip clarifications={card([request({ status: 'answered' })])} onCompare={onCompare} />
    )
    expect(screen.queryByTitle(/compare/i)).toBeNull()

    rerender(
      <ClarifyChip
        clarifications={card([request({ status: 'answered', snapshotPath: '.clarify/history/a/1.md' })])}
        onCompare={onCompare}
      />
    )
    fireEvent.click(screen.getByTitle(/compare/i))
    expect(onCompare).toHaveBeenCalledWith('clar-1')
  })

  it('does not offer Compare while the answer is still being written', () => {
    render(
      <ClarifyChip
        clarifications={card([request({ status: 'working', snapshotPath: '.clarify/history/a/1.md' })])}
        onCompare={vi.fn()}
      />
    )
    expect(screen.queryByTitle(/compare/i)).toBeNull()
  })

  it('reports which question was dismissed', () => {
    const onDismiss = vi.fn()
    render(<ClarifyChip clarifications={card([request({ id: 'clar-9' })])} onDismiss={onDismiss} />)
    fireEvent.click(screen.getByTitle(/dismiss/i))
    expect(onDismiss).toHaveBeenCalledWith('clar-9')
  })

  it('keeps a click on its buttons from opening the card underneath', () => {
    const onCardClick = vi.fn()
    render(
      <div onClick={onCardClick}>
        <ClarifyChip clarifications={card([request()])} onDismiss={vi.fn()} />
      </div>
    )
    fireEvent.click(screen.getByTitle(/dismiss/i))
    expect(onCardClick).not.toHaveBeenCalled()
  })
})
