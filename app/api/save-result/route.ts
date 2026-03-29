import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/app/lib/supabase-admin"

export async function POST(req: Request) {
  const body = await req.json()

  const {
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
  } = body

  // 1. Save match result
  await supabaseAdmin.from("league_results").insert({
    home_team: homeTeam,
    away_team: awayTeam,
    home_score: homeScore,
    away_score: awayScore,
  })

  // 2. Update BOTH teams
  await updateTeam(homeTeam, homeScore, awayScore)
  await updateTeam(awayTeam, awayScore, homeScore)

  return NextResponse.json({ success: true })
}

async function updateTeam(team: string, goalsFor: number, goalsAgainst: number) {
  const { data: existing } = await supabaseAdmin
    .from("league_table")
    .select("*")
    .eq("team", team)
    .single()

  let wins = 0
  let draws = 0
  let losses = 0
  let points = 0

  if (goalsFor > goalsAgainst) {
    wins = 1
    points = 3
  } else if (goalsFor === goalsAgainst) {
    draws = 1
    points = 1
  } else {
    losses = 1
  }

  if (!existing) {
    await supabaseAdmin.from("league_table").insert({
      team,
      played: 1,
      wins,
      draws,
      losses,
      goals_for: goalsFor,
      goals_against: goalsAgainst,
      points,
    })
  } else {
    await supabaseAdmin
      .from("league_table")
      .update({
        played: existing.played + 1,
        wins: existing.wins + wins,
        draws: existing.draws + draws,
        losses: existing.losses + losses,
        goals_for: existing.goals_for + goalsFor,
        goals_against: existing.goals_against + goalsAgainst,
        points: existing.points + points,
      })
      .eq("team", team)
  }
}
