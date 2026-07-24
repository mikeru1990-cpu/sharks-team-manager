"use client"

import { CalendarDays, ClipboardCheck, Dumbbell, MessageSquare, Trophy, Users } from "lucide-react"
import TeamContextHeader from "../layout/TeamContextHeader"
import PremiumWorkspaceHeader from "../ui/PremiumWorkspaceHeader"
import type { WorkspaceTab } from "../../lib/workspaces"
import { getActiveU11Players, getContinuingTeamTbcPlayers, leonardStanleyEvents } from "../../lib/realTeamData"

type Props = { onNavigate: (tab: WorkspaceTab) => void }

const players = getActiveU11Players()
const continuingTbc = getContinuingTeamTbcPlayers()
const nextEvent = leonardStanleyEvents[0]

export default function HomeMissionControl({ onNavigate }: Props) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good Morning Mike" : hour < 18 ? "Good Afternoon Mike" : "Good Evening Mike"
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })

  return (
    <div style={{ display: "grid", gap: 16, paddingBottom: 120 }}>
      <PremiumWorkspaceHeader
        eyebrow="FOOTBALL OS · HOME"
        title={greeting}
        description="Your U11 Girls command centre for the next session, squad status and the tools you use most."
        badge="Real team data"
        meta={`Leonard Stanley U11 Girls · ${today}`}
      />

      <TeamContextHeader currentSection="Home" nextEventLabel={`${nextEvent.title}: ${nextEvent.dateLabel}`} />

      <section style={overviewPanel}>
        <div style={sectionHeader}>
          <div>
            <div style={eyebrow}>TEAM SNAPSHOT</div>
            <h2 style={sectionTitle}>At a glance</h2>
          </div>
          <div style={statusPill}>U11 Girls</div>
        </div>
        <div style={statsGrid}>
          <StatTile label="Confirmed" value={players.length.toString()} note="Active squad" />
          <StatTile label="Team TBC" value={continuingTbc.length.toString()} note="Needs decision" />
          <StatTile label="Matches" value="0" note="New season" />
          <StatTile label="Training" value="1" note="Next event" />
        </div>
      </section>

      <section style={panel}>
        <div style={sectionHeader}>
          <div>
            <div style={eyebrow}>QUICK ACCESS</div>
            <h2 style={sectionTitle}>Coach tools</h2>
          </div>
          <div style={statusPill}>6 shortcuts</div>
        </div>
        <div style={quickGrid}>
          <QuickAction label="Training" note="Plan & attendance" icon={<Dumbbell size={19} />} onClick={() => onNavigate("training")} />
          <QuickAction label="Matchday" note="Live match centre" icon={<Trophy size={19} />} onClick={() => onNavigate("matchday")} />
          <QuickAction label="Attendance" note="Session register" icon={<ClipboardCheck size={19} />} onClick={() => onNavigate("training")} />
          <QuickAction label="Players" note="Squad & roles" icon={<Users size={19} />} onClick={() => onNavigate("players")} />
          <QuickAction label="Calendar" note="Fixtures & events" icon={<CalendarDays size={19} />} onClick={() => onNavigate("club")} />
          <QuickAction label="Parents" note="Club communications" icon={<MessageSquare size={19} />} onClick={() => onNavigate("club")} />
        </div>
      </section>

      <section style={eventPanel}>
        <div style={sectionHeader}>
          <div>
            <div style={eyebrow}>NEXT EVENT</div>
            <h2 style={sectionTitle}>{nextEvent.title}</h2>
          </div>
          <div style={eventDate}>{nextEvent.dateLabel}</div>
        </div>
        <div style={eventGrid}>
          <EventDetail label="Time" value={nextEvent.timeLabel ?? "TBC"} />
          <EventDetail label="Location" value={nextEvent.location ?? "TBC"} />
          <EventDetail label="Notes" value={nextEvent.notes ?? "No notes added"} />
        </div>
      </section>

      <section style={panel}>
        <div style={sectionHeader}>
          <div>
            <div style={eyebrow}>DATA STATUS</div>
            <h2 style={sectionTitle}>Real team record</h2>
          </div>
          <div style={goodPill}>Connected</div>
        </div>
        <div style={feedGrid}>
          <FeedItem title="Confirmed squad" detail="10 confirmed U11 Lionesses" />
          <FeedItem title="Team decision" detail="1 continuing player with final team TBC" />
          <FeedItem title="Season statistics" detail="Starts empty and grows only from real recorded matches" />
        </div>
      </section>
    </div>
  )
}

function StatTile({ label, value, note }: { label: string; value: string; note: string }) {
  return <div style={statTile}><div style={statLabel}>{label}</div><div style={statValue}>{value}</div><div style={statNote}>{note}</div></div>
}

function QuickAction({ label, note, icon, onClick }: { label: string; note: string; icon: React.ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} style={quickAction}><span style={iconBox}>{icon}</span><span><strong style={{ display: "block", fontSize: 15 }}>{label}</strong><small style={{ color: "rgba(226,232,240,.6)", fontWeight: 750 }}>{note}</small></span><span style={arrow}>→</span></button>
}

function EventDetail({ label, value }: { label: string; value: string }) {
  return <div style={eventDetail}><div style={statLabel}>{label}</div><div style={{ marginTop: 5, fontWeight: 900, lineHeight: 1.35 }}>{value}</div></div>
}

function FeedItem({ title, detail }: { title: string; detail: string }) {
  return <div style={feedItem}><div style={{ fontWeight: 950 }}>{title}</div><div style={{ marginTop: 4, color: "rgba(226,232,240,.66)", lineHeight: 1.4 }}>{detail}</div></div>
}

const panel = { borderRadius: 26, padding: 17, background: "rgba(15,23,42,.9)", border: "1px solid rgba(148,163,184,.14)", boxShadow: "0 18px 40px rgba(0,0,0,.16)" }
const overviewPanel = { ...panel, background: "radial-gradient(circle at top right,rgba(37,99,235,.18),transparent 42%),rgba(15,23,42,.92)" }
const eventPanel = { ...panel, background: "radial-gradient(circle at top right,rgba(124,58,237,.22),transparent 42%),rgba(15,23,42,.92)" }
const sectionHeader = { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }
const eyebrow = { fontSize: 11, fontWeight: 950, letterSpacing: 1, color: "#bfdbfe" }
const sectionTitle = { margin: "4px 0 0", fontSize: 22, letterSpacing: -.4 }
const statusPill = { borderRadius: 999, padding: "8px 10px", background: "rgba(37,99,235,.18)", color: "#bfdbfe", fontSize: 11, fontWeight: 950, whiteSpace: "nowrap" as const }
const goodPill = { ...statusPill, background: "rgba(22,101,52,.28)", color: "#86efac" }
const statsGrid = { display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 9, marginTop: 14 }
const statTile = { borderRadius: 18, padding: 13, background: "rgba(2,6,23,.46)", border: "1px solid rgba(148,163,184,.1)" }
const statLabel = { color: "rgba(226,232,240,.58)", fontSize: 11, fontWeight: 900 }
const statValue = { marginTop: 5, fontSize: 27, fontWeight: 950, letterSpacing: -.8 }
const statNote = { marginTop: 3, color: "rgba(226,232,240,.56)", fontSize: 11, fontWeight: 750 }
const quickGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 9, marginTop: 14 }
const quickAction = { border: "1px solid rgba(148,163,184,.11)", borderRadius: 19, padding: 12, background: "rgba(2,6,23,.46)", color: "white", cursor: "pointer", display: "grid", gridTemplateColumns: "40px 1fr auto", gap: 10, alignItems: "center", textAlign: "left" as const, touchAction: "manipulation" }
const iconBox = { width: 40, height: 40, borderRadius: 14, display: "grid", placeItems: "center", background: "linear-gradient(135deg,rgba(37,99,235,.82),rgba(124,58,237,.78))", color: "white" }
const arrow = { color: "#93c5fd", fontWeight: 950, fontSize: 18 }
const eventDate = { ...statusPill, background: "rgba(124,58,237,.2)", color: "#ddd6fe" }
const eventGrid = { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 9, marginTop: 14 }
const eventDetail = { borderRadius: 17, padding: 12, background: "rgba(2,6,23,.42)", border: "1px solid rgba(148,163,184,.09)" }
const feedGrid = { display: "grid", gap: 8, marginTop: 14 }
const feedItem = { borderRadius: 17, padding: 12, background: "rgba(2,6,23,.44)", border: "1px solid rgba(148,163,184,.09)" }
