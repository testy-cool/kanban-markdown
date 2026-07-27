import { ChevronDown } from 'lucide-react'
import type { Priority } from '../../shared/types'
import { t } from '../lib/i18n'

interface PrioritySelectProps {
  value: Priority
  onChange: (priority: Priority) => void
  className?: string
}

function getPriorities(): { value: Priority; label: string; color: string }[] {
  return [
    { value: 'critical', label: t('priority.critical'), color: 'bg-chart-red' },
    { value: 'high', label: t('priority.high'), color: 'bg-chart-orange' },
    { value: 'medium', label: t('priority.medium'), color: 'bg-chart-yellow' },
    { value: 'low', label: t('priority.low'), color: 'bg-chart-green' }
  ]
}

export function PrioritySelect({ value, onChange, className = '' }: PrioritySelectProps) {
  const priorities = getPriorities()
  const current = priorities.find((p) => p.value === value) || priorities[2]

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Priority)}
        className="appearance-none w-full bg-input border border-input-line rounded focus:outline-none text-input-fg px-3 py-2 pr-8 text-sm cursor-pointer"
      >
        {priorities.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
        <div className={`w-2 h-2 rounded-full ${current.color}`} />
        <ChevronDown size={14} className="text-fg-dim" />
      </div>
    </div>
  )
}
