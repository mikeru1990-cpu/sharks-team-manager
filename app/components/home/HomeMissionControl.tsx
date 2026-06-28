"use client"

import { CalendarDays, ClipboardCheck, Dumbbell, MessageSquare, Sparkles, Trophy, Users } from "lucide-react"
import TeamContextHeader from "../layout/TeamContextHeader"
import { ACTIVE_TEAM_NAME } from "../../lib/workspaces"
import type { WorkspaceTab } from "../../lib/workspaces"

type Props = {
  onNavigate: (tab: WorkspaceTab) => void
}

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
          {ACTIVE_TEAM_NAME} • {today} • Training focus: Passing under pressure
        </p>
      </section>

      <TeamContextHeader currentSection="Home" nextEventLabel="Training: Wednesday 17:45" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}>
        <StatTile label="Players" value="14" />
        <StatTile label="Available" value="11" />
        <StatTile label="Pending" value="2" />
        <StatTile label="Unavailable" value="1" />
      </div>

      <section style={cardStyle}>
        <h2 style={{ margin: 0, fontSize: 21 }}>Quick Actions</h2>
        <p style={{ margin: "4px 0 14px", color: "rgba(226,232,240,0.68)" }}>Tap to open the correct workspace.</p>
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
        <h2 style={{ margin: 0, fontSize: 21, display: "flex", alignItems: "center", gap: 8 }}><Sparkles size={18} /> AI Coach</h2>
        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          <Notice tone="#f59e0b" title="Rotation" text="Bella has played every minute in the last 3 matches. Consider resting after Quarter 2." />
          <Notice tone="#ef4444" title="Attendance" text="Ruby has missed 2 consecutive sessions. Check availability with parent." />
          <Notice tone="#22c55e" title="Development" text="Connie is trending well for passing confidence. Give extra touches in rondos." />
          <Notice tone="#60a5fa" title="Goalkeeper" text="Darcy-Rae needs a 15 minute goalkeeper block this week." />
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: 0, fontSize: 21 }}>Upcoming</h2>
        <Feed items={["Wednesday Training • 17:45", "Sunday Match • meet time TBC", "Parents availability reminder"]} />
      </section>
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ ...cardStyle, padding: 14 }}>
      <div style={{ color: "rgba(226,232,240,0.66)", fontSize: 12, fontWeight: 800 }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 28, fontWeight: 950 }}>{value}</div>
    </div>
  )
}

function QuickAction({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ border: "1px solid rgba(148,163,184,0.14)", borderRadius: 18, padding: 13, background: "rgba(2,6,23,0.5)", color: "white", cursor: "pointer", fontWeight: 900, display: "flex", flexDirection: "column", gap: 8, alignItems: "center", touchAction: "manipulation" }}>
      <span style={{ color: "#93c5fd" }}>{icon}</span>
      {label}
    </button>
  )
}

function Notice({ tone, title, text }: { tone: string; title: string; text: string }) {
  return <div style={{ borderRadius: 18, padding: 14, background: "rgba(2,6,23,0.48)", border: `1px solid ${tone}55` }}><div style={{ color: tone, fontSize: 12, fontWeight: 950 }}>{title.toUpperCase()}</div><div style={{ marginTop: 6, color: "rgba(255,255,255,0.9)", lineHeight: 1.45 }}>{text}</div></div>
}

function Feed({ items }: { items: string[] }) {
  return <div style={{ display: "grid", gap: 9, marginTop: 14 }}>{items.map((item) => <div key={item} style={{ borderRadius: 16, padding: 12, background: "rgba(2,6,23,0.45)", border: "1px solid rgba(148,163,184,0.1)", fontWeight: 800 }}>{item}</div>)}</div>
}
