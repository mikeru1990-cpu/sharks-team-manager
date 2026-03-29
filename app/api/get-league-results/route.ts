import { NextResponse } from "next/server"
import { supabaseAdmin } from "../../lib/supabase-admin"

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("league_results")
    .select("*")
    .order("played_on", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}
