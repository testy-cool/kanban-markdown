import { describe, it, expect } from 'vitest'
import { projectColor, projectColorVar, resolveActiveProject, PROJECT_COLORS } from '../../src/shared/projects'
import type { Project } from '../../src/shared/projects'

const project = (name: string): Project => ({ name, path: `/work/${name}`, boardDir: `/work/${name}/.kanban` })

describe('projectColor', () => {
  it('gives the same project the same colour every time', () => {
    expect(projectColor('dpf-faq-generator')).toBe(projectColor('dpf-faq-generator'))
  })

  it('only ever returns a colour from the palette', () => {
    const names = ['a', 'scraper', 'dpf-faq-generator', 'kanban-markdown', 'x'.repeat(200), '']
    for (const name of names) {
      expect(PROJECT_COLORS).toContain(projectColor(name))
    }
  })

  it('separates the projects actually in this workspace', () => {
    const names = ['dpf-faq-generator', 'dpf-store-policy-scraper', 'kanban-markdown']
    expect(new Set(names.map(projectColor)).size).toBe(names.length)
  })

  it('builds a theme variable with a fallback, so an unset palette still paints', () => {
    const value = projectColorVar('scraper')
    expect(value).toMatch(/^var\(--vscode-charts-\w+, #[0-9a-f]{6}\)$/)
  })
})

describe('resolveActiveProject', () => {
  it('picks the saved project when it is still in the workspace', () => {
    const projects = [project('one'), project('two')]
    expect(resolveActiveProject(projects, '/work/two')?.name).toBe('two')
  })

  it('falls back to the first when the saved folder has been removed', () => {
    const projects = [project('one'), project('two')]
    expect(resolveActiveProject(projects, '/work/gone')?.name).toBe('one')
  })

  it('falls back to the first when nothing was ever saved', () => {
    expect(resolveActiveProject([project('one')], undefined)?.name).toBe('one')
  })

  it('has nothing to give when the window has no folder open', () => {
    expect(resolveActiveProject([], '/work/one')).toBeNull()
  })
})
