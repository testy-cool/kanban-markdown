import type { Priority } from '../../shared/types'
import { t } from '../lib/i18n'
import { Select } from './Select'

interface PrioritySelectProps {
  value: Priority
  onChange: (priority: Priority) => void
  className?: string
}

function getPriorities() {
  return [
    { value: 'critical', label: t('priority.critical'), dotClassName: 'bg-chart-red' },
    { value: 'high', label: t('priority.high'), dotClassName: 'bg-chart-orange' },
    { value: 'medium', label: t('priority.medium'), dotClassName: 'bg-chart-yellow' },
    { value: 'low', label: t('priority.low'), dotClassName: 'bg-chart-green' }
  ]
}

export function PrioritySelect({ value, onChange, className = '' }: PrioritySelectProps) {
  return (
    <Select
      value={value}
      options={getPriorities()}
      onChange={(v) => onChange(v as Priority)}
      className={className}
    />
  )
}
