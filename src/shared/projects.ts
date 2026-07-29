/**
 * One board per workspace folder, and a colour per folder so you can tell at a
 * glance which board you are looking at.
 *
 * The colour is derived from the folder name rather than stored, so the same
 * project keeps the same colour on every machine and nothing has to be
 * configured. It comes out of VS Code's chart palette, so it belongs to the
 * running theme like everything else does.
 */

export interface Project {
  /** The workspace folder name, which is what the picker shows. */
  name: string
  /** Absolute path of the workspace folder. */
  path: string
  /** Absolute path of this project's board folder. */
  boardDir: string
}

/** Palette keys, in the order colours get handed out. */
export const PROJECT_COLORS = ['blue', 'green', 'purple', 'orange', 'red', 'yellow'] as const

export type ProjectColor = (typeof PROJECT_COLORS)[number]

/**
 * A stable colour for a project name.
 *
 * Two projects can collide on a colour when there are more than six of them.
 * That is accepted, because a colour is a hint next to the name rather than the
 * thing you read.
 */
export function projectColor(name: string): ProjectColor {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return PROJECT_COLORS[hash % PROJECT_COLORS.length]
}

/** The CSS variable that paints a project's colour, with a fallback. */
export function projectColorVar(name: string): string {
  const fallbacks: Record<ProjectColor, string> = {
    blue: '#3794ff',
    green: '#89d185',
    purple: '#b180d7',
    orange: '#d18616',
    red: '#f14c4c',
    yellow: '#cca700',
  }
  const color = projectColor(name)
  return `var(--vscode-charts-${color}, ${fallbacks[color]})`
}

/**
 * Which project a saved choice refers to, by path.
 *
 * Falls back to the first project, because a workspace folder can be removed
 * between sessions and an empty board would look like a broken one.
 */
export function resolveActiveProject(projects: Project[], savedPath: string | undefined): Project | null {
  if (projects.length === 0) return null
  return projects.find(p => p.path === savedPath) ?? projects[0]
}
