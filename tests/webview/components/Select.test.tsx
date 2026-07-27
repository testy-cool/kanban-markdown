// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Select } from '../../../src/webview/components/Select'

const OPTIONS = [
  { value: 'all', label: 'All priorities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
]

function setup(value = 'all') {
  const onChange = vi.fn()
  render(<Select value={value} options={OPTIONS} onChange={onChange} />)
  return { onChange, trigger: screen.getByRole('combobox') }
}

describe('Select', () => {
  it('shows the label of the current value and no list', () => {
    setup('critical')
    expect(screen.getByRole('combobox')).toHaveTextContent('Critical')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('opens on click and lists every option', () => {
    const { trigger } = setup()
    fireEvent.click(trigger)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('reports the chosen value and closes', () => {
    const { onChange, trigger } = setup()
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('option', { name: /High/ }))
    expect(onChange).toHaveBeenCalledWith('high')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('marks only the current value as selected', () => {
    const { trigger } = setup('high')
    fireEvent.click(trigger)
    const selected = screen.getAllByRole('option').filter(o => o.getAttribute('aria-selected') === 'true')
    expect(selected).toHaveLength(1)
    expect(selected[0]).toHaveTextContent('High')
  })

  it('opens with the arrow key and picks with enter', () => {
    const { onChange, trigger } = setup('all')
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('critical')
  })

  it('does not run past either end of the list', () => {
    const { onChange, trigger } = setup('all')
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    fireEvent.keyDown(trigger, { key: 'ArrowUp' })
    fireEvent.keyDown(trigger, { key: 'ArrowUp' })
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('all')
  })

  it('closes on escape without choosing anything', () => {
    const { onChange, trigger } = setup()
    fireEvent.click(trigger)
    fireEvent.keyDown(trigger, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('closes when the pointer goes down outside it', () => {
    const { trigger } = setup()
    fireEvent.click(trigger)
    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('shows a heading once above each group', () => {
    render(
      <Select
        value="all"
        onChange={() => {}}
        options={[
          { value: 'all', label: 'All labels' },
          { value: 'a', label: 'scraper', group: 'Labels' },
          { value: 'b', label: 'faq', group: 'Labels' },
        ]}
      />
    )
    fireEvent.click(screen.getByRole('combobox'))
    expect(screen.getAllByText('Labels')).toHaveLength(1)
  })
})
