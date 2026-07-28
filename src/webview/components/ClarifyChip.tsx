import { GitCompareArrows, Loader, MessageCircleQuestion, X } from 'lucide-react'
import type { CardClarifications } from '../../shared/types'
import { headlineClarification, countByStatus } from '../../shared/clarifications'
import { t } from '../lib/i18n'

/**
 * Shows what was asked about a card and where that question got to.
 *
 * The question itself is on the chip rather than behind a hover, because the
 * point of it is not having to remember what you asked.
 */

interface ClarifyChipProps {
  clarifications: CardClarifications | null
  /** Offered only where there is room to act on it, so not on a small card. */
  onCompare?: (clarificationId: string) => void
  onDismiss?: (clarificationId: string) => void
}

export function ClarifyChip({ clarifications, onCompare, onDismiss }: ClarifyChipProps) {
  const headline = headlineClarification(clarifications)
  if (!headline) return null

  const counts = countByStatus(clarifications)
  const others = (clarifications?.requests.length ?? 0) - 1

  const label =
    headline.status === 'answered' ? t('clarify.answered')
    : headline.status === 'working' ? t('clarify.working')
    : t('clarify.pending')

  const Icon =
    headline.status === 'answered' ? MessageCircleQuestion
    : headline.status === 'working' ? Loader
    : MessageCircleQuestion

  const tone =
    headline.status === 'answered' ? 'text-chart-green'
    : headline.status === 'working' ? 'text-chart-blue'
    : 'text-chart-yellow'

  return (
    <div
      className="clarify-chip"
      data-status={headline.status}
      data-testid="clarify-chip"
    >
      <Icon
        size={12}
        className={`shrink-0 ${tone} ${headline.status === 'working' ? 'animate-spin' : ''}`}
      />
      <span className={`shrink-0 font-medium ${tone}`}>{label}</span>
      <span className="clarify-question" title={headline.question}>
        {headline.question}
      </span>
      {others > 0 && (
        <span className="shrink-0 text-fg-dim" title={`${counts.pending} pending, ${counts.working} in progress, ${counts.answered} answered`}>
          +{others}
        </span>
      )}
      {onCompare && headline.status === 'answered' && headline.snapshotPath && (
        <button
          type="button"
          className="shrink-0 hover:text-fg"
          title={t('clarify.compare')}
          onClick={(e) => { e.stopPropagation(); onCompare(headline.id) }}
        >
          <GitCompareArrows size={12} />
        </button>
      )}
      {onDismiss && (
        <button
          type="button"
          className="shrink-0 hover:text-chart-red"
          title={t('clarify.dismiss')}
          onClick={(e) => { e.stopPropagation(); onDismiss(headline.id) }}
        >
          <X size={11} />
        </button>
      )}
    </div>
  )
}
