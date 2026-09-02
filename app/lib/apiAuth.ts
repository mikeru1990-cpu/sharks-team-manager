import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "./supabase-admin"

const clubStaffRoles = ["owner", "club_admin", "coach", "assistant_coach"]
const teamStaffRoles = ["manager", "coach", "assistant_coach"]

export async function requireStaffRequest(request: Request) {
  const admin = getSupabaseAdmin()

  if (!admin) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Server authentication is not configured" },
        { status: 503 },
      ),
    }
  }

  const authorization = request.headers.get("authorization") ?? ""
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : ""

  if (!token) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Authentication required" }, { status: 401 }),
    }
  }

  const { data: authData, error: authError } = await admin.auth.getUser(token)
  const user = authData.user

  if (authError || !user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Invalid or expired session" }, { status: 401 }),
    }
  }

  const [{ data: clubMemberships, error: clubError }, { data: teamMemberships, error: teamError }] = await Promise.all([
    admin
      .from("club_memberships")
      .select("role")
      .eq("user_id", user.id)
      .in("role", clubStaffRoles)
      .limit(1),
    admin
      .from("team_memberships")
      .select("role")
      .eq("user_id", user.id)
      .in("role", teamStaffRoles)
      .limit(1),
  ])

  if (clubError || teamError) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unable to verify staff access" }, { status: 500 }),
    }
  }

  if ((clubMemberships?.length ?? 0) === 0 && (teamMemberships?.length ?? 0) === 0) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Staff access required" }, { status: 403 }),
    }
  }

  return { ok: true as const, admin, user }
}

export function privateJson(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers)
  headers.set("Cache-Control", "private, no-store, max-age=0")
  headers.set("Pragma", "no-cache")
  return NextResponse.json(data, { ...init, headers })
}
