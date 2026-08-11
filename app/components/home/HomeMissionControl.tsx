"use client"

import type { ReactNode } from "react"
import { ArrowUpRight, CalendarDays, ClipboardCheck, Dumbbell, MessageSquare, Sparkles, Trophy, Users } from "lucide-react"
import TeamContextHeader from "../layout/TeamContextHeader"
import type { WorkspaceTab } from "../../lib/workspaces"
import { getActiveU11Players, getContinuingTeamTbcPlayers, leonardStanleyEvents } from "../../lib/realTeamData"

type Props = { onNavigate: (tab: WorkspaceTab) => void }

const players = getActiveU11Players()
const continuingTbc = getContinuingTeamTbcPlayers()
const nextEvent = leonardStanleyEvents[0]

export default function HomeMissionControl({ onNavigate }: Props) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })

  return (
    <div style={{ display: "grid", gap: 16, paddingBottom: 112 }}>
      <section style={hero}>
        <div style={heroGlow} aria-hidden="true" />
        <div style={heroTopline}>
          <div style={heroEyebrow}><Sparkles size={13} /> MISSION CONTROL</div>
          <div style={alphaPill}>PRIVATE ALPHA</div>
        </div>

        <div style={heroCopy}>
          <div>
            <div style={dateText}>{today}</div>
            <h1 style={heroTitle}>{greeting}, Mike.</h1>
            <p style={heroSubtitle}>Everything that matters for Leonard Stanley U11 Girls, in one place.</p>
          </div>
        </div>

        <div style={heroEvent}>
          <div style={{ minWidth: 0 }}>
            <div style={miniLabel}>NEXT UP</div>
            <div style={eventTitle}>{nextEvent.title}</div>
            <div style={eventMeta}>{nextEvent.dateLabel} · {nextEvent.timeLabel ?? "TBC"}</div>
            <div style={eventLocation}>{nextEvent.location ?? "Location TBC"}</div>
          </div>
          <button type="button" onClick={() => onNavigate("training")} style={launchButton}>
            Open <ArrowUpRight size={16} />
          </button>
        </div>

        <div style={kpiGrid}>
          <Kpi label="Confirmed" value={players.length.toString()} note="Active squad" />
          <Kpi label="Team TBC" value={continuingTbc.length.toString()} note="Needs decision" />
          <Kpi label="Matches" value="0" note="New season" />
          <Kpi label="Next session" value="1" note="Ready to plan" />
        </div>
      </section>

      <TeamContextHeader currentSection="Home" nextEventLabel={`${nextEvent.title}: ${nextEvent.dateLabel}`} />

      <section style={panel}>
        <div style={sectionHeader}>
          <div>
            <div style={sectionEyebrow}>FAST LANE</div>
            <h2 style={sectionTitle}>Coach tools</h2>
            <p style={sectionCopy}>The actions you need most, designed for one-tap access.</p>
          </div>
          <div style={statusPill}>6 shortcuts</div>
        </div>

        <div style={quickGrid}>
          <QuickAction label="Matchday" note="Live command centre" icon={<Trophy size={21} />} accent="blue" onClick={() => onNavigate("matchday")} />
          <QuickAction label="Training" note="Plan & attendance" icon={<Dumbbell size={21} />} accent="violet" onClick={() => onNavigate("training")} />
          <QuickAction label="Players" note="Squad, roles & profiles" icon={<Users size={21} />} accent="cyan" onClick={() => onNavigate("players")} />
          <QuickAction label="Attendance" note="Session register" icon={<ClipboardCheck size={21} />} accent="emerald" onClick={() => onNavigate("training")} />
          <QuickAction label="Calendar" note="Fixtures & events" icon={<CalendarDays size={21} />} accent="amber" onClick={() => onNavigate("club")} />
          <QuickAction label="Parents" note="Club communications" icon={<MessageSquare size={21} />} accent="rose" onClick={() => onNavigate("club")} />
        </div>
      </section>

      <section style={intelPanel}>
        <div>
          <div style={sectionEyebrow}>FOOTBALL OS INTELLIGENCE</div>
          <h2 style={sectionTitle}>Squad health</h2>
          <p style={sectionCopy}>Real team information only. No invented stats or placeholder performance data.</p>
        </div>
        <div style={intelGrid}>
          <IntelItem title="Squad ready" detail={`${players.length} confirmed players are active for the U11 squad.`} tone="good" />
          <IntelItem title="One decision pending" detail={`${continuingTbc.length} continuing player still needs a final team decision.`} tone="watch" />
          <IntelItem title="Clean season baseline" detail="Match statistics begin at zero and grow only from matches you actually record." tone="info" />
        </div>
      </section>
    </div>
  )
}

function Kpi({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div style={kpiCard}>
      <div style={kpiLabel}>{label}</div>
      <div style={kpiValue}>{value}</div>
      <div style={kpiNote}>{note}</div>
    </div>
  )
}

function QuickAction({ label, note, icon, accent, onClick }: { label: string; note: string; icon: ReactNode; accent: keyof typeof accents; onClick: () => void }) {
  const palette = accents[accent]
  return (
    <button type="button" onClick={onClick} style={quickAction}>
      <span style={{ ...iconBox, background: palette.background, color: palette.color, boxShadow: palette.shadow }}>{icon}</span>
      <span style={{ minWidth: 0 }}>
        <strong style={{ display: "block", fontSize: 15.5, letterSpacing: -0.2 }}>{label}</strong>
        <small style={{ display: "block", marginTop: 3, color: "rgba(226,232,240,.55)", fontWeight: 750, lineHeight: 1.3 }}>{note}</small>
      </span>
      <ArrowUpRight size={17} style={{ color: "rgba(191,219,254,.72)" }} />
    </button>
  )
}

function IntelItem({ title, detail, tone }: { title: string; detail: string; tone: "good" | "watch" | "info" }) {
  const dot = tone === "good" ? "#4ade80" : tone === "watch" ? "#fbbf24" : "#60a5fa"
  return (
    <div style={intelItem}>
      <span style={{ ...intelDot, background: dot, boxShadow: `0 0 0 5px ${dot}18` }} />
      <div>
        <div style={{ fontWeight: 950 }}>{title}</div>
        <div style={{ marginTop: 4, color: "rgba(226,232,240,.62)", lineHeight: 1.45, fontSize: 12.5 }}>{detail}</div>
      </div>
    </div>
  )
}

const hero = { position: "relative" as const, overflow: "hidden", borderRadius: 30, padding: 19, border: "1px solid rgba(129,140,248,.2)", background: "linear-gradient(145deg,rgba(15,23,42,.97),rgba(17,24,57,.92) 48%,rgba(23,27,70,.9))", boxShadow: "0 30px 75px rgba(2,6,23,.44),inset 0 1px 0 rgba(255,255,255,.05)" }
const heroGlow = { position: "absolute" as const, width: 300, height: 300, right: -100, top: -150, borderRadius: 999, background: "radial-gradient(circle,rgba(99,102,241,.42),rgba(37,99,235,.12) 42%,transparent 68%)", filter: "blur(4px)", pointerEvents: "none" as const }
const heroTopline = { position: "relative" as const, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }
const heroEyebrow = { display: "inline-flex", alignItems: "center", gap: 6, color: "#c7d2fe", fontSize: 10.5, fontWeight: 950, letterSpacing: 1.2 }
const alphaPill = { borderRadius: 999, padding: "6px 9px", border: "1px solid rgba(167,139,250,.2)", background: "rgba(109,40,217,.15)", color: "#ddd6fe", fontSize: 9.5, fontWeight: 950, letterSpacing: .6 }
const heroCopy = { position: "relative" as const, display: "grid", marginTop: 18 }
const dateText = { color: "rgba(226,232,240,.52)", fontSize: 11.5, fontWeight: 800 }
const heroTitle = { margin: "5px 0 0", fontSize: "clamp(30px,8vw,48px)", lineHeight: .98, letterSpacing: -1.8, fontWeight: 980 }
const heroSubtitle = { margin: "10px 0 0", maxWidth: 580, color: "rgba(226,232,240,.66)", fontSize: 13.5, lineHeight: 1.5, fontWeight: 650 }
const heroEvent = { position: "relative" as const, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, marginTop: 20, borderRadius: 22, padding: 14, border: "1px solid rgba(96,165,250,.16)", background: "linear-gradient(135deg,rgba(37,99,235,.18),rgba(2,6,23,.32))", boxShadow: "inset 0 1px 0 rgba(255,255,255,.035)" }
const miniLabel = { color: "#93c5fd", fontSize: 9.5, fontWeight: 950, letterSpacing: 1.1 }
const eventTitle = { marginTop: 4, fontSize: 18, fontWeight: 950, letterSpacing: -.3 }
const eventMeta = { marginTop: 5, color: "rgba(226,232,240,.72)", fontSize: 12, fontWeight: 800 }
const eventLocation = { marginTop: 3, color: "rgba(226,232,240,.45)", fontSize: 11.5, fontWeight: 700 }
const launchButton = { display: "inline-flex", alignItems: "center", gap: 5, flex: "0 0 auto", minHeight: 40, border: "1px solid rgba(191,219,254,.24)", borderRadius: 13, padding: "0 12px", background: "linear-gradient(145deg,#2563eb,#4f46e5)", boxShadow: "0 10px 24px rgba(37,99,235,.28)", color: "white", fontSize: 12, fontWeight: 950, cursor: "pointer" }
const kpiGrid = { position: "relative" as const, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 8, marginTop: 12 }
const kpiCard = { borderRadius: 17, padding: 12, border: "1px solid rgba(148,163,184,.09)", background: "rgba(2,6,23,.38)", backdropFilter: "blur(12px)" }
const kpiLabel = { color: "rgba(226,232,240,.48)", fontSize: 10, fontWeight: 900 }
const kpiValue = { marginTop: 4, fontSize: 25, fontWeight: 980, letterSpacing: -.8 }
const kpiNote = { marginTop: 2, color: "rgba(226,232,240,.42)", fontSize: 10.5, fontWeight: 750 }
const panel = { borderRadius: 27, padding: 17, border: "1px solid rgba(148,163,184,.11)", background: "rgba(8,15,32,.8)", boxShadow: "0 20px 50px rgba(2,6,23,.24),inset 0 1px 0 rgba(255,255,255,.035)", backdropFilter: "blur(16px)" }
const intelPanel = { ...panel, background: "radial-gradient(circle at 92% 8%,rgba(16,185,129,.10),transparent 30%),rgba(8,15,32,.84)" }
const sectionHeader = { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }
const sectionEyebrow = { color: "#93c5fd", fontSize: 10, fontWeight: 950, letterSpacing: 1.1 }
const sectionTitle = { margin: "4px 0 0", fontSize: 22, letterSpacing: -.5 }
const sectionCopy = { margin: "5px 0 0", color: "rgba(226,232,240,.52)", fontSize: 12.5, lineHeight: 1.45, fontWeight: 650 }
const statusPill = { borderRadius: 999, padding: "7px 9px", background: "rgba(37,99,235,.15)", border: "1px solid rgba(96,165,250,.14)", color: "#bfdbfe", fontSize: 10, fontWeight: 950, whiteSpace: "nowrap" as const }
const quickGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 9, marginTop: 15 }
const quickAction = { border: "1px solid rgba(148,163,184,.09)", borderRadius: 20, padding: 12, background: "linear-gradient(145deg,rgba(15,23,42,.62),rgba(2,6,23,.42))", color: "white", cursor: "pointer", display: "grid", gridTemplateColumns: "44px 1fr auto", gap: 11, alignItems: "center", textAlign: "left" as const, minHeight: 70, boxShadow: "inset 0 1px 0 rgba(255,255,255,.025)" }
const iconBox = { width: 44, height: 44, borderRadius: 15, display: "grid", placeItems: "center", border: "1px solid rgba(255,255,255,.08)" }
const intelGrid = { display: "grid", gap: 9, marginTop: 15 }
const intelItem = { display: "grid", gridTemplateColumns: "14px 1fr", gap: 10, alignItems: "start", borderRadius: 17, padding: 12, border: "1px solid rgba(148,163,184,.08)", background: "rgba(2,6,23,.34)" }
const intelDot = { width: 7, height: 7, marginTop: 5, borderRadius: 999 }
const accents = {
  blue: { background: "linear-gradient(145deg,rgba(37,99,235,.9),rgba(29,78,216,.75))", color: "#fff", shadow: "0 8px 20px rgba(37,99,235,.22)" },
  violet: { background: "linear-gradient(145deg,rgba(124,58,237,.88),rgba(79,70,229,.72))", color: "#fff", shadow: "0 8px 20px rgba(124,58,237,.2)" },
  cyan: { background: "linear-gradient(145deg,rgba(8,145,178,.85),rgba(14,116,144,.7))", color: "#ecfeff", shadow: "0 8px 20px rgba(8,145,178,.18)" },
  emerald: { background: "linear-gradient(145deg,rgba(5,150,105,.84),rgba(4,120,87,.7))", color: "#ecfdf5", shadow: "0 8px 20px rgba(5,150,105,.18)" },
  amber: { background: "linear-gradient(145deg,rgba(217,119,6,.85),rgba(180,83,9,.7))", color: "#fffbeb", shadow: "0 8px 20px rgba(217,119,6,.17)" },
  rose: { background: "linear-gradient(145deg,rgba(225,29,72,.82),rgba(190,24,93,.7))", color: "#fff1f2", shadow: "0 8px 20px rgba(225,29,72,.17)" },
}
