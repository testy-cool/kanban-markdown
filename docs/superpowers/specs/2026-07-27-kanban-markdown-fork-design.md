# Fork of kanban-markdown, design

Date: 2026-07-27

## The point

Make the board follow the running VS Code theme, and stop loading the card
editor before anyone opens a card. Everything else here serves those two
things.

## Where it came from

Forked from `LachyFS/kanban-markdown-vscode-extension` at version 1.14.1, MIT
licensed. Full git history kept so `git blame` still answers questions. The
upstream remote is removed and we never merge from it again, because the colour
rewrite touches nearly every webview file and any future merge would conflict on
almost all of them.

The `LICENSE` file stays as it is. The README says where the code came from.

## What the board is actually used for

Measured on `~/Work/dpf-faq-generator`, which is the only board in use today.

- Seven cards, 16 KB in total, in `.kanban/features/`. The `done` folder is
  empty. The board was created on 2026-07-27.
- Cards are long documents, not short notes. The largest is 6 KB and holds
  fenced code blocks of scraped text.
- Agents write into the cards, so the file format has to stay plain markdown
  with YAML frontmatter.
- Assignee, epic and due date are switched off in VS Code settings. Columns are
  renamed to Next, Doing and Review.

At seven cards, the extension reloading every card file on every change costs
nothing. That is not the performance problem and we leave it alone.

## The performance problem

Measured from the production build's source map.

```
prosemirror + tiptap + markdown-it + entities + linkifyjs   ~1144 KB   72%
src/ (the board itself)                                       138 KB    9%
everything else                                               302 KB   19%
```

The shipped chunk is 584 KB minified, 197 KB gzipped, and it all loads when the
board opens. The editor is three quarters of it and is not needed until someone
clicks into a card.

Note that these percentages come from unminified source sizes, so they only
approximate the shipped split.

## Part 1, identity

Repo at `~/Work/kanban-markdown`, public, on GitHub as `testy-cool/kanban-markdown`.

Extension id becomes `testycool.kanban-markdown`. That renames all seventeen
setting keys, so `kanban-markdown.featuresDirectory` and the rest change
prefix. The replacement list gets written out and the existing VS Code user
settings get updated in the same step, otherwise the board loses its
configuration silently.

Shipping is a local `.vsix` install for now. No marketplace listing. The release
workflow that upstream wrote is kept but stays unused, because it needs
`VSCE_PAT` and `OVSX_PAT` secrets that do not exist.

If a marketplace listing ever happens, two things must change first. The icon at
`resources/icon.png` is upstream's and cannot ship under our name. The display
name "Kanban Markdown" would collide with upstream's listing and needs to become
distinct.

## Part 2, follow the theme

The card editor already uses VS Code colour variables. The board around it does
not. Cards, columns, toolbar and dialogs are painted with about 250 hardcoded
Tailwind greys, and the only thing deciding between the light set and the dark
set is this check in `src/webview/App.tsx`.

```
const isDark = document.body.classList.contains('vscode-dark')
```

So the board can tell dark from light and nothing else. Under Gruvbox, or any
theme that is not close to the VS Code defaults, it looks like a different
application.

The fix is to name the colours once in `tailwind.config.js`, pointing each name
at a VS Code variable, then replace the hardcoded classes with the names. So
`bg-zinc-800` becomes `bg-surface`, and `surface` is defined as
`var(--vscode-editorWidget-background)`. Later changes then happen in one file.

Starting map, to be adjusted once we see it running.

| Name in Tailwind | VS Code variable |
| --- | --- |
| `surface` | `--vscode-editorWidget-background` |
| `surface-border` | `--vscode-widget-border` |
| `column` | `--vscode-sideBar-background` |
| `fg` | `--vscode-foreground` |
| `fg-muted` | `--vscode-descriptionForeground` |
| `hover` | `--vscode-list-hoverBackground` |
| `selected` | `--vscode-list-activeSelectionBackground` |
| `input` | `--vscode-input-background` |
| `button` | `--vscode-button-background` |

Once the names are in place, the `dark` class and every `dark:` variant get
deleted. There is no longer a light mode and a dark mode, there is only the
theme that is running. That also removes about half the classes on each element,
which is why `style.css` should shrink from its current 47.8 KB.

Priority and label colours stay as fixed colours rather than theme variables,
because red for critical only carries meaning if it is red. They get toned so
they do not glare against a dark background.

The first component converted is the card. It gets built and screenshotted under
Gruvbox and shown for approval before the remaining components are converted. If
the palette is wrong, it is wrong in one file and gets corrected once.

## Part 3, load the editor only when a card opens

The TipTap editor moves behind a dynamic import so it becomes its own chunk. The
board loads without it. Opening a card loads it once and it stays cached for the
session. A loading placeholder covers the gap.

Expected result is the initial payload falling from 584 KB to roughly 200 KB.
That figure is an estimate from source proportions and gets replaced by a
measured number after the build.

`tailwind-merge` is 72 KB and exists to reconcile conflicting Tailwind classes.
Part 2 removes most of the conflicts. If nothing still needs it after the
rewrite, it goes.

## Part 4, delete what is unused

- The Spanish and Portuguese translations and the `l10n` layer around them.
  English only.
- The epic board mode, meaning `KanbanEpicBoard.tsx` and its supporting files.
  It is unreachable with epics switched off.
- The assignee and due date inputs.

The frontmatter fields stay. Existing cards carry `assignee: null`, `epic: null`
and `dueDate: null`, and removing an input is not the same as removing the data.
No file on disk changes.

The "Build with AI" button stays until we know whether it is used.

## Part 5, checking the work

The Vitest suite passes today and has to keep passing after every part. It runs
before each commit. Deleting the epic board and the translations will delete
their tests too, which is expected, and the remaining tests still have to pass.

Nothing here has an automated check for whether it looks right. That check is a
screenshot under Gruvbox, once after the first converted card and once at the
end.

One commit per part, in the order above, so part 3 can be dropped without losing
part 2.

## Order

1. Identity, rename, settings migration.
2. Theme, card first and approved, then the rest.
3. Editor code split, with a measured before and after.
4. Deletions.

## Open questions

None blocking. The extension name can still change cheaply until part 1 is
committed.
