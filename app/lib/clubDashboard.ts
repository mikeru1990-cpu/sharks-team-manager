export type ClubDashboardStatus = "healthy" | "watch" | "concern"

export function getAvailabilityStatus(percent: number): ClubDashboardStatus {
  if (percent >= 75) return "healthy"
  if (percent >= 50) return "watch"
  return "concern"
}

export function getAvailabilityColour(percent: number) {
  const status = getAvailabilityStatus(percent)
  if (status === "healthy") return "#22c55e"
  if (status === "watch") return "#f59e0b"
  return "#ef4444"
}

export function getClubDashboardLabel(activeTeamId?: string | null) {
  return !activeTeamId || activeTeamId === "all" ? "Club Command Centre" : "Team Dashboard"
}
