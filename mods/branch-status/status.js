// Porcelain v2 keeps file names out of state decisions (including spaces/newlines).
export function parseStatus(text) {
  const g = { branch: null, oid: null, ahead: 0, behind: 0, modified: 0, staged: 0, untracked: 0, conflicts: 0 };
  for (const line of text.split("\n")) {
    if (line.startsWith("# branch.head ")) g.branch = line.slice(14).trim();
    else if (line.startsWith("# branch.oid ")) g.oid = line.slice(13).trim();
    else if (line.startsWith("# branch.ab ")) {
      const [a, b] = line.slice(12).split(" ");
      g.ahead = Math.abs(Number(a)) || 0;
      g.behind = Math.abs(Number(b)) || 0;
    } else if (line.startsWith("u ")) g.conflicts++;
    else if (line.startsWith("? ")) g.untracked++;
    else if (/^[12] /.test(line)) {
      if (line[2] !== ".") g.staged++;
      if (line[3] !== ".") g.modified++;
    }
  }
  g.dirty = Boolean(g.modified || g.staged || g.untracked || g.conflicts);
  return g;
}

export function selectPR(items, oid) {
  return items.find(p => p.state === "OPEN")
    ?? items.find(p => p.headRefOid === oid)
    ?? null;
}

export function gitState(g) {
  if (!g || g.unknown) return "unknown";
  if (g.conflicts) return "conflict";
  if (g.merging) return "merging";
  if (g.modified) return "modified";
  if (g.staged) return "staged";
  if (g.untracked) return "untracked";
  if (g.branch === "(detached)") return "detached";
  if (g.pr?.state === "MERGED" || g.merged) return "merged";
  if (g.ahead && g.behind) return "diverged";
  if (g.behind) return "behind";
  if (g.ahead) return "ahead";
  return "clean";
}

export function prState(p) {
  if (!p) return null;
  if (p.state === "MERGED") return "merged";
  if (p.state === "CLOSED") return "closed";
  if (p.isDraft) return "draft";
  return p.reviewDecision === "APPROVED" ? "approved" : "open";
}

export const COLORS = { changed: "#f2c94c", green: "#4cb782", merged: "#5e6ad2", red: "#eb5757" };
export function stateColor(state, muted) {
  if (["modified", "untracked", "ahead", "diverged", "merging", "detached", "open", "doing"].includes(state)) return COLORS.changed;
  if (["staged", "approved", "done"].includes(state)) return COLORS.green;
  if (state === "merged") return COLORS.merged;
  if (["behind", "conflict", "closed"].includes(state)) return COLORS.red;
  return muted;
}

export function describe(g) {
  if (!g || g.unknown) return "Git 状态未知";
  return [g.branch, g.merging ? "合并中" : null, g.merged ? "已合入默认分支" : null,
    `未暂存 ${g.modified} · 已暂存 ${g.staged} · 未跟踪 ${g.untracked} · 冲突 ${g.conflicts}`,
    `领先 ${g.ahead} · 落后 ${g.behind}`,
    g.pr ? `PR #${g.pr.number} · ${g.pr.title} · ${g.pr.state}${g.pr.isDraft ? " · draft" : ""}${g.pr.reviewDecision ? ` · ${g.pr.reviewDecision}` : ""}` : (g.prError ? `PR 状态未知：${g.prError}` : "无关联 PR")
  ].filter(Boolean).join("\n");
}
