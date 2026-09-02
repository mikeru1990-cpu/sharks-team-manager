import { privateJson, requireStaffRequest } from "../../lib/apiAuth"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const auth = await requireStaffRequest(request)
  if (!auth.ok) return auth.response

  try {
    const body = await request.json()
    const playedOn = typeof body.playedOn === "string" ? body.playedOn : ""
    const eventId = typeof body.eventId === "string" ? body.eventId : null
    const competition = typeof body.competition === "string" ? body.competition.slice(0, 160) : ""
    const homeTeam = typeof body.homeTeam === "string" ? body.homeTeam.trim().slice(0, 160) : ""
    const awayTeam = typeof body.awayTeam === "string" ? body.awayTeam.trim().slice(0, 160) : ""
    const venue = typeof body.venue === "string" ? body.venue.slice(0, 240) : ""
    const notes = typeof body.notes === "string" ? body.notes.slice(0, 2000) : ""
    const homeScore = Number(body.homeScore)
    const awayScore = Number(body.awayScore)

    if (!playedOn || !homeTeam || !awayTeam) {
      return privateJson({ error: "Date, home team and away team are required" }, { status: 400 })
    }

    if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore) || homeScore < 0 || awayScore < 0 || homeScore > 99 || awayScore > 99) {
      return privateJson({ error: "Scores must be whole numbers between 0 and 99" }, { status: 400 })
    }

    const payload = {
      played_on: playedOn,
      event_id: eventId,
      competition,
      home_team: homeTeam,
      away_team: awayTeam,
      home_score: homeScore,
      away_score: awayScore,
      venue,
      notes,
      is_final: Boolean(body.isFinal),
      opponent: awayTeam,
    }

    const { data, error } = await auth.admin
      .from("league_results")
      .upsert(payload)
      .select()

    if (error) {
      return privateJson({ error: "Unable to save result" }, { status: 500 })
    }

    return privateJson({ success: true, data })
  } catch {
    return privateJson({ error: "Invalid result request" }, { status: 400 })
  }
}
