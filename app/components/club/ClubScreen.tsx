"use client"

import { availableClubs, getTeamsForClub, resolvePlatformContext } from "../../lib/platformContext"
import { recoveryBoard } from "../../lib/recoveryBoard"
import PremiumWorkspaceHeader from "../ui/PremiumWorkspaceHeader"

const adminSections = ["Coaches", "Parents", "Registrations", "Fixtures", "Competitions", "Club Settings"]

export default function ClubScreen() {
  const context = resolvePlatformContext()
  const teams = getTeamsForClub(context.club.id)

  return (
    <div style={{ display: "grid", gap: 16, paddingBottom: 132 }}>
      <PremiumWorkspaceHeader
        eyebrow="CLUB WORKSPACE"
        title="Club & Administration"
        description="Club-wide tools, team context, fixtures, registrations and permissions live here, separate from the U11 team-only coaching views."
        badge="Club level"
        meta={`${context.club.name} · ${context.team.season}`}
      />

      <section style={panelStyle}>
        <div style={sectionHeader}>
          <div>
            <div style={label}>ACTIVE CONTEXT</div>
            <div style={clubName}>{context.club.name}</div>
            <div style={subtle}>{context.team.name} · {context.team.season}</div>
          </div>
          <div style={pillStyle}>{context.team.ageGroup}</div>
        </div>
        <div style={metricGrid}>
          <Metric label="Clubs" value={availableClubs.length.toString()} />
          <Metric label="Teams" value={teams.length.toString()} />
          <Metric label="Active Team" value={context.team.ageGroup} />
        </div>
      </section>

      <section style={panelStyle}>
        <div style={sectionHeader}>
          <div>
            <h2 style={sectionTitle}>Recovery Board</h2>
            <p style={subtle}>Function status across Football OS.</p>
          </div>
          <div style={pillStyle}>V1 Recovery</div>
        </div>
        <div style={recoveryGrid}>
          {recoveryBoard.map((item) => (
            <div key={item.area} style={recoveryCard}>
              <div style={sectionHeader}>
                <div style={{ fontSize: 18, fontWeight: 950 }}>{item.area}</div>
                <div style={pillStyle}>{item.progress}%</div>
              </div>
              <div style={progressTrack}><div style={{ ...progressFill, width: `${Math.max(0, Math.min(100, item.progress))}%` }} /></div>
              <p style={subtle}>{item.nextAction}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={panelStyle}>
        <div style={sectionHeader}>
          <div>
            <h2 style={sectionTitle}>Club tools</h2>
            <p style={subtle}>Open the club-level areas without mixing them into team coaching screens.</p>
          </div>
          <div style={pillStyle}>{adminSections.length} areas</div>
        </div>
        <div style={adminGrid}>
          {adminSections.map((section) => (
            <button key={section} type="button" style={adminButton}>
              <div style={{ fontSize: 18, fontWeight: 950 }}>{section}</div>
              <div style={subtle}>Club-level {section.toLowerCase()} workspace.</div>
              <span style={openLabel}>Open →</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

const panelStyle = { borderRadius: 26, padding: 17, background: "rgba(15,23,42,.9)", border: "1px solid rgba(148,163,184,.14)", boxShadow: "0 18px 40px rgba(0,0,0,.16)" }
const sectionHeader = { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }
const label = { fontSize: 11, color: "#bfdbfe", fontWeight: 950, letterSpacing: 1 }
const clubName = { marginTop: 7, fontSize: 25, fontWeight: 950, letterSpacing: -.5 }
const sectionTitle = { margin: 0, fontSize: 22, letterSpacing: -.4 }
const subtle = { margin: "5px 0 0", color: "rgba(226,232,240,.68)", lineHeight: 1.45, fontWeight: 700 }
const pillStyle = { borderRadius: 999, padding: "8px 10px", background: "rgba(37,99,235,.18)", color: "#bfdbfe", fontSize: 12, fontWeight: 900, whiteSpace: "nowrap" as const }
const metricGrid = { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginTop: 14 }
const recoveryGrid = { display: "grid", gap: 10, marginTop: 14 }
const recoveryCard = { borderRadius: 19, padding: 14, background: "rgba(2,6,23,.48)", border: "1px solid rgba(148,163,184,.1)" }
const progressTrack = { height: 7, borderRadius: 999, overflow: "hidden", background: "rgba(148,163,184,.12)", marginTop: 12 }
const progressFill = { height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#2563eb,#7c3aed)" }
const adminGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10, marginTop: 14 }
const adminButton = { textAlign: "left" as const, border: "1px solid rgba(148,163,184,.12)", borderRadius: 20, padding: 15, color: "white", background: "rgba(2,6,23,.46)", cursor: "pointer", display: "grid", gap: 5 }
const openLabel = { marginTop: 7, color: "#93c5fd", fontSize: 12, fontWeight: 950 }

function Metric({ label, value }: { label: string; value: string }) {
  return <div style={{ borderRadius: 17, padding: 12, background: "rgba(2,6,23,.48)", border: "1px solid rgba(148,163,184,.1)" }}><div style={{ color: "rgba(226,232,240,.58)", fontSize: 11, fontWeight: 900 }}>{label}</div><div style={{ marginTop: 5, fontSize: 21, fontWeight: 950 }}>{value}</div></div>
}
