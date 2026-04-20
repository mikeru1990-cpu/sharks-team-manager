"use client"

import { THEME } from "../../lib/theme"
import {
  Badge,
  PageCard,
  PrimaryButton,
  SectionHeader,
  SecondaryButton,
} from "../ui"
import type {
  EventAttendance,
  LeagueResult,
  MainTab,
  Player,
  PlayerMatchRating,
} from "../../lib/types"
import type { EventWithPlan } from "../../lib/dashboardTypes"

type Props = {
  teamName: string
  players: Player[]
  events: EventWithPlan[]
  attendance: EventAttendance[]
  results: LeagueResult[]
  ratings: PlayerMatchRating[]
  activeMatchEventId: string | null
  selectedDate: string
  onOpenTab: (tab: MainTab) => void
}

function formatPrettyDate(date: string) {
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    })
  } catch {
    return date
  }
}

function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string | number
  tone?: "default" | "blue" | "green" | "yellow"
}) {
  const style =
    tone === "blue"
      ? {
          background: "#dbeafe",
          border: "1px solid rgba(59,130,246,0.24)",
          color: "#1d4ed8",
        }
      : tone === "green"
      ? {
          background: "#dcfce7",
          border: "1px solid rgba(34,197,94,0.28)",
          color: "#166534",
        }
      : tone === "yellow"
      ? {
          background: "#fef3c7",
          border: "1px solid rgba(250,204,21,0.34)",
          color: "#92400e",
        }
      : {
          background: "#f8fafc",
          border: "1px solid rgba(15,23,42,0.08)",
          color: "#334155",
        }

  return (
    <div
      style={{
        ...style,
        borderRadius: 20,
        padding: 16,
        display: "grid",
        gap: 6,
        boxShadow: "0 6px 14px rgba(15,23,42,0.05)",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.88 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.05 }}>{value}</div>
    </div>
  )
}

function QuickAction({
  title,
  subtitle,
  icon,
  onClick,
}: {
  title: string
  subtitle: string
  icon: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "1px solid #dbe3ef",
        background: "white",
        borderRadius: 22,
        padding: 18,
        textAlign: "left",
        display: "grid",
        gap: 10,
        cursor: "pointer",
        boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          background: "#eff6ff",
          display: "grid",
          placeItems: "center",
          fontSize: 22,
          lineHeight: 1,
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: THEME.colors.textPrimary }}>
        {title}
      </div>
      <div style={{ fontSize: 14, color: THEME.colors.textSecondary, lineHeight: 1.45 }}>
        {subtitle}
      </div>
    </button>
  )
}

function EmptyState({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: "1px dashed #cbd5e1",
        background: "#f8fafc",
        padding: 18,
        color: THEME.colors.textSecondary,
        display: "grid",
        gap: 4,
      }}
    >
      <div style={{ fontWeight: 800, color: THEME.colors.textPrimary }}>{title}</div>
      <div style={{ fontSize: 14 }}>{subtitle}</div>
    </div>
  )
}

function FeatureCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string
  subtitle: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <PageCard>
      <SectionHeader title={title} subtitle={subtitle} action={action} />
      {children}
    </PageCard>
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
  const sortedEvents = [...events].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date)
    if (dateCompare !== 0) return dateCompare
    const timeCompare = (a.startTime || "").localeCompare(b.startTime || "")
    if (timeCompare !== 0) return timeCompare
    return a.title.localeCompare(b.title)
  })

  const todayOrNextEvent =
    sortedEvents.find((event) => event.date >= selectedDate) || sortedEvents[0] || null

  const upcomingMatches = sortedEvents.filter((event) => event.type === "match").slice(0, 3)
  const recentResults = [...results]
    .sort((a, b) => b.playedOn.localeCompare(a.playedOn))
    .slice(0, 3)

  const activeMatch =
    events.find((event) => event.id === activeMatchEventId) ||
    sortedEvents.find((event) => event.type === "match" && event.date >= selectedDate) ||
    null

  const totalPlayers = players.length
  const availableForNextEvent = todayOrNextEvent
    ? attendance.filter(
        (item) => item.eventId === todayOrNextEvent.id && item.status === "available"
      ).length
    : 0

  const maybeForNextEvent = todayOrNextEvent
    ? attendance.filter(
        (item) => item.eventId === todayOrNextEvent.id && item.status === "maybe"
      ).length
    : 0

  const unavailableForNextEvent = todayOrNextEvent
    ? attendance.filter(
        (item) => item.eventId === todayOrNextEvent.id && item.status === "unavailable"
      ).length
    : 0

  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length).toFixed(1)
      : "—"

  const playerScoreMap: Record<string, number> = {}
  for (const rating of ratings) {
    playerScoreMap[rating.playerId] = (playerScoreMap[rating.playerId] || 0) + rating.rating
  }

  const topPlayerId =
    Object.entries(playerScoreMap).sort((a, b) => b[1] - a[1])[0]?.[0] || null
  const topPlayer = players.find((player) => player.id === topPlayerId) || null

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <PageCard tone="blue">
        <SectionHeader
          title={teamName}
          subtitle="Matchday snapshot, squad summary and quick access."
          light
          action={
            <div style={{ minWidth: 140 }}>
              <PrimaryButton onClick={() => onOpenTab(activeMatch ? "match" : "events")}>
                {activeMatch ? "Open Match" : "Open Events"}
              </PrimaryButton>
            </div>
          }
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 12,
            marginTop: 10,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 20,
              padding: 16,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.82 }}>SQUAD</div>
            <div style={{ fontSize: 30, fontWeight: 900, marginTop: 6 }}>{totalPlayers}</div>
            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>registered players</div>
          </div>

          <div
            style={{
              background: "rgba(250,204,21,0.16)",
              border: "1px solid rgba(250,204,21,0.24)",
              borderRadius: 20,
              padding: 16,
              color: "#fef08a",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.92 }}>AVG RATING</div>
            <div style={{ fontSize: 30, fontWeight: 900, marginTop: 6 }}>{avgRating}</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>saved player feedback</div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 20,
              padding: 16,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.82 }}>ACTIVE MATCH</div>
            <div style={{ fontSize: 18, fontWeight: 900, marginTop: 6, lineHeight: 1.2 }}>
              {activeMatch ? activeMatch.title : "No active match"}
            </div>
            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
              {activeMatch ? formatPrettyDate(activeMatch.date) : "Choose one in Match tab"}
            </div>
          </div>
        </div>
      </PageCard>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
        }}
      >
        <StatTile label="Available" value={availableForNextEvent} tone="green" />
        <StatTile label="Maybe" value={maybeForNextEvent} tone="yellow" />
        <StatTile label="Unavailable" value={unavailableForNextEvent} />
        <StatTile label="Results Logged" value={results.length} tone="blue" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        <QuickAction
          icon="📅"
          title="Events"
          subtitle="Create training sessions, fixtures and manage attendance."
          onClick={() => onOpenTab("events")}
        />
        <QuickAction
          icon="⚽"
          title="Match Centre"
          subtitle="Manage lineups, timeline, minutes and reports."
          onClick={() => onOpenTab("match")}
        />
        <QuickAction
          icon="👥"
          title="Players"
          subtitle="Update squad members, goalkeepers and leadership roles."
          onClick={() => onOpenTab("players")}
        />
        <QuickAction
          icon="📊"
          title="Stats"
          subtitle="Review results, team trends and player feedback."
          onClick={() => onOpenTab("stats")}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)",
          gap: 16,
        }}
      >
        <div style={{ display: "grid", gap: 16 }}>
          <FeatureCard
            title="Next Event"
            subtitle="Your next key activity for the squad."
            action={
              <div style={{ minWidth: 100 }}>
                <SecondaryButton onClick={() => onOpenTab("events")}>Open</SecondaryButton>
              </div>
            }
          >
            {!todayOrNextEvent ? (
              <EmptyState
                title="No events scheduled"
                subtitle="Create a training or match event to start planning."
              />
            ) : (
              <div
                style={{
                  borderRadius: 20,
                  padding: 16,
                  background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)",
                  border: "1px solid #dbeafe",
                  display: "grid",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Badge tone={todayOrNextEvent.type === "match" ? "blue" : "green"}>
                    {todayOrNextEvent.type.toUpperCase()}
                  </Badge>
                  <Badge>{formatPrettyDate(todayOrNextEvent.date)}</Badge>
                  {todayOrNextEvent.startTime ? <Badge>{todayOrNextEvent.startTime}</Badge> : null}
                </div>

                <div style={{ fontSize: 24, fontWeight: 900, color: THEME.colors.textPrimary }}>
                  {todayOrNextEvent.title}
                </div>

                {todayOrNextEvent.opponent ? (
                  <div style={{ color: THEME.colors.textSecondary, fontSize: 15 }}>
                    Opponent:{" "}
                    <strong style={{ color: THEME.colors.textPrimary }}>
                      {todayOrNextEvent.opponent}
                    </strong>
                  </div>
                ) : null}

                {todayOrNextEvent.location ? (
                  <div style={{ color: THEME.colors.textSecondary, fontSize: 15 }}>
                    Location:{" "}
                    <strong style={{ color: THEME.colors.textPrimary }}>
                      {todayOrNextEvent.location}
                    </strong>
                  </div>
                ) : null}
              </div>
            )}
          </FeatureCard>

          <FeatureCard
            title="Upcoming Matches"
            subtitle="Nearest fixtures in your current season."
            action={
              <div style={{ minWidth: 110 }}>
                <SecondaryButton onClick={() => onOpenTab("match")}>Match Tab</SecondaryButton>
              </div>
            }
          >
            {upcomingMatches.length === 0 ? (
              <EmptyState
                title="No matches yet"
                subtitle="Create a match event to see fixtures here."
              />
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {upcomingMatches.map((match) => (
                  <div
                    key={match.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 18,
                      padding: 14,
                      background: "white",
                      display: "grid",
                      gap: 8,
                      boxShadow: "0 6px 14px rgba(15,23,42,0.04)",
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Badge tone="blue">MATCH</Badge>
                      <Badge>{formatPrettyDate(match.date)}</Badge>
                      {match.startTime ? <Badge>{match.startTime}</Badge> : null}
                    </div>

                    <div style={{ fontWeight: 900, fontSize: 17, color: THEME.colors.textPrimary }}>
                      {match.title}
                    </div>

                    <div style={{ color: THEME.colors.textSecondary, fontSize: 14, lineHeight: 1.45 }}>
                      {match.opponent ? `vs ${match.opponent}` : "Opponent not set"}
                      {match.location ? ` • ${match.location}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </FeatureCard>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <FeatureCard
            title="Top Performer"
            subtitle="Based on saved match feedback."
          >
            {topPlayer ? (
              <div
                style={{
                  borderRadius: 18,
                  padding: 16,
                  background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
                  border: "1px solid #dbeafe",
                  display: "grid",
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 900 }}>{topPlayer.name}</div>
                <div style={{ color: THEME.colors.textSecondary, fontSize: 14 }}>
                  Positions: {topPlayer.positions.join(" / ")}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {topPlayer.mainGK ? <Badge tone="blue">Main GK</Badge> : null}
                  {topPlayer.backupGK ? <Badge tone="blue">Backup GK</Badge> : null}
                  {topPlayer.captain ? <Badge tone="yellow">Captain</Badge> : null}
                  {topPlayer.viceCaptain ? <Badge tone="yellow">Vice Captain</Badge> : null}
                </div>
              </div>
            ) : (
              <EmptyState
                title="No player data yet"
                subtitle="Save some match feedback to surface a standout performer."
              />
            )}
          </FeatureCard>

          <FeatureCard
            title="Recent Results"
            subtitle="Latest saved scorelines."
          >
            {recentResults.length === 0 ? (
              <EmptyState
                title="No results saved"
                subtitle="Finish a game and save the result to see it here."
              />
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {recentResults.map((result) => (
                  <div
                    key={result.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 18,
                      padding: 14,
                      background: "#f8fafc",
                      display: "grid",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ fontWeight: 800, color: THEME.colors.textPrimary }}>
                        {result.opponent || "Opponent"}
                      </div>
                      <Badge>{formatPrettyDate(result.playedOn)}</Badge>
                    </div>

                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 900,
                        color: THEME.colors.textPrimary,
                        lineHeight: 1.25,
                      }}
                    >
                      {result.homeTeam} {result.homeScore} - {result.awayScore} {result.awayTeam}
                    </div>

                    {result.competition ? (
                      <div style={{ color: THEME.colors.textSecondary, fontSize: 13 }}>
                        {result.competition}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </FeatureCard>
        </div>
      </div>
    </div>
  )
}
