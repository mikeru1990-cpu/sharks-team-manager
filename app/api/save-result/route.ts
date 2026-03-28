import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/app/lib/supabase-admin"

export async function POST(req: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin env vars are missing" },
        { status: 500 }
      )
    }

    const body = await req.json()

    const {
      playedOn,
      eventId,
      opponent,
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      competition,
    } = body

    const { data, error } = await supabaseAdmin
      .from("league_results")
      .upsert({
        id: body.id ?? crypto.randomUUID(),
        played_on: playedOn,
        event_id: eventId ?? null,
        opponent,
        home_team: homeTeam,
        away_team: awayTeam,
        home_score: homeScore,
        away_score: awayScore,
        competition: competition ?? "",
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, data })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
