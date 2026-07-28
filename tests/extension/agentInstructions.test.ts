import { describe, it, expect } from 'vitest'
import { buildAgentInstructions, GENERATED_MARKER } from '../../src/extension/agentInstructions'
import type { KanbanColumn } from '../../src/shared/types'

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: 'backlog', name: 'Backlog', color: '#6b7280' },
  { id: 'todo', name: 'To Do', color: '#3b82f6' },
  { id: 'done', name: 'Done', color: '#22c55e' },
]

describe('buildAgentInstructions', () => {
  it('starts with the marker that says we generated it', () => {
    expect(buildAgentInstructions(DEFAULT_COLUMNS, '.kanban/features'))
      .toMatch(new RegExp(`^${GENERATED_MARKER}`))
  })

  it('names the configured folder rather than the default', () => {
    const out = buildAgentInstructions(DEFAULT_COLUMNS, '.kanban/features')
    expect(out).toContain('.kanban/features/')
    expect(out).not.toContain('.devtool')
  })

  it('lists every column with the id and the name it shows under', () => {
    const out = buildAgentInstructions(DEFAULT_COLUMNS, '.kanban/features')
    expect(out).toContain('| `backlog` | Backlog |')
    expect(out).toContain('| `todo` | To Do |')
    expect(out).toContain('| `done` | Done |')
  })

  it('follows renamed columns', () => {
    const renamed: KanbanColumn[] = [
      { id: 'backlog', name: 'Next', color: '#3b82f6' },
      { id: 'in-progress', name: 'Doing', color: '#f59e0b' },
      { id: 'done', name: 'Done', color: '#22c55e' },
    ]
    const out = buildAgentInstructions(renamed, '.kanban/features')
    expect(out).toContain('| `backlog` | Next |')
    expect(out).toContain('| `in-progress` | Doing |')
  })

  it('uses the first column as the status on the example card', () => {
    const out = buildAgentInstructions(DEFAULT_COLUMNS, '.kanban/features')
    expect(out).toContain('status: "backlog"')
  })

  it('falls back to the last column when none is called done', () => {
    const columns: KanbanColumn[] = [
      { id: 'open', name: 'Open', color: '#000' },
      { id: 'shipped', name: 'Shipped', color: '#000' },
    ]
    const out = buildAgentInstructions(columns, '.board')
    expect(out).toContain('.board/shipped/')
    expect(out).not.toContain('.board/done/')
  })

  it('documents every field the extension writes', () => {
    const out = buildAgentInstructions(DEFAULT_COLUMNS, '.kanban/features')
    for (const field of [
      'id', 'status', 'priority', 'assignee', 'epic', 'dueDate',
      'created', 'modified', 'completedAt', 'labels', 'order',
    ]) {
      expect(out).toContain(`\`${field}\``)
    }
  })

  it('survives a board with no columns configured', () => {
    const out = buildAgentInstructions([], '.kanban/features')
    expect(out).toContain('status: "backlog"')
    expect(out).toContain(GENERATED_MARKER)
  })
})
