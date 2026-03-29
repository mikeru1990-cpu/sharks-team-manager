import { NextResponse } from "next/server"
import { supabaseAdmin } from "../../lib/supabase-admin"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      playedOn,
      eventId = null,
      competition = "",
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      venue = "",
      notes = "",
      isFinal = true,
    } = body

    if (!homeTeam || !awayTeam) {
      return NextResponse.json({ error: "Missing team names" }, { status: 400 })
    }

    const payload = {
      id: crypto.randomUUID(),
      played_on: playedOn || new Date().toISOString().split("T")[0],
      event_id: eventId,
      competition,
      home_team: homeTeam,
      away_team: awayTeam,
      home_score: Number(homeScore || 0),
      away_score: Number(awayScore || 0),
      venue,
      notes,
      is_final: Boolean(isFinal),
    }

    const { error } = await supabaseAdmin.from("league_results").insert(payload)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, result: payload })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unknown error" },
      { status: 500 }
    )
  }
}
