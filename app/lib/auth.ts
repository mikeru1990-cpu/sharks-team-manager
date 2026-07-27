import type { User } from "@supabase/supabase-js"
import { supabase } from "./supabase"

export type ClubRole =
  | "owner"
  | "club_admin"
  | "coach"
  | "assistant_coach"
  | "parent"
  | "viewer"

export type ClubMembership = {
  clubId: string
  clubName: string
  role: ClubRole
}

export type AuthContext = {
  user: User
  memberships: ClubMembership[]
  activeMembership: ClubMembership | null
  isAdmin: boolean
}

export async function loadAuthContext(user: User): Promise<AuthContext> {
  if (!supabase) {
    return {
      user,
      memberships: [],
      activeMembership: null,
      isAdmin: false,
    }
  }

  const { data, error } = await supabase
    .from("club_memberships")
    .select("club_id, role, clubs(name)")
    .eq("user_id", user.id)

  if (error) {
    throw new Error(`Unable to load club access: ${error.message}`)
  }

  const memberships: ClubMembership[] = (data ?? []).map((membership) => {
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
  const isAdmin = memberships.some(
    (membership) => membership.role === "owner" || membership.role === "club_admin",
  )

  return {
    user,
    memberships,
    activeMembership,
    isAdmin,
  }
}
