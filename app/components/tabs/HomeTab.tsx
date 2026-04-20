"use client"

import { THEME } from "../../lib/theme"
import {
  Badge,
  PageCard,
  PrimaryButton,
  SectionHeader,
  SecondaryButton,
} from "../ui"
import {
  CalendarIcon,
  FootballIcon,
  UsersIcon,
  ChartIcon,
} from "../AppIcons"

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
      ? { background: "#dbeafe", border: "1px solid #bfdbfe", color: "#1d4ed8" }
      : tone === "green"
      ? { background: "#dcfce7", border: "1px solid #86efac", color: "#166534" }
      : tone === "yellow"
      ? { background: "#fef3c7", border: "1px solid #fcd34d", color: "#92400e" }
      : { background: "#f8fafc", border: "1px solid #e2e8f0", color: "#334155" }

  return (
    <div style={{ ...style, borderRadius: 20, padding: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 900 }}>{value}</div>
    </div>
  )
}

/* ✅ UPDATED QUICK ACTION (ICON COMPONENT) */
function QuickAction({
  title,
  subtitle,
  icon,
  onClick,
}: {
  title: string
  subtitle: string
  icon: React.ReactNode
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
          color: THEME.colors.primary,
        }}
      >
        {icon}
      </div>

      <div style={{ fontSize: 18, fontWeight: 900 }}>
        {title}
      </div>

      <div style={{ fontSize: 14, color: THEME.colors.textSecondary }}>
        {subtitle}
      </div>
    </button>
  )
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ border: "1px dashed #cbd5e1", padding: 16, borderRadius: 16 }}>
      <strong>{title}</strong>
      <div style={{ fontSize: 14 }}>{subtitle}</div>
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
  const sortedEvents = [...events].sort((a, b) => a.date.localeCompare(b.date))

  const nextEvent =
    sortedEvents.find((e) => e.date >= selectedDate) || sortedEvents[0]

  const upcomingMatches = sortedEvents.filter((e) => e.type === "match").slice(0, 3)

  const totalPlayers = players.length

  const available =
    nextEvent
      ? attendance.filter(
          (a) => a.eventId === nextEvent.id && a.status === "available"
        ).length
      : 0

  const maybe =
    nextEvent
      ? attendance.filter(
          (a) => a.eventId === nextEvent.id && a.status === "maybe"
        ).length
      : 0

  const unavailable =
    nextEvent
      ? attendance.filter(
          (a) => a.eventId === nextEvent.id && a.status === "unavailable"
        ).length
      : 0

  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
      : "—"

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* HERO */}
      <PageCard tone="blue">
        <SectionHeader
          title={teamName}
          subtitle="Matchday snapshot and quick access"
          light
          action={
            <PrimaryButton
              onClick={() =>
                onOpenTab(activeMatchEventId ? "match" : "events")
              }
            >
              {activeMatchEventId ? "Open Match" : "Open Events"}
            </PrimaryButton>
          }
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          <StatTile label="Squad" value={totalPlayers} />
          <StatTile label="Avg Rating" value={avgRating} tone="yellow" />
          <StatTile label="Next" value={nextEvent ? formatPrettyDate(nextEvent.date) : "-"} />
        </div>
      </PageCard>

      {/* AVAILABILITY */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        <StatTile label="Available" value={available} tone="green" />
        <StatTile label="Maybe" value={maybe} tone="yellow" />
        <StatTile label="Unavailable" value={unavailable} />
        <StatTile label="Results" value={results.length} tone="blue" />
      </div>

      {/* ✅ QUICK ACTIONS (NOW ICON COMPONENTS) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
        <QuickAction
          icon={<CalendarIcon />}
          title="Events"
          subtitle="Manage training & fixtures"
          onClick={() => onOpenTab("events")}
        />

        <QuickAction
          icon={<FootballIcon />}
          title="Match Centre"
          subtitle="Lineups & match control"
          onClick={() => onOpenTab("match")}
        />

        <QuickAction
          icon={<UsersIcon />}
          title="Players"
          subtitle="Squad & roles"
          onClick={() => onOpenTab("players")}
        />

        <QuickAction
          icon={<ChartIcon />}
          title="Stats"
          subtitle="Results & performance"
          onClick={() => onOpenTab("stats")}
        />
      </div>

      {/* NEXT EVENT */}
      <PageCard>
        <SectionHeader title="Next Event" />

        {!nextEvent ? (
          <EmptyState title="No events" subtitle="Add one in Events tab" />
        ) : (
          <div>
            <strong>{nextEvent.title}</strong>
            <div>{formatPrettyDate(nextEvent.date)}</div>
            {nextEvent.opponent && <div>vs {nextEvent.opponent}</div>}
          </div>
        )}
      </PageCard>

      {/* UPCOMING MATCHES */}
      <PageCard>
        <SectionHeader title="Upcoming Matches" />

        {upcomingMatches.length === 0 ? (
          <EmptyState title="No matches" subtitle="Create a match event" />
        ) : (
          upcomingMatches.map((m) => (
            <div key={m.id}>
              <strong>{m.title}</strong>
              <div>{formatPrettyDate(m.date)}</div>
            </div>
          ))
        )}
      </PageCard>
    </div>
  )
}
