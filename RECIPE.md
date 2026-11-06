# Recipe: Compact branch status tree

Build a sidebar mod for Herdr's standard layout. Keep repository worktrees nested under their main checkout, with one machine header per host. Preserve the Spaces mod's selection, context menu, drag ordering, narrow rail and machine controls.

Use compact 35-pixel rows, colored square project avatars and a small yellow dot for uncommitted work. Put a Git status icon to the left of each nested branch. Keep long names truncated and expose details in tooltips. Use yellow for changes and work in progress, green for staged/approved/done states, purple for merged states, red for conflicts/behind/closed states, and the theme's dim color for neutral or unknown states.

Get Git state from `git --no-optional-locks -c core.fsmonitor=false status --porcelain=v2 --branch`. Track staged, unstaged, untracked and unmerged entries separately. Read the worktree's MERGE_HEAD to recognize an active merge. Resolve the common Git directory to group linked worktrees. Recognize merged branches only from a matching merged PR or an ancestry check against locally recorded origin/HEAD; do not fetch automatically.

Get PR state from authenticated GitHub CLI queries for the current branch. Distinguish draft, open, approved, closed and merged PRs. Closed or merged records must match the current HEAD commit. Keep Git and PR refreshes independent so a network query does not block local status. Show query failures as unknown, with the error in a tooltip.

Use Herdr's actual working/done state for agent indicators. Do not invent task completion from Git state. Refresh Git about every 10 seconds while active, on Git folder events and after task transitions; query PRs at most once per minute for an unchanged branch and commit.

Package as `mods/branch-status/` with `main.js`, `status.js`, `mod.json` and SVG icons. Use the standard workspace-chrome icons and menu mod already provided by Herdr. Include a sidebar-only preview and installation instructions that replace just the Spaces mod reference in the user's chosen layout.
