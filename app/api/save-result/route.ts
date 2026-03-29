import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/app/lib/supabase-admin"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      eventId = null,
      opponent = awayTeam,
      competition = "",
      playedOn = new Date().toISOString().split("T")[0],
    } = body

    if (!homeTeam || !awayTeam) {
      return NextResponse.json(
        { error: "Missing team names" },
        { status: 400 }
      )
    }

    const resultId = crypto.randomUUID()

    const { error } = await supabaseAdmin.from("league_results").upsert({
      id: resultId,
      played_on: playedOn,
      event_id: eventId,
      opponent,
      home_team: homeTeam,
      away_team: awayTeam,
      home_score: Number(homeScore || 0),
      away_score: Number(awayScore || 0),
      competition,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unknown error" },
      { status: 500 }
    )
  }
}
