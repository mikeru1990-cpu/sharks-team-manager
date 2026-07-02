"use client"

import { CalendarDays, ClipboardCheck, Dumbbell, MessageSquare, Trophy, Users } from "lucide-react"
import TeamContextHeader from "../layout/TeamContextHeader"
import type { WorkspaceTab } from "../../lib/workspaces"
import { getActiveU11Players, getContinuingTeamTbcPlayers, leonardStanleyEvents } from "../../lib/realTeamData"

type Props = { onNavigate: (tab: WorkspaceTab) => void }

const players = getActiveU11Players()
const continuingTbc = getContinuingTeamTbcPlayers()
const nextEvent = leonardStanleyEvents[0]

const cardStyle = {
  borderRadius: 24,
  padding: 18,
  background: "rgba(15,23,42,0.88)",
  border: "1px solid rgba(148,163,184,0.14)",
}

export default function HomeMissionControl({ onNavigate }: Props) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good Morning Mike" : hour < 18 ? "Good Afternoon Mike" : "Good Evening Mike"
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 120 }}>
      <section style={{ ...cardStyle, background: "linear-gradient(135deg, rgba(37,99,235,0.34), rgba(124,58,237,0.22))" }}>
        <div style={{ color: "#bfdbfe", fontSize: 13, fontWeight: 900 }}>HOME COMMAND CENTRE</div>
        <h1 style={{ margin: "8px 0 4px", fontSize: 32 }}>{greeting}</h1>
        <p style={{ margin: 0, color: "rgba(226,232,240,0.76)", lineHeight: 1.5 }}>
          Leonard Stanley U11 Girls • {today} • Real squad data
        </p>
      </section>

      <TeamContextHeader currentSection="Home" nextEventLabel={`${nextEvent.title}: ${nextEvent.dateLabel}`} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}>
        <StatTile label="Confirmed" value={players.length.toString()} />
        <StatTile label="Team TBC" value={continuingTbc.length.toString()} />
        <StatTile label="Matches" value="0" />
        <StatTile label="Training" value="1" />
      </div>

      <section style={cardStyle}>
        <h2 style={{ margin: 0, fontSize: 21 }}>Quick Actions</h2>
        <p style={{ margin: "4px 0 14px", color: "rgba(226,232,240,0.68)" }}>Open the main workspaces.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
          <QuickAction label="Training" icon={<Dumbbell size={18} />} onClick={() => onNavigate("training")} />
          <QuickAction label="Matchday" icon={<Trophy size={18} />} onClick={() => onNavigate("matchday")} />
          <QuickAction label="Attendance" icon={<ClipboardCheck size={18} />} onClick={() => onNavigate("training")} />
          <QuickAction label="Players" icon={<Users size={18} />} onClick={() => onNavigate("players")} />
          <QuickAction label="Calendar" icon={<CalendarDays size={18} />} onClick={() => onNavigate("club")} />
          <QuickAction label="Parents" icon={<MessageSquare size={18} />} onClick={() => onNavigate("club")} />
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: 0, fontSize: 21 }}>Next Real Event</h2>
        <Feed items={[`${nextEvent.title} • ${nextEvent.dateLabel}`, `${nextEvent.timeLabel ?? "Time TBC"} • ${nextEvent.location ?? "Location TBC"}`, nextEvent.notes ?? "No notes added"]} />
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: 0, fontSize: 21 }}>Real Data Status</h2>
        <Feed items={["10 confirmed U11 Lionesses", "1 continuing player with final team TBC", "Season stats will stay empty until real matches are recorded"]} />
      </section>
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return <div style={{ ...cardStyle, padding: 14 }}><div style={{ color: "rgba(226,232,240,0.66)", fontSize: 12, fontWeight: 800 }}>{label}</div><div style={{ marginTop: 6, fontSize: 28, fontWeight: 950 }}>{value}</div></div>
}

function QuickAction({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} style={{ border: "1px solid rgba(148,163,184,0.14)", borderRadius: 18, padding: 13, background: "rgba(2,6,23,0.5)", color: "white", cursor: "pointer", fontWeight: 900, display: "flex", flexDirection: "column", gap: 8, alignItems: "center", touchAction: "manipulation" }}><span style={{ color: "#93c5fd" }}>{icon}</span>{label}</button>
}

function Feed({ items }: { items: string[] }) {
  return <div style={{ display: "grid", gap: 9, marginTop: 14 }}>{items.map((item) => <div key={item} style={{ borderRadius: 16, padding: 12, background: "rgba(2,6,23,0.45)", border: "1px solid rgba(148,163,184,0.1)", fontWeight: 800 }}>{item}</div>)}</div>
}
