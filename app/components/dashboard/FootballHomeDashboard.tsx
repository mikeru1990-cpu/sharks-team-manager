"use client"

import type { EventAttendance, LeagueResult, MainTab, Player, PlayerMatchRating } from "../../lib/types"
import type { EventWithPlan } from "../../lib/dashboardTypes"
import ClubBadge from "../branding/ClubBadge"

type Props = {
  teamName: string
  players: Player[]
  events: EventWithPlan[]
  attendance: EventAttendance[]
  results: LeagueResult[]
  ratings: PlayerMatchRating[]
  activeMatchEventId?: string | null
  onOpenTab: (tab: MainTab) => void
}

function todayLocal() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

function prettyDate(date?: string) {
  if (!date) return "No date"
  try { return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" }) } catch { return date }
}

function fullToday() {
  try { return new Date().toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long" }) } catch { return "Today" }
}

function nextEvent(events: EventWithPlan[], type?: string) {
  const today = todayLocal()
  return [...events].filter((event) => (!type || event.type === type) && event.date >= today).sort((a, b) => `${a.date}${a.startTime || ""}`.localeCompare(`${b.date}${b.startTime || ""}`))[0]
}

function MiniStat({ label, value, colour }: { label: string; value: string | number; colour: string }) {
  return <div style={{ borderRadius: 18, padding: 12, background: "rgba(2,6,23,0.52)", border: `1px solid ${colour}44`, minHeight: 72 }}><div style={{ color: "#94a3b8", fontSize: 9, fontWeight: 1000, letterSpacing: ".12em", textTransform: "uppercase" }}>{label}</div><div style={{ color: colour, fontSize: 27, fontWeight: 1000, lineHeight: 1, marginTop: 7 }}>{value}</div></div>
}

function ActionButton({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
  return <button onClick={onClick} style={{ border: "1px solid rgba(125,211,252,0.24)", background: "rgba(15,23,42,0.70)", borderRadius: 18, padding: 13, color: "white", fontWeight: 1000, cursor: "pointer", display: "flex", gap: 10, alignItems: "center", justifyContent: "center" }}><span>{icon}</span><span>{label}</span></button>
}

function FocusCard({ title, event, empty, onClick }: { title: string; event?: EventWithPlan; empty: string; onClick: () => void }) {
  return <button onClick={onClick} style={{ textAlign: "left", border: "1px solid rgba(125,211,252,0.20)", background: "rgba(2,6,23,0.46)", borderRadius: 22, padding: 14, display: "grid", gap: 7, cursor: "pointer", color: "white" }}><div style={{ color: "#7dd3fc", fontSize: 10, fontWeight: 1000, letterSpacing: ".14em", textTransform: "uppercase" }}>{title}</div><div style={{ fontSize: 17, fontWeight: 1000, lineHeight: 1.1 }}>{event?.title || empty}</div><div style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 850 }}>{event ? `${prettyDate(event.date)}${event.startTime ? ` • ${event.startTime}` : ""}` : "Tap to add or view events"}</div>{event?.opponent ? <div style={{ color: "#bae6fd", fontSize: 12, fontWeight: 900 }}>vs {event.opponent}</div> : null}</button>
}

function WorkspaceCard({ icon, title, subtitle, onClick }: { icon: string; title: string; subtitle: string; onClick: () => void }) {
  return <button onClick={onClick} className="sharks-card-shine" style={{ borderRadius: 22, padding: 14, background: "rgba(15,23,42,0.68)", border: "1px solid rgba(125,211,252,0.18)", color: "white", textAlign: "left", cursor: "pointer", display: "grid", gap: 8 }}><div style={{ fontSize: 22 }}>{icon}</div><div style={{ fontWeight: 1000, fontSize: 16 }}>{title}</div><div style={{ color: "#aebed4", fontSize: 12, fontWeight: 800, lineHeight: 1.35 }}>{subtitle}</div></button>
}

function Notice({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "yellow" | "green" }) {
  const colour = tone === "green" ? "#22c55e" : tone === "yellow" ? "#f59e0b" : "#38bdf8"
  return <div style={{ borderRadius: 16, padding: 11, background: `${colour}16`, border: `1px solid ${colour}44`, color: "#e5eefc", fontWeight: 850 }}>{children}</div>
}

export default function FootballHomeDashboard({ teamName, players, events, attendance, results, ratings, activeMatchEventId, onOpenTab }: Props) {
  const event = nextEvent(events)
  const match = nextEvent(events, "match")
  const training = nextEvent(events, "training") || events.find((item) => item.type !== "match" && item.date >= todayLocal())
  const focusEvent = match || training || event
  const eventAttendance = focusEvent ? attendance.filter((item) => item.eventId === focusEvent.id) : []
  const available = eventAttendance.filter((item) => item.status === "available").length
  const maybe = eventAttendance.filter((item) => item.status === "maybe").length
  const unavailable = eventAttendance.filter((item) => item.status === "unavailable").length
  const wins = results.filter((result) => result.homeScore > result.awayScore).length
  const avgRating = ratings.length ? (ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length).toFixed(1) : "—"
  const pendingTasks = [!focusEvent ? "Add your next training or match" : null, focusEvent && available === 0 ? "Collect availability responses" : null, match ? "Review matchday squad" : "Plan next session", ratings.length === 0 ? "Add your first player ratings" : null].filter(Boolean) as string[]
  const readiness = focusEvent ? (available >= 10 ? "Ready" : available > 0 ? "Needs Responses" : "Waiting") : "Setup Needed"

  return <section style={{ display: "grid", gap: 14 }}>
    <div className="sharks-elite-panel sharks-card-shine" style={{ borderRadius: 28, padding: 18, display: "grid", gap: 16, overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center", minWidth: 0 }}><ClubBadge size={64} /><div style={{ minWidth: 0 }}><div style={{ color: "#7dd3fc", fontSize: 10, fontWeight: 1000, letterSpacing: ".14em", textTransform: "uppercase" }}>Coach Operating System • {fullToday()}</div><div style={{ color: "white", fontSize: 30, fontWeight: 1000, letterSpacing: "-0.055em", lineHeight: 1, overflowWrap: "anywhere" }}>{teamName}</div><div style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 800, marginTop: 4 }}>One dashboard for matchday, training, squad, insights and club admin.</div></div></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10 }}><FocusCard title="Next Match" event={match} empty="No upcoming fixture" onClick={() => onOpenTab(match || activeMatchEventId ? "match" : "events")} /><FocusCard title="Next Training" event={training} empty="No training planned" onClick={() => onOpenTab("events")} /></div>
    </div>

    <div className="sharks-glass sharks-card-shine" style={{ borderRadius: 24, padding: 14, display: "grid", gap: 10, border: "1px solid rgba(125,211,252,0.22)" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}><div><div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".16em", textTransform: "uppercase" }}>Today&apos;s Focus</div><div style={{ color: "white", fontSize: 20, fontWeight: 1000, marginTop: 4 }}>{focusEvent?.title || "No event scheduled"}</div></div><div style={{ borderRadius: 999, padding: "8px 11px", background: readiness === "Ready" ? "rgba(34,197,94,0.14)" : "rgba(245,158,11,0.14)", border: readiness === "Ready" ? "1px solid rgba(34,197,94,0.36)" : "1px solid rgba(245,158,11,0.36)", color: readiness === "Ready" ? "#86efac" : "#fde68a", fontWeight: 1000, whiteSpace: "nowrap" }}>{readiness}</div></div><div style={{ color: "#cbd5e1", fontWeight: 850 }}>{focusEvent ? `${prettyDate(focusEvent.date)}${focusEvent.startTime ? ` • ${focusEvent.startTime}` : ""}` : "Create a match or training session to start planning."}</div></div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}><MiniStat label="Squad" value={players.length} colour="#38bdf8" /><MiniStat label="Available" value={available} colour="#22c55e" /><MiniStat label="Maybe" value={maybe} colour="#f59e0b" /><MiniStat label="Unavailable" value={unavailable} colour="#ef4444" /></div>

    <div className="sharks-glass sharks-card-shine" style={{ borderRadius: 24, padding: 14, display: "grid", gap: 10, border: "1px solid rgba(125,211,252,0.22)" }}><div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".16em", textTransform: "uppercase" }}>Quick Actions</div><div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}><ActionButton icon="⚽" label={activeMatchEventId || match ? "Open Matchday" : "Create Match"} onClick={() => onOpenTab(activeMatchEventId || match ? "match" : "events")} /><ActionButton icon="🏃" label="Training" onClick={() => onOpenTab("events")} /><ActionButton icon="👤" label="Squad Hub" onClick={() => onOpenTab("players")} /><ActionButton icon="📊" label="Insights" onClick={() => onOpenTab("stats")} /></div></div>

    <div className="sharks-glass" style={{ borderRadius: 24, padding: 14, display: "grid", gap: 10, border: "1px solid rgba(125,211,252,0.18)" }}><div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".16em", textTransform: "uppercase" }}>Notifications & Assistant</div><div style={{ display: "grid", gap: 8 }}>{pendingTasks.slice(0, 4).map((task, index) => <Notice key={task} tone={index === 0 ? "yellow" : "blue"}>• {task}</Notice>)}</div></div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}><WorkspaceCard icon="⚽" title="Matchday" subtitle="Squad, rotation, live events and summary." onClick={() => onOpenTab("match")} /><WorkspaceCard icon="🏃" title="Training" subtitle="Sessions, attendance and planning." onClick={() => onOpenTab("events")} /><WorkspaceCard icon="👥" title="Players" subtitle="Profiles, roles and development." onClick={() => onOpenTab("players")} /><WorkspaceCard icon="📊" title="Insights" subtitle={`Wins ${wins} • Avg rating ${avgRating}`} onClick={() => onOpenTab("stats")} /><WorkspaceCard icon="⚙️" title="Club" subtitle="Teams, coaches and settings." onClick={() => onOpenTab("coaches")} /></div>
  </section>
}
