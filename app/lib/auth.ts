import type { User } from "@supabase/supabase-js"
import { supabase } from "./supabase"

export type ClubRole =
  | "owner"
  | "club_admin"
  | "coach"
  | "assistant_coach"
  | "parent"
  | "viewer"

export type TeamRole =
  | "manager"
  | "coach"
  | "assistant_coach"
  | "parent"
  | "viewer"

export type ClubMembership = {
  clubId: string
  clubName: string
  role: ClubRole
}

export type TeamAccess = {
  teamId: string
  teamName: string
  ageGroup: string | null
  season: string | null
  clubId: string
  clubName: string
  role: TeamRole | "owner" | "club_admin"
  canManage: boolean
}

export type AuthContext = {
  user: User
  memberships: ClubMembership[]
  teams: TeamAccess[]
  activeMembership: ClubMembership | null
  isAdmin: boolean
}

function canManageRole(role: TeamAccess["role"]) {
  return role === "owner" ||
    role === "club_admin" ||
    role === "manager" ||
    role === "coach" ||
    role === "assistant_coach"
}

export async function loadAuthContext(user: User): Promise<AuthContext> {
  if (!supabase) {
    return {
      user,
      memberships: [],
      teams: [],
      activeMembership: null,
      isAdmin: false,
    }
  }

  const { data: clubData, error: clubError } = await supabase
    .from("club_memberships")
    .select("club_id, role, clubs(name)")
    .eq("user_id", user.id)

  if (clubError) {
    throw new Error(`Unable to load club access: ${clubError.message}`)
  }

  const memberships: ClubMembership[] = (clubData ?? []).map((membership) => {
    const club = Array.isArray(membership.clubs)
      ? membership.clubs[0]
      : membership.clubs

    return {
      clubId: membership.club_id,
      clubName: club?.name ?? "Football club",
      role: membership.role as ClubRole,
    }
  })

  const activeMembership = memberships[0] ?? null
  const adminMemberships = memberships.filter(
    (membership) => membership.role === "owner" || membership.role === "club_admin",
  )
  const isAdmin = adminMemberships.length > 0

  const { data: teamMembershipData, error: teamMembershipError } = await supabase
    .from("team_memberships")
    .select("team_id, role, teams(id,name,age_group,season,club_id,clubs(name))")
    .eq("user_id", user.id)

  if (teamMembershipError) {
    throw new Error(`Unable to load team access: ${teamMembershipError.message}`)
  }

  const teamMap = new Map<string, TeamAccess>()

  for (const membership of teamMembershipData ?? []) {
    const team = Array.isArray(membership.teams)
      ? membership.teams[0]
      : membership.teams
    if (!team?.id) continue

    const club = Array.isArray(team.clubs) ? team.clubs[0] : team.clubs
    const role = membership.role as TeamRole

    teamMap.set(team.id, {
      teamId: team.id,
      teamName: team.name ?? "Football team",
      ageGroup: team.age_group ?? null,
      season: team.season ?? null,
      clubId: team.club_id,
      clubName: club?.name ?? memberships.find((item) => item.clubId === team.club_id)?.clubName ?? "Football club",
      role,
      canManage: canManageRole(role),
    })
  }

  if (adminMemberships.length) {
    const adminClubIds = adminMemberships.map((membership) => membership.clubId)
    const { data: adminTeams, error: adminTeamsError } = await supabase
      .from("teams")
      .select("id,name,age_group,season,club_id,clubs(name)")
      .in("club_id", adminClubIds)
      .order("name", { ascending: true })

    if (adminTeamsError) {
      throw new Error(`Unable to load club teams: ${adminTeamsError.message}`)
    }

    for (const team of adminTeams ?? []) {
      if (teamMap.has(team.id)) continue
      const club = Array.isArray(team.clubs) ? team.clubs[0] : team.clubs
      const adminMembership = adminMemberships.find((membership) => membership.clubId === team.club_id)
      const role = adminMembership?.role === "owner" ? "owner" : "club_admin"

      teamMap.set(team.id, {
        teamId: team.id,
        teamName: team.name ?? "Football team",
        ageGroup: team.age_group ?? null,
        season: team.season ?? null,
        clubId: team.club_id,
        clubName: club?.name ?? adminMembership?.clubName ?? "Football club",
        role,
        canManage: true,
      })
    }
  }

  const teams = [...teamMap.values()].sort((a, b) =>
    a.teamName.localeCompare(b.teamName, "en-GB", { numeric: true }),
  )

  return {
    user,
    memberships,
    teams,
    activeMembership,
    isAdmin,
  }
}
