export type ClubRole = "club_admin" | "team_admin" | "coach" | "parent" | "player"

export type TeamSection = "boys" | "girls" | "mixed" | "senior" | "veterans"

export type TeamIdentity = {
  id: string
  name: string
  ageGroup?: string
  section?: TeamSection
  squadName?: string
  displayName?: string
  badgeUrl?: string
  wallpaperUrl?: string
  teamPhotoUrl?: string
  primaryColour?: string
  secondaryColour?: string
}

export type TeamMembership = {
  userId: string
  teamId: string
  role: ClubRole
  active: boolean
}

export function getTeamDisplayName(team: TeamIdentity) {
  if (team.displayName) return team.displayName

  const parts = [
    team.ageGroup,
    team.section ? team.section.charAt(0).toUpperCase() + team.section.slice(1) : undefined,
    team.squadName,
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(" ") : team.name
}

export function canViewAllTeams(role?: ClubRole) {
  return role === "club_admin"
}

export function canManageTeam(role?: ClubRole) {
  return role === "club_admin" || role === "team_admin" || role === "coach"
}

export function canEditTeamIdentity(role?: ClubRole) {
  return role === "club_admin" || role === "team_admin"
}

export function canViewClubTables(role?: ClubRole) {
  return Boolean(role)
}
