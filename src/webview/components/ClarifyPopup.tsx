import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageCircleQuestion } from 'lucide-react'
import { t } from '../lib/i18n'

/**
 * Select a passage of a card, get a small popup, ask a question about it.
 *
 * The question is tied to the passage rather than to the card as a whole, so
 * whoever answers it knows which sentence you meant. Which copy of the passage
 * you picked is recorded too, since a card can easily say the same thing twice.
 */

export interface AskedQuestion {
  quote: string
  occurrence: number
  question: string
}

interface ClarifyPopupProps {
  /** The element holding the card text that questions can be asked about. */
  containerRef: React.RefObject<HTMLElement | null>
  onAsk: (asked: AskedQuestion) => void
}

interface Pending {
  quote: string
  occurrence: number
  top: number
  left: number
}

export function ClarifyPopup({ containerRef, onAsk }: ClarifyPopupProps) {
  const [pending, setPending] = useState<Pending | null>(null)
  const [asking, setAsking] = useState(false)
  const [question, setQuestion] = useState('')
  const popRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const dismiss = useCallback(() => {
    setPending(null)
    setAsking(false)
    setQuestion('')
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onMouseUp = (e: MouseEvent) => {
      // A click inside the popup is not a new selection.
      if (popRef.current?.contains(e.target as Node)) return

      const selection = window.getSelection()
      const text = selection?.toString().replace(/\s+/g, ' ').trim() ?? ''
      if (!selection || selection.isCollapsed || !text || selection.rangeCount === 0) {
        dismiss()
        return
      }
      const range = selection.getRangeAt(0)
      if (!container.contains(range.commonAncestorContainer)) {
        dismiss()
        return
      }

      const rect = range.getBoundingClientRect()
      setPending({
        quote: text,
        occurrence: occurrenceOf(container, range, text),
        top: Math.max(4, rect.top - 34),
        left: Math.max(4, rect.left),
      })
      setAsking(false)
      setQuestion('')
    }

    document.addEventListener('mouseup', onMouseUp)
    return () => document.removeEventListener('mouseup', onMouseUp)
  }, [containerRef, dismiss])

  useEffect(() => {
    if (asking) inputRef.current?.focus({ preventScroll: true })
  }, [asking])

  if (!pending) return null

  const submit = () => {
    const asked = question.trim()
    if (!asked) return
    onAsk({ quote: pending.quote, occurrence: pending.occurrence, question: asked })
    dismiss()
  }

  return (
    <div
      ref={popRef}
      className="clarify-pop"
      style={{ top: pending.top, left: pending.left }}
      data-testid="clarify-pop"
      onMouseDown={(e) => e.preventDefault()}
    >
      {!asking ? (
        <button
          type="button"
          className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-raised-hover"
          onClick={() => setAsking(true)}
        >
          <MessageCircleQuestion size={12} />
          <span className="text-xs">{t('clarify.ask')}</span>
        </button>
      ) : (
        <>
          <input
            ref={inputRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); submit() }
              if (e.key === 'Escape') { e.preventDefault(); dismiss() }
            }}
            placeholder={t('clarify.askPlaceholder')}
            className="w-64 px-2 py-1 text-xs bg-input border border-input-line rounded text-input-fg placeholder-input-ph"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!question.trim()}
            className="px-2 py-1 text-xs rounded bg-btn text-btn-fg hover:bg-btn-hover disabled:opacity-40"
          >
            {t('clarify.submit')}
          </button>
        </>
      )}
    </div>
  )
}

/**
 * Which copy of the selected passage this is, counting from one.
 *
 * Whoever answers has only the text to go on, so a card that says the same
 * thing twice would otherwise be ambiguous.
 */
export function occurrenceOf(container: HTMLElement, range: Range, quote: string): number {
  const before = document.createRange()
  before.selectNodeContents(container)
  before.setEnd(range.startContainer, range.startOffset)
  const textBefore = before.toString().replace(/\s+/g, ' ')
  return countOf(textBefore, quote) + 1
}

function countOf(haystack: string, needle: string): number {
  if (!needle) return 0
  let count = 0
  let at = haystack.indexOf(needle)
  while (at !== -1) {
    count++
    at = haystack.indexOf(needle, at + needle.length)
  }
  return count
}
