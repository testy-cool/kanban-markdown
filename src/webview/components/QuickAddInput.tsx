import { useState, useRef, useEffect } from 'react'
import { Plus } from 'lucide-react'
import type { FeatureStatus, Priority } from '../../shared/types'
import { useStore } from '../store'
import { t } from '../lib/i18n'

interface QuickAddInputProps {
  status: FeatureStatus
  onAdd: (data: { status: FeatureStatus; priority: Priority; content: string }) => void
}

export function QuickAddInput({ status, onAdd }: QuickAddInputProps) {
  const { cardSettings } = useStore()
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleSubmit = () => {
    const title = value.trim()
    if (title) {
      // Build content with title as first # heading
      const content = `# ${title}`
      onAdd({
        status,
        priority: cardSettings.defaultPriority,
        content
      })
      setValue('')
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      setValue('')
      setIsEditing(false)
    }
  }

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="w-full flex items-center gap-1.5 px-2 py-1.5 text-sm text-fg-dim hover:text-fg hover:bg-hover rounded transition-colors"
      >
        <Plus size={14} />
        <span>{t('quickAdd.addFeature')}</span>
      </button>
    )
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleSubmit}
      onKeyDown={handleKeyDown}
      placeholder={t('quickAdd.featureTitle')}
      className="w-full px-2 py-1.5 text-sm bg-input border border-input-line rounded focus:outline-none text-input-fg placeholder-input-ph"
    />
  )
}
