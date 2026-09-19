import { privateJson, requireStaffRequest } from "../../lib/apiAuth"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const auth = await requireStaffRequest(request)
  if (!auth.ok) return auth.response

  const { data, error } = await auth.admin
    .from("league_results")
    .select("*")
    .order("played_on", { ascending: false })

  if (error) {
    return privateJson({ error: "Unable to load private league results" }, { status: 500 })
  }

  return privateJson(data ?? [])
}
