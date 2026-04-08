"use client"

import { useMemo } from "react"
import {
  TEAM,
  formatMinutes,
  type EventAttendance,
  type EventItem,
  type LeagueResult,
  type Player,
  type PlayerMatchRating,
} from "../../lib/types"
import {
  PageCard,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
} from "../ui"

type Props = {
  teamName: string
  players: Player[]
  events: EventItem[]
  attendance: EventAttendance[]
  results: LeagueResult[]
  ratings: PlayerMatchRating[]
  activeMatchEventId: string | null
  selectedDate: string
  onOpenTab: (tab: "events" | "match" | "players" | "stats") => void
}

type AlertRow = {
  id: string
  level: "danger" | "warning" | "info"
  text: string
}

function normalizeTeamName(name: string) {
  const value = name.trim()

  const map: Record<string, string> = {
    "U10 Lionesses 25/26": "Leonard Stanley U10 Lioness",
    "U10 Lionesses": "Leonard Stanley U10 Lioness",
    "Sharks Lioness": "Leonard Stanley U10 Lioness",
    "Sharks Lionesses": "Leonard Stanley U10 Lioness",
    "Leonard Stanley U10 Lionesses": "Leonard Stanley U10 Lioness",
    "Leonard Stanley U10 Lioness ": "Leonard Stanley U10 Lioness",

    "Tewkesbury Town Colts Youth U10": "Tewkesbury Town Colts",
    "Tewkesbury Town Colts Youth": "Tewkesbury Town Colts",
    "Tewkesbury Town Colts Youth U10 ": "Tewkesbury Town Colts",

    "Stonehouse TownYouth U10": "Stonehouse Town",
    "Stonehouse Town Youth U10": "Stonehouse Town",
    "Stonehouse Town Youth": "Stonehouse Town",

    "Rodborough Youth U10 Lioness": "Rodborough Lionesses",
    "Rodborough Youth U10 Lionesses": "Rodborough Lionesses",
    "Rodborough Youth U10 Lionesses ": "Rodborough Lionesses",
  }

  return map[value] || value
}

function alertStyle(level: AlertRow["level"]) {
  if (level === "danger") {
    return {
      background: "#fee2e2",
      border: "1px solid #fecaca",
      color: "#991b1b",
    }
  }

  if (level === "warning") {
    return {
      background: "#fef3c7",
      border: "1px solid #fde68a",
      color: "#92400e",
    }
  }

  return {
    background: "#e0f2fe",
    border: "1px solid #bae6fd",
    color: "#0c4a6e",
  }
}

function resultBadgeStyle(value: "W" | "D" | "L") {
  if (value === "W") {
    return {
      background: "#dcfce7",
      border: "1px solid #86efac",
      color: "#166534",
    }
  }

  if (value === "D") {
    return {
      background: "#fef3c7",
      border: "1px solid #fcd34d",
      color: "#92400e",
    }
  }

  return {
    background: "#fee2e2",
    border: "1px solid #fca5a5",
    color: "#991b1b",
  }
}

function StatTile({
  label,
  value,
  subtext,
}: {
  label: string
  value: string | number
  subtext?: string
}) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 16,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
      }}
    >
      <div style={{ color: "#64748b", fontWeight: 800, fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6, lineHeight: 1.1 }}>
        {value}
      </div>
      {subtext ? (
        <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>{subtext}</div>
      ) : null}
    </div>
  )
}

export default function HomeTab({
  teamName,
  players,
  events,
  attendance,
  results,
  ratings,
  activeMatchEventId,
  selectedDate,
  onOpenTab,
}: Props) {
  const today = selectedDate

  const sortedUpcomingEvents = useMemo(() => {
    return events
      .filter((event) => event.date >= today)
      .slice()
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date)
        if (dateCompare !== 0) return dateCompare
        return (a.startTime || "").localeCompare(b.startTime || "")
      })
  }, [events, today])

  const nextEvent = sortedUpcomingEvents[0] || null

  const activeMatchEvent = useMemo(() => {
    return events.find((event) => event.id === activeMatchEventId) || null
  }, [events, activeMatchEventId])

  const activeMatchAttendance = useMemo(() => {
    if (!activeMatchEvent) return []
    return attendance.filter((row) => row.eventId === activeMatchEvent.id)
  }, [attendance, activeMatchEvent])

  const availableCount = activeMatchAttendance.filter((row) => row.status === "available").length
  const maybeCount = activeMatchAttendance.filter((row) => row.status === "maybe").length
  const unavailableCount = activeMatchAttendance.filter((row) => row.status === "unavailable").length

  const availableIds = activeMatchAttendance
    .filter((row) => row.status === "available")
    .map((row) => row.playerId)

  const availablePlayers = players.filter((player) => availableIds.includes(player.id))

  const noKeeperMarked =
    !!activeMatchEvent &&
    availablePlayers.length > 0 &&
    !availablePlayers.some((player) => player.mainGK || player.backupGK || player.positions.includes("GK"))

  const activeMatchRatings = useMemo(() => {
    if (!activeMatchEvent) return []
    return ratings
      .filter((row) => row.eventId === activeMatchEvent.id)
      .slice()
      .sort((a, b) => b.rating - a.rating)
  }, [ratings, activeMatchEvent])

  const ratingsMissing =
    !!activeMatchEvent &&
    availablePlayers.length > 0 &&
    Math.max(availablePlayers.length - activeMatchRatings.length, 0)

  const recentResults = useMemo(() => {
    const normalizedTeam = normalizeTeamName(teamName)

    return results
      .filter((match) => {
        const home = normalizeTeamName(match.homeTeam)
        const away = normalizeTeamName(match.awayTeam)
        return home === normalizedTeam || away === normalizedTeam
      })
      .slice()
      .sort((a, b) => b.playedOn.localeCompare(a.playedOn))
      .slice(0, 5)
      .map((match) => {
        const isHome = normalizeTeamName(match.homeTeam) === normalizedTeam
        const ourScore = isHome ? match.homeScore : match.awayScore
        const theirScore = isHome ? match.awayScore : match.homeScore
        const opponent = isHome
          ? normalizeTeamName(match.awayTeam)
          : normalizeTeamName(match.homeTeam)
        const result = ourScore > theirScore ? "W" : ourScore < theirScore ? "L" : "D"

        return {
          ...match,
          opponent,
          ourScore,
          theirScore,
          result: result as "W" | "D" | "L",
        }
      })
  }, [results, teamName])

  const recentForm = recentResults.map((row) => row.result)

  const topPlayers = useMemo(() => {
    const ratingMap: Record<string, number[]> = {}

    for (const item of ratings) {
      if (!ratingMap[item.playerId]) ratingMap[item.playerId] = []
      ratingMap[item.playerId].push(item.rating)
    }

    return players
      .map((player) => {
        const playerRatings = ratingMap[player.id] || []
        const average =
          playerRatings.length > 0
            ? playerRatings.reduce((sum, value) => sum + value, 0) / playerRatings.length
            : 0

        return {
          id: player.id,
          name: player.name,
          averageRating: average,
          ratingsCount: playerRatings.length,
          minutes: player.seasonSeconds || 0,
        }
      })
      .filter((player) => player.ratingsCount > 0)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 3)
  }, [players, ratings])

  const alerts = useMemo(() => {
    const items: AlertRow[] = []

    if (activeMatchEventId && !activeMatchEvent) {
      items.push({
        id: "missing-active-match",
        level: "warning",
        text: "Active match is set but the event could not be found.",
      })
    }

    if (!activeMatchEvent) {
      items.push({
        id: "no-active-match",
        level: "info",
        text: "No active match selected. Set one from Events or Match.",
      })
    }

    if (noKeeperMarked) {
      items.push({
        id: "no-gk",
        level: "danger",
        text: "No goalkeeper is marked as available for the active match.",
      })
    }

    if (ratingsMissing) {
      items.push({
        id: "ratings-missing",
        level: "warning",
        text: `${ratingsMissing} feedback entries still missing for the active match squad.`,
      })
    }

    if (activeMatchEvent && availableCount === 0) {
      items.push({
        id: "no-availability",
        level: "warning",
        text: "Nobody is marked available for the active match yet.",
      })
    }

    if (!nextEvent) {
      items.push({
        id: "no-next-event",
        level: "info",
        text: "No upcoming events scheduled.",
      })
    }

    return items
  }, [
    activeMatchEventId,
    activeMatchEvent,
    noKeeperMarked,
    ratingsMissing,
    availableCount,
    nextEvent,
  ])

  const mainGk = players.find((player) => player.mainGK)
  const backupGk = players.find((player) => player.backupGK)

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PageCard tone="blue">
        <SectionHeader
          title={teamName}
          subtitle="Matchday snapshot, team summary and quick access."
          light
          action={
            <PrimaryButton onClick={() => onOpenTab(activeMatchEvent ? "match" : "events")}>
              {activeMatchEvent ? "Open Match" : "Open Events"}
            </PrimaryButton>
          }
        />
      </PageCard>

      <PageCard>
        <SectionHeader title="Club Snapshot" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          <StatTile label="Players" value={players.length} />
          <StatTile label="Main GK" value={mainGk?.name || "Not set"} />
          <StatTile label="Backup GK" value={backupGk?.name || "Not set"} />
          <StatTile label="Recent Results" value={recentResults.length} subtext="last 5 loaded" />
        </div>
      </PageCard>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        <PageCard>
          <SectionHeader
            title="Next Event"
            action={<SecondaryButton onClick={() => onOpenTab("events")}>View Events</SecondaryButton>}
          />

          {!nextEvent ? (
            <div style={{ color: "#64748b" }}>No upcoming event scheduled.</div>
          ) : (
            <div
              style={{
                padding: 14,
                borderRadius: 18,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 900 }}>{nextEvent.title}</div>
              <div style={{ color: "#475569" }}>
                {nextEvent.date}
                {nextEvent.startTime ? ` • ${nextEvent.startTime}` : ""}
                {nextEvent.location ? ` • ${nextEvent.location}` : ""}
              </div>
              <div style={{ color: "#64748b" }}>
                {nextEvent.type === "match"
                  ? `Match${nextEvent.opponent ? ` vs ${nextEvent.opponent}` : ""}`
                  : nextEvent.type === "training"
                  ? "Training"
                  : "Other event"}
              </div>
            </div>
          )}
        </PageCard>

        <PageCard tone="softBlue">
          <SectionHeader
            title="Active Match"
            action={
              <SecondaryButton onClick={() => onOpenTab(activeMatchEvent ? "match" : "events")}>
                {activeMatchEvent ? "Open Match" : "Choose Match"}
              </SecondaryButton>
            }
          />

          {!activeMatchEvent ? (
            <div style={{ color: "#64748b" }}>No active match selected.</div>
          ) : (
            <div
              style={{
                padding: 14,
                borderRadius: 18,
                background: "white",
                border: "1px solid #bfdbfe",
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 900 }}>{activeMatchEvent.title}</div>
              <div style={{ color: "#475569" }}>
                {activeMatchEvent.date}
                {activeMatchEvent.startTime ? ` • ${activeMatchEvent.startTime}` : ""}
              </div>
              <div style={{ color: "#1e3a8a", fontWeight: 800 }}>
                {activeMatchEvent.opponent ? `vs ${activeMatchEvent.opponent}` : "Opponent not set"}
              </div>
            </div>
          )}
        </PageCard>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        <PageCard>
          <SectionHeader title="Attendance Snapshot" />
          {!activeMatchEvent ? (
            <div style={{ color: "#64748b" }}>Pick an active match to show attendance.</div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              <StatTile label="Available" value={availableCount} />
              <StatTile label="Maybe" value={maybeCount} />
              <StatTile label="Unavailable" value={unavailableCount} />
            </div>
          )}
        </PageCard>

        <PageCard>
          <SectionHeader title="Recent Form" />
          {recentForm.length === 0 ? (
            <div style={{ color: "#64748b" }}>No recent results yet.</div>
          ) : (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {recentForm.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  style={{
                    ...resultBadgeStyle(item),
                    width: 42,
                    height: 42,
                    borderRadius: 999,
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 900,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </PageCard>
      </div>

      <PageCard>
        <SectionHeader title="Quick Actions" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 10,
          }}
        >
          <SecondaryButton onClick={() => onOpenTab("events")}>Open Events</SecondaryButton>
          <SecondaryButton onClick={() => onOpenTab("match")}>Open Match</SecondaryButton>
          <SecondaryButton onClick={() => onOpenTab("players")}>Manage Players</SecondaryButton>
          <SecondaryButton onClick={() => onOpenTab("stats")}>View Stats</SecondaryButton>
        </div>
      </PageCard>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        <PageCard>
          <SectionHeader title="Alerts" />
          {alerts.length === 0 ? (
            <div style={{ color: "#166534", fontWeight: 800 }}>No alerts right now.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    ...alertStyle(alert.level),
                    padding: 12,
                    borderRadius: 14,
                    fontWeight: 800,
                  }}
                >
                  {alert.text}
                </div>
              ))}
            </div>
          )}
        </PageCard>

        <PageCard>
          <SectionHeader
            title="Top 3 Players"
            action={<SecondaryButton onClick={() => onOpenTab("stats")}>Full Stats</SecondaryButton>}
          />

          {topPlayers.length === 0 ? (
            <div style={{ color: "#64748b" }}>No ratings saved yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {topPlayers.map((player, index) => (
                <div
                  key={player.id}
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    display: "grid",
                    gridTemplateColumns: "32px minmax(0, 1fr) auto",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      background: "#dbeafe",
                      color: "#1d4ed8",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 900,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 900 }}>{player.name}</div>
                    <div style={{ color: "#64748b", fontSize: 13 }}>
                      {player.ratingsCount} ratings • {formatMinutes(player.minutes)} mins
                    </div>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>
                    {player.averageRating.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </PageCard>
      </div>

      <PageCard>
        <SectionHeader
          title="Recent Results"
          action={<SecondaryButton onClick={() => onOpenTab("stats")}>Open Stats</SecondaryButton>}
        />

        {recentResults.length === 0 ? (
          <div style={{ color: "#64748b" }}>No results saved yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {recentResults.map((match) => (
              <div
                key={match.id}
                style={{
                  padding: 12,
                  borderRadius: 14,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  display: "grid",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ fontWeight: 900 }}>
                    vs {match.opponent} • {match.ourScore}-{match.theirScore}
                  </div>
                  <div
                    style={{
                      ...resultBadgeStyle(match.result),
                      borderRadius: 999,
                      padding: "6px 10px",
                      fontWeight: 900,
                    }}
                  >
                    {match.result}
                  </div>
                </div>

                <div style={{ color: "#64748b", fontSize: 14 }}>
                  {match.playedOn}
                  {match.competition ? ` • ${match.competition}` : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </PageCard>
    </div>
  )
}
