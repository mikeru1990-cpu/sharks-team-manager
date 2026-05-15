"use client"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts"

import type {
  LeagueResult,
  PlayerMatchRating,
  Player,
} from "../../lib/types"

import PageCard from "../ui/PageCard"
import SectionHeader from "../ui/SectionHeader"

type Props = {
  results: LeagueResult[]
  ratings: PlayerMatchRating[]
  players: Player[]
  teamName: string
}

function buildGoalsData(
  results: LeagueResult[],
  teamName: string
) {
  return results
    .slice()
    .sort((a, b) => a.playedOn.localeCompare(b.playedOn))
    .map((r) => {
      const isHome = r.homeTeam === teamName

      return {
        date: r.playedOn.slice(5),
        goalsFor: isHome
          ? r.homeScore
          : r.awayScore,
        goalsAgainst: isHome
          ? r.awayScore
          : r.homeScore,
      }
    })
}

function buildPlayerRatings(
  ratings: PlayerMatchRating[],
  players: Player[]
) {
  const grouped: Record<
    string,
    {
      total: number
      count: number
    }
  > = {}

  ratings.forEach((r) => {
    if (!grouped[r.playerId]) {
      grouped[r.playerId] = {
        total: 0,
        count: 0,
      }
    }

    grouped[r.playerId].total += r.rating
    grouped[r.playerId].count++
  })

  return Object.entries(grouped)
    .map(([playerId, data]) => {
      const player = players.find(
        (p) => p.id === playerId
      )

      return {
        player:
          player?.name || "Unknown",
        rating:
          Number(
            (data.total / data.count).toFixed(1)
          ),
      }
    })
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10)
}

export default function AnalyticsCharts({
  results,
  ratings,
  players,
  teamName,
}: Props) {
  const goalsData = buildGoalsData(
    results,
    teamName
  )

  const playerRatings = buildPlayerRatings(
    ratings,
    players
  )

  return (
    <div className="grid gap-6">
      <PageCard>
        <SectionHeader
          title="Goals Trend"
          subtitle="Goals for vs goals against"
        />

        <div className="w-full h-80">
          <ResponsiveContainer>
            <LineChart data={goalsData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="goalsFor"
                stroke="#16a34a"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="goalsAgainst"
                stroke="#dc2626"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </PageCard>

      <PageCard>
        <SectionHeader
          title="Top Player Ratings"
          subtitle="Average match ratings"
        />

        <div className="w-full h-96">
          <ResponsiveContainer>
            <BarChart data={playerRatings}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="player" />

              <YAxis domain={[0, 10]} />

              <Tooltip />

              <Bar
                dataKey="rating"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PageCard>
    </div>
  )
}
