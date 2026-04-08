import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "../../lib/supabase-admin"

export const dynamic = "force-dynamic"

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin()

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Missing Supabase admin environment variables" },
      { status: 500 }
    )
  }

  const { data, error } = await supabaseAdmin
    .from("league_results")
    .select("*")
    .order("played_on", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}
