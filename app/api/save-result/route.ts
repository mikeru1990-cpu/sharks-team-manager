import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "../../lib/supabase-admin"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Missing Supabase admin environment variables" },
        { status: 500 }
      )
    }

    const body = await req.json()

    const {
      playedOn,
      eventId,
      competition,
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      venue,
      notes,
      isFinal,
    } = body

    const payload = {
      played_on: playedOn,
      event_id: eventId || null,
      competition: competition || "",
      home_team: homeTeam,
      away_team: awayTeam,
      home_score: Number(homeScore ?? 0),
      away_score: Number(awayScore ?? 0),
      venue: venue || "",
      notes: notes || "",
      is_final: Boolean(isFinal),
      opponent: awayTeam || "",
    }

    const { data, error } = await supabaseAdmin
      .from("league_results")
      .upsert(payload)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error"

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
