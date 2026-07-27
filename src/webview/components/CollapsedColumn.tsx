import type { KanbanColumn as KanbanColumnType } from '../../shared/types'
import type { LayoutMode } from '../store'

interface CollapsedColumnProps {
  column: KanbanColumnType
  featureCount: number
  onExpand: () => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, status: string) => void
  layout: LayoutMode
}

export function CollapsedColumn({
  column,
  featureCount,
  onExpand,
  onDragOver,
  onDrop,
  layout
}: CollapsedColumnProps) {
  const isVertical = layout === 'vertical'

  if (isVertical) {
    return (
      <button
        onClick={onExpand}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, column.id)}
        className="flex items-center gap-2 px-3 py-2 bg-column rounded hover:bg-hover transition-colors cursor-pointer"
      >
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: column.color }} />
        <span className="text-sm font-medium text-fg-strong">{column.name}</span>
        <span className="text-xs text-badge-fg bg-badge px-1.5 py-0.5 rounded-full">
          {featureCount}
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={onExpand}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, column.id)}
      className="flex-shrink-0 w-10 h-full flex flex-col items-center bg-column rounded hover:bg-hover transition-colors cursor-pointer py-3 gap-3"
    >
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: column.color }} />
      <span className="text-xs text-badge-fg bg-badge px-1.5 py-0.5 rounded-full">
        {featureCount}
      </span>
      <span
        className="text-sm font-medium text-fg-strong"
        style={{ writingMode: 'vertical-rl' }}
      >
        {column.name}
      </span>
    </button>
  )
}
