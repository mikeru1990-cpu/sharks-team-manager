export type ClubRole = "club_admin" | "team_admin" | "coach" | "parent" | "player"

export type TeamIdentity = {
  id: string
  name: string
  ageGroup?: string
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
