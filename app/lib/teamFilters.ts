export type TeamScopedItem = {
  teamId?: string | null
}

export function isAllTeamsView(activeTeamId?: string | null) {
  return !activeTeamId || activeTeamId === "all"
}

export function filterByActiveTeam<T extends TeamScopedItem>(items: T[] = [], activeTeamId?: string | null) {
  if (isAllTeamsView(activeTeamId)) return items
  return items.filter((item) => item.teamId === activeTeamId)
}

export function getTeamWorkspaceLabel(activeTeamId?: string | null) {
  return isAllTeamsView(activeTeamId) ? "Club-wide view" : "Team workspace"
}
