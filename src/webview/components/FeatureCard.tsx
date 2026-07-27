import { Calendar, Check, FileText, Layers } from 'lucide-react'
import { getTitleFromContent } from '../../shared/types'
import type { Feature, Priority } from '../../shared/types'
import { epicThemeFromName } from '../../shared/epicColor'
import { renderInlineMarkdown, excerptFromContent } from '../lib/inlineMarkdown'
import { useStore } from '../store'
import { t } from '../lib/i18n'

interface FeatureCardProps {
  feature: Feature
  onClick: () => void
  isDragging?: boolean
}

const priorityColors: Record<Priority, string> = {
  critical: 'badge-priority badge-critical',
  high: 'badge-priority badge-high',
  medium: 'badge-priority badge-medium',
  low: 'badge-priority badge-low'
}

function getPriorityLabels(): Record<Priority, string> {
  return {
    critical: t('priority.critical'),
    high: t('priority.high'),
    medium: t('priority.mediumShort'),
    low: t('priority.low')
  }
}

export function FeatureCard({ feature, onClick, isDragging }: FeatureCardProps) {
  const { cardSettings, locale, isDarkMode } = useStore()
  const priorityLabels = getPriorityLabels()
  const title = getTitleFromContent(feature.content)
  const description = excerptFromContent(feature.content)
  const fileName = feature.filePath ? feature.filePath.split(/[/\\]/).pop() || '' : ''

  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (days < 0) return { text: t('card.overdue'), className: 'text-chart-red' }
    if (days === 0) return { text: t('card.today'), className: 'text-chart-orange' }
    if (days === 1) return { text: t('card.tomorrow'), className: 'text-chart-yellow' }
    if (days <= 7) return { text: t('card.daysShort', { days }), className: 'text-fg-dim' }

    return {
      text: date.toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
      className: 'text-fg-dim'
    }
  }

  const dueInfo = feature.status === 'done' ? null : formatDueDate(feature.dueDate)

  const formatCompletedAt = (dateStr: string | null) => {
    if (!dateStr) return null
    const completed = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - completed.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return t('card.justNow')
    if (diffMins < 60) return t('card.minutesAgo', { count: diffMins })
    if (diffHours < 24) return t('card.hoursAgo', { count: diffHours })
    if (diffDays === 1) return t('card.oneDayAgo')
    if (diffDays < 30) return t('card.daysAgo', { count: diffDays })
    if (diffDays < 365) return t('card.monthsAgo', { count: Math.floor(diffDays / 30) })
    return t('card.yearsAgo', { count: Math.floor(diffDays / 365) })
  }

  const completedText = feature.status === 'done' ? formatCompletedAt(feature.completedAt) : null

  const epicTrimmed = feature.epic?.trim()
  const epicTheme = epicTrimmed ? epicThemeFromName(epicTrimmed, isDarkMode) : null

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col bg-card rounded border border-line ${cardSettings.compactMode ? 'p-2 min-h-[4.5rem]' : 'p-3 min-h-[7rem]'} cursor-pointer hover:bg-hover ${
        isDragging ? 'shadow-lg opacity-90' : ''
      }`}
    >
      {/* Title & Content */}
      <div className="flex-1">
        {/* File Name + Priority badge row (when fileName enabled) */}
        {cardSettings.showFileName && fileName && (
          <div className="flex items-center gap-1.5 mb-1">
            <FileText size={10} className="shrink-0 text-fg-dim" />
            <span className="text-[10px] font-mono text-fg-dim truncate flex-1">
              {fileName}
            </span>
            {cardSettings.showPriorityBadges && (
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${priorityColors[feature.priority]}`}
              >
                {priorityLabels[feature.priority]}
              </span>
            )}
          </div>
        )}

        <div className={`flex items-start gap-2 ${description ? 'mb-1' : cardSettings.compactMode ? 'mb-1' : 'mb-2'}`}>
          <h3 className="card-title font-medium text-fg-strong line-clamp-2 flex-1">
            {title}
          </h3>
          {cardSettings.showPriorityBadges && !(cardSettings.showFileName && fileName) && (
            <span
              className={`text-xs font-medium px-1.5 py-0.5 rounded shrink-0 ${priorityColors[feature.priority]}`}
            >
              {priorityLabels[feature.priority]}
            </span>
          )}
        </div>

        {/* Description */}
        {description && !cardSettings.compactMode && cardSettings.cardExcerptLines > 0 && (
          <p
            className="excerpt text-fg-dim mb-2"
            style={{ WebkitLineClamp: cardSettings.cardExcerptLines }}
          >
            {renderInlineMarkdown(description)}
          </p>
        )}

        {/* Epic */}
        {cardSettings.showEpic && epicTrimmed && epicTheme && (
          <div className="flex items-center gap-1 mb-1.5 text-[10px]">
            <Layers size={10} className="shrink-0" style={{ color: epicTheme.foreground }} />
            <span className="truncate font-medium" style={{ color: epicTheme.foreground }}>
              {epicTrimmed}
            </span>
          </div>
        )}

        {/* Labels */}
        {cardSettings.showLabels && feature.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {feature.labels.slice(0, 3).map((label) => (
              <span
                key={label}
                className="tag text-xs"
              >
                {label}
              </span>
            ))}
            {feature.labels.length > 3 && (
              <span className="text-xs text-fg-dim">+{feature.labels.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs mt-auto">
        <div className="flex items-center gap-1">
          {cardSettings.showAssignee && feature.assignee && feature.assignee !== 'null' && (
            <div className="flex items-center gap-1.5 text-fg-dim">
              <span className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold bg-badge text-badge-fg">
                {feature.assignee.split(/\s+/).map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
              </span>
              <span>{feature.assignee}</span>
            </div>
          )}
        </div>
        {cardSettings.showDueDate && dueInfo && (
          <div className={`flex items-center gap-1 ${dueInfo.className}`}>
            <Calendar size={12} />
            <span>{dueInfo.text}</span>
          </div>
        )}
        {completedText && (
          <div className="flex items-center gap-1 text-fg-dim">
            <Check size={12} />
            <span>{completedText}</span>
          </div>
        )}
      </div>
    </div>
  )
}
