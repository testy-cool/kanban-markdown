import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react'
import { ChevronDown, Check } from 'lucide-react'

/**
 * A dropdown that VS Code themes.
 *
 * The browser draws the popup list of a native select, and the operating
 * system decides how it looks, so a native select ignores the colour theme
 * entirely and appears as a white or grey box in the middle of a dark board.
 * This draws the list itself with the menu colours, the way VS Code does.
 */

export interface SelectOption {
  value: string
  label: string
  /** Optional heading this option sits under. */
  group?: string
  /** Optional colour swatch shown to the left of the label. */
  dot?: string
  /** Optional class for the swatch, when the colour comes from the theme. */
  dotClassName?: string
}

interface SelectProps {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  /** Shown when the current value is not in the list. */
  placeholder?: string
  className?: string
  title?: string
  /** Rendered instead of the label, when the trigger needs more than text. */
  renderValue?: (option: SelectOption | undefined) => ReactNode
}

export function Select({
  value,
  options,
  onChange,
  placeholder = '',
  className = '',
  title,
  renderValue,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === value)

  const close = useCallback(() => {
    setOpen(false)
  }, [])

  // Opening lands the highlight on whatever is currently chosen. Done here
  // rather than in an effect, because opening is the event that causes it.
  const openList = useCallback(() => {
    const index = options.findIndex(o => o.value === value)
    setActive(index >= 0 ? index : 0)
    setOpen(true)
  }, [options, value])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open, close])

  // Keep the highlighted row in view when arrowing through a long list.
  useEffect(() => {
    if (!open || !listRef.current) return
    const row = listRef.current.querySelector<HTMLElement>(`[data-index="${active}"]`)
    // Guarded because not every environment the webview runs under implements
    // it, and failing to scroll should never take the dropdown down with it.
    row?.scrollIntoView?.({ block: 'nearest' })
  }, [open, active])

  const choose = (index: number) => {
    const option = options[index]
    if (!option) return
    onChange(option.value)
    close()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        openList()
      }
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(i => Math.min(i + 1, options.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(i => Math.max(i - 1, 0))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActive(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setActive(options.length - 1)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      choose(active)
    } else if (e.key === 'Tab') {
      close()
    }
  }

  // Worked out before rendering rather than tracked with a variable during it,
  // so the render stays free of side effects.
  const rows = options.map((option, index) => ({
    option,
    index,
    heading: option.group && option.group !== options[index - 1]?.group ? option.group : null,
  }))

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        title={title}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
        className="flex items-center gap-1.5 w-full px-2 py-1.5 bg-input border border-input-line rounded text-input-fg text-left cursor-pointer"
      >
        {selected?.dot && (
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${selected.dotClassName ?? ''}`}
            style={selected.dotClassName ? undefined : { backgroundColor: selected.dot }}
          />
        )}
        <span className="flex-1 truncate">
          {renderValue ? renderValue(selected) : selected?.label ?? placeholder}
        </span>
        <ChevronDown size={14} className="shrink-0 text-fg-dim" />
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute left-0 top-full mt-1 z-50 min-w-full max-h-72 overflow-y-auto bg-raised text-raised-fg border border-raised-line rounded-lg shadow-lg py-1"
        >
          {rows.map(({ option, index, heading }) => (
              <div key={option.value}>
                {heading && (
                  <div className="px-2 pt-1.5 pb-0.5 text-[0.7em] uppercase tracking-wide text-fg-dim">
                    {heading}
                  </div>
                )}
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  data-index={index}
                  onClick={() => choose(index)}
                  onMouseEnter={() => setActive(index)}
                  className={`w-full flex items-center gap-1.5 px-2 py-1 text-left cursor-pointer ${
                    index === active ? 'bg-raised-hover' : ''
                  }`}
                >
                  <Check
                    size={12}
                    className={`shrink-0 ${option.value === value ? '' : 'invisible'}`}
                  />
                  {option.dot && (
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${option.dotClassName ?? ''}`}
                      style={option.dotClassName ? undefined : { backgroundColor: option.dot }}
                    />
                  )}
                  <span className="truncate">{option.label}</span>
                </button>
              </div>
          ))}
        </div>
      )}
    </div>
  )
}
