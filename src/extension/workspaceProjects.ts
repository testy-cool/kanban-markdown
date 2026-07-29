import * as vscode from 'vscode'
import * as path from 'path'
import type { Project } from '../shared/projects'
import { resolveActiveProject } from '../shared/projects'

/**
 * Where the board lives, in a workspace that may hold more than one project.
 *
 * Everything that touches the board folder goes through here, so the panel, the
 * sidebar and the create command all agree on which project is showing. The
 * choice is kept in workspace state rather than settings, because it is where
 * you happen to be looking rather than how the board is configured.
 */

export const ACTIVE_PROJECT_KEY = 'kanbanmd.activeProject'

export function listProjects(): Project[] {
  const folders = vscode.workspace.workspaceFolders ?? []
  const config = vscode.workspace.getConfiguration('kanbanmd')
  const featuresDirectory = config.get<string>('featuresDirectory') || '.devtool/features'

  return folders.map(folder => ({
    name: folder.name,
    path: folder.uri.fsPath,
    boardDir: path.join(folder.uri.fsPath, featuresDirectory)
  }))
}

export function getActiveProject(state: vscode.Memento): Project | null {
  return resolveActiveProject(listProjects(), state.get<string>(ACTIVE_PROJECT_KEY))
}

export function getActiveBoardDir(state: vscode.Memento): string | null {
  return getActiveProject(state)?.boardDir ?? null
}

export async function setActiveProject(state: vscode.Memento, projectPath: string): Promise<void> {
  await state.update(ACTIVE_PROJECT_KEY, projectPath)
}
