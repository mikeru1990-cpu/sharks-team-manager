"use client"

import { Activity, Bell, CalendarDays, ClipboardCheck, Dumbbell, MessageSquare, PlayCircle, ShieldAlert, Sparkles, Trophy, Users } from "lucide-react"
import TeamContextHeader from "../layout/TeamContextHeader"
import { ACTIVE_TEAM_NAME } from "../../lib/workspaces"

const card = {
  borderRadius: 26,
  padding: 18,
  background: "rgba(15,23,42,0.88)",
  border: "1px solid rgba(148,163,184,0.14)",
  boxShadow: "0 18px 48px rgba(2,6,23,0.32)",
}

const muted = "rgba(226,232,240,0.68)"

export default function HomeMissionControl() {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good Morning Mike ☀️" : hour < 18 ? "Good Afternoon Mike 🌤️" : "Good Evening Mike 🌙"
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 132 }}>
      <section
        style={{
          borderRadius: 30,
          padding: 22,
          background: "linear-gradient(135deg, rgba(37,99,235,0.32), rgba(124,58,237,0.22))",
          border: "1px solid rgba(147,197,253,0.24)",
          boxShadow: "0 24px 70px rgba(2,6,23,0.42)",
        }}
      >
        <div style={{ color: "#bfdbfe", fontSize: 13, fontWeight: 900, letterSpacing: 0.7 }}>HOME COMMAND CENTRE</div>
        <h1 style={{ margin: "8px 0 4px", fontSize: 33, lineHeight: 1.05, letterSpacing: -1.2 }}>{greeting}</h1>
        <p style={{ margin: 0, color: "rgba(226,232,240,0.78)", lineHeight: 1.5 }}>
          {ACTIVE_TEAM_NAME} • {today} • Training focus: Passing under pressure
        </p>
      </section>

      <TeamContextHeader currentSection="Home" nextEventLabel="Training: Wednesday 17:45" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
        <StatTile label="Players" value="14" note="registered" />
        <StatTile label="Available" value="11" note="ready" tone="good" />
        <StatTile label="Pending" value="2" note="awaiting reply" tone="warn" />
        <StatTile label="Unavailable" value="1" note="not playing" tone="danger" />
      </div>

      <DashboardCard title="Today’s Focus" subtitle="Everything needed before the next session" icon={<ClipboardCheck size={20} />}>
        <div style={{ display: "grid", gap: 10 }}>
          <FocusRow label="Training Theme" value="Passing Under Pressure" status="Ready" />
          <FocusRow label="Equipment" value="Balls, bibs, cones, pop-up goals" status="Check" />
          <FocusRow label="Availability" value="11 available • 2 pending • 1 unavailable" status="Live" />
        </div>
      </DashboardCard>

      <DashboardCard title="Quick Actions" subtitle="Large touchline buttons" icon={<PlayCircle size={20} />}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10 }}>
          <QuickActionButton label="Start Training" icon={<Dumbbell size={18} />} />
          <QuickActionButton label="Start Match" icon={<Trophy size={18} />} />
          <QuickActionButton label="Attendance" icon={<ClipboardCheck size={18} />} />
          <QuickActionButton label="Players" icon={<Users size={18} />} />
          <QuickActionButton label="Calendar" icon={<CalendarDays size={18} />} />
          <QuickActionButton label="Parents" icon={<MessageSquare size={18} />} />
        </div>
      </DashboardCard>

      <DashboardCard title="AI Coach" subtitle="Smart assistant cards" icon={<Sparkles size={20} />}>
        <div style={{ display: "grid", gap: 12 }}>
          <AICoachCard tone="warn" title="Rotation" subject="Bella" detail="Played every minute in the last 3 matches." recommendation="Rest after Quarter 2." />
          <AICoachCard tone="danger" title="Attendance" subject="Ruby" detail="Missed 2 consecutive sessions." recommendation="Check availability with parent." />
          <AICoachCard tone="good" title="Development" subject="Connie" detail="Passing confidence trending up." recommendation="Give extra touches in rondos." />
          <AICoachCard tone="info" title="Goalkeeper" subject="Darcy-Rae" detail="No goalkeeper practice logged for 14 days." recommendation="Add 15 minute GK block." />
        </div>
      </DashboardCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <DashboardCard title="Upcoming" subtitle="Next items" icon={<CalendarDays size={20} />}>
          <MiniFeed items={["Wednesday Training • 17:45", "Sunday Match • meet time TBC", "Parents availability reminder", "Tournament planning"]} />
        </DashboardCard>

        <DashboardCard title="Recent Activity" subtitle="Newest first" icon={<Activity size={20} />}>
          <MiniFeed items={["Attendance updated", "Training plan edited", "Match report generated", "Player ratings completed"]} />
        </DashboardCard>
      </div>

      <DashboardCard title="Operational Alerts" subtitle="Items needing attention" icon={<Bell size={20} />}>
        <div style={{ display: "grid", gap: 10 }}>
          {["2 attendance replies missing", "Lineup not saved for Sunday", "Equipment check not completed"].map((alert) => (
            <div key={alert} style={{ display: "flex", gap: 10, alignItems: "center", borderRadius: 18, padding: 13, background: "rgba(2,6,23,0.46)", border: "1px solid rgba(245,158,11,0.22)", fontWeight: 800 }}>
              <ShieldAlert size={17} color="#fbbf24" />
              {alert}
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  )
}

function DashboardCard({ title, subtitle, icon, children }: { title: string; subtitle: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 21, fontWeight: 950 }}>{title}</h2>
          <div style={{ marginTop: 4, color: muted, fontSize: 13, fontWeight: 700 }}>{subtitle}</div>
        </div>
        <div style={{ width: 38, height: 38, borderRadius: 15, background: "rgba(37,99,235,0.2)", display: "grid", placeItems: "center", color: "#93c5fd" }}>{icon}</div>
      </div>
      {children}
    </section>
  )
}

function StatTile({ label, value, note, tone = "info" }: { label: string; value: string; note: string; tone?: "info" | "good" | "warn" | "danger" }) {
  const colours = {
    info: "rgba(37,99,235,0.2)",
    good: "rgba(34,197,94,0.2)",
    warn: "rgba(245,158,11,0.22)",
    danger: "rgba(239,68,68,0.2)",
  }

  return (
    <div style={{ ...card, padding: 14, background: colours[tone] }}>
      <div style={{ color: muted, fontSize: 12, fontWeight: 800 }}>{label}</div>
      <div style={{ marginTop: 5, fontSize: 28, fontWeight: 950 }}>{value}</div>
      <div style={{ marginTop: 2, color: muted, fontSize: 12 }}>{note}</div>
    </div>
  )
}

function FocusRow({ label, value, status }: { label: string; value: string; status: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, borderRadius: 18, padding: 13, background: "rgba(2,6,23,0.46)", border: "1px solid rgba(148,163,184,0.12)" }}>
      <div>
        <div style={{ color: muted, fontSize: 12, fontWeight: 800 }}>{label}</div>
        <div style={{ marginTop: 4, fontWeight: 900 }}>{value}</div>
      </div>
      <div style={{ height: "fit-content", borderRadius: 999, padding: "7px 10px", background: "rgba(37,99,235,0.18)", color: "#bfdbfe", fontSize: 12, fontWeight: 900 }}>{status}</div>
    </div>
  )
}

function QuickActionButton({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <button style={{ border: "1px solid rgba(148,163,184,0.14)", borderRadius: 18, padding: 13, background: "rgba(2,6,23,0.5)", color: "white", cursor: "pointer", fontWeight: 900, display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
      <span style={{ color: "#93c5fd" }}>{icon}</span>
      {label}
    </button>
  )
}

function AICoachCard({ title, subject, detail, recommendation, tone }: { title: string; subject: string; detail: string; recommendation: string; tone: "info" | "good" | "warn" | "danger" }) {
  const colour = tone === "good" ? "#22c55e" : tone === "warn" ? "#f59e0b" : tone === "danger" ? "#ef4444" : "#60a5fa"

  return (
    <div style={{ borderRadius: 20, padding: 15, background: "rgba(2,6,23,0.5)", border: `1px solid ${colour}55` }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ color: colour, fontSize: 12, fontWeight: 950, letterSpacing: 0.7 }}>{title.toUpperCase()}</div>
        <Sparkles size={15} color={colour} />
      </div>
      <div style={{ marginTop: 8, fontSize: 20, fontWeight: 950 }}>{subject}</div>
      <div style={{ marginTop: 5, color: muted }}>{detail}</div>
      <div style={{ marginTop: 10, fontWeight: 900 }}>Recommendation: {recommendation}</div>
    </div>
  )
}

function MiniFeed({ items }: { items: string[] }) {
  return (
    <div style={{ display: "grid", gap: 9 }}>
      {items.map((item) => (
        <div key={item} style={{ borderRadius: 16, padding: 12, background: "rgba(2,6,23,0.45)", border: "1px solid rgba(148,163,184,0.1)", color: "rgba(255,255,255,0.9)", fontWeight: 800 }}>
          {item}
        </div>
      ))}
    </div>
  )
}
