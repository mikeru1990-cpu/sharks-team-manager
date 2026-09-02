"use client"

import { useState, type CSSProperties } from "react"
import { availableClubs, getTeamsForClub, resolvePlatformContext } from "../../lib/platformContext"
import PremiumWorkspaceHeader from "../ui/PremiumWorkspaceHeader"
import PrivacyAccountCentre from "./PrivacyAccountCentre"
import RespectCodeCentre from "./RespectCodeCentre"

type ClubView = "overview" | "respect" | "privacy"

export default function ClubScreen() {
  const [view, setView] = useState<ClubView>("overview")
  const context = resolvePlatformContext()
  const teams = getTeamsForClub(context.club.id)

  if (view === "respect") {
    return <div style={screen}><WorkspaceNav view={view} setView={setView} /><RespectCodeCentre /></div>
  }

  if (view === "privacy") {
    return <div style={screen}><WorkspaceNav view={view} setView={setView} /><PrivacyAccountCentre /></div>
  }

  return (
    <div style={screen}>
      <PremiumWorkspaceHeader
        eyebrow="CLUB WORKSPACE"
        title="Club & Administration"
        description="Standards, permissions and club-level controls in one clear workspace."
        badge="Club level"
        meta={`${context.club.name} · ${context.team.season}`}
      />

      <WorkspaceNav view={view} setView={setView} />

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
          <Metric label="Format" value={context.team.format ?? context.team.ageGroup} />
        </div>
      </section>

      <section style={panelStyle}>
        <div style={sectionHeader}>
          <div>
            <div style={label}>CLUB STANDARDS</div>
            <h2 style={sectionTitle}>Respect & safeguarding culture</h2>
            <p style={subtle}>Role-specific expectations for parents, players and coaches are kept visible and acknowledgeable inside Football OS.</p>
          </div>
          <span style={readyPill}>2026/27</span>
        </div>
        <button type="button" style={featureButton} onClick={() => setView("respect")}>
          <div><strong style={featureTitle}>Open Respect Code Centre</strong><span style={featureCopy}>Parents · Players · Coaches</span></div>
          <span style={arrow}>→</span>
        </button>
      </section>

      <section style={panelStyle}>
        <div style={sectionHeader}>
          <div>
            <div style={label}>PRIVACY & ACCOUNT</div>
            <h2 style={sectionTitle}>User data controls</h2>
            <p style={subtle}>Private youth-football data needs clear access controls, local-data controls and an in-app route to permanent account deletion.</p>
          </div>
          <span style={securePill}>Secure</span>
        </div>
        <button type="button" style={featureButton} onClick={() => setView("privacy")}>
          <div><strong style={featureTitle}>Manage privacy & account</strong><span style={featureCopy}>Device data · Privacy links · Account deletion</span></div>
          <span style={arrow}>→</span>
        </button>
      </section>

      <section style={panelStyle}>
        <div style={label}>TEAMS IN THIS CLUB</div>
        <div style={teamGrid}>
          {teams.map(team => <div key={team.id} style={teamCard}>
            <strong>{team.name}</strong>
            <span style={subtle}>{team.ageGroup} · {team.season}</span>
          </div>)}
        </div>
      </section>
    </div>
  )
}

function WorkspaceNav({ view, setView }: { view: ClubView; setView: (view: ClubView) => void }) {
  const items: { id: ClubView; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "respect", label: "Respect" },
    { id: "privacy", label: "Privacy" },
  ]
  return <nav aria-label="Club workspace" style={navStyle}>
    {items.map(item => <button key={item.id} type="button" onClick={() => setView(item.id)} style={view === item.id ? navOn : navButton}>{item.label}</button>)}
  </nav>
}

const screen: CSSProperties = { display: "grid", gap: 14, paddingBottom: 132 }
const panelStyle: CSSProperties = { borderRadius: 26, padding: 17, background: "rgba(15,23,42,.9)", border: "1px solid rgba(148,163,184,.14)", boxShadow: "0 18px 40px rgba(0,0,0,.16)", display: "grid", gap: 13 }
const sectionHeader: CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }
const label: CSSProperties = { fontSize: 11, color: "#bfdbfe", fontWeight: 950, letterSpacing: 1 }
const clubName: CSSProperties = { marginTop: 7, fontSize: 25, fontWeight: 950, letterSpacing: -.5 }
const sectionTitle: CSSProperties = { margin: "5px 0 0", fontSize: 20, letterSpacing: -.3 }
const subtle: CSSProperties = { margin: "5px 0 0", color: "rgba(226,232,240,.68)", lineHeight: 1.45, fontWeight: 700, fontSize: 12 }
const pillStyle: CSSProperties = { borderRadius: 999, padding: "8px 10px", background: "rgba(37,99,235,.18)", color: "#bfdbfe", fontSize: 12, fontWeight: 900, whiteSpace: "nowrap" }
const metricGrid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8, marginTop: 2 }
const navStyle: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5, padding: 4, borderRadius: 17, background: "#091322", border: "1px solid #1b2c43" }
const navButton: CSSProperties = { minHeight: 44, border: 0, borderRadius: 13, background: "transparent", color: "#7e91aa", fontWeight: 900 }
const navOn: CSSProperties = { ...navButton, background: "#173b70", color: "white" }
const readyPill: CSSProperties = { borderRadius: 999, padding: "7px 9px", background: "#123f32", color: "#6ee7b7", fontSize: 10, fontWeight: 950, whiteSpace: "nowrap" }
const securePill: CSSProperties = { ...readyPill, background: "#10274b", color: "#bfdbfe" }
const featureButton: CSSProperties = { width: "100%", border: "1px solid rgba(96,165,250,.22)", borderRadius: 18, padding: 14, color: "white", background: "linear-gradient(145deg,rgba(15,39,75,.88),rgba(11,24,43,.88))", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, textAlign: "left", cursor: "pointer" }
const featureTitle: CSSProperties = { display: "block", fontSize: 15, fontWeight: 950 }
const featureCopy: CSSProperties = { display: "block", marginTop: 4, color: "#8ea0b7", fontSize: 11, fontWeight: 750 }
const arrow: CSSProperties = { width: 34, height: 34, borderRadius: 99, background: "#1d4ed8", display: "grid", placeItems: "center", fontWeight: 950, flex: "0 0 auto" }
const teamGrid: CSSProperties = { display: "grid", gap: 8 }
const teamCard: CSSProperties = { borderRadius: 17, padding: 12, background: "rgba(2,6,23,.48)", border: "1px solid rgba(148,163,184,.1)", display: "grid", gap: 2 }

function Metric({ label, value }: { label: string; value: string }) {
  return <div style={{ borderRadius: 17, padding: 11, background: "rgba(2,6,23,.48)", border: "1px solid rgba(148,163,184,.1)" }}><div style={{ color: "rgba(226,232,240,.58)", fontSize: 10, fontWeight: 900 }}>{label}</div><div style={{ marginTop: 5, fontSize: 18, fontWeight: 950 }}>{value}</div></div>
}
