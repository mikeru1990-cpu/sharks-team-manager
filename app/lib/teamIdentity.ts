export type TeamAccessRole = "club_admin" | "team_admin" | "coach" | "parent" | "player"

export type TeamIdentity = {
  id: string
  name: string
  ageGroup?: string
  badgeUrl?: string
  wallpaperUrl?: string
  teamPhotoUrl?: string
  primaryColour?: string
  secondaryColour?: string
  canEdit?: boolean
}

export type TeamMembership = {
  id: string
  userId: string
  teamId: string
  role: TeamAccessRole
  active: boolean
}

export function canEditTeam(role?: TeamAccessRole) {
  return role === "club_admin" || role === "team_admin" || role === "coach"
}

export function canViewAllTeams(role?: TeamAccessRole) {
  return role === "club_admin"
}
