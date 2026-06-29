"use client"

import { availableClubs, availableTeams, getTeamsForClub, resolvePlatformContext } from "../../lib/platformContext"

const adminSections = ["Coaches", "Parents", "Registrations", "Fixtures", "Competitions", "Club Settings"]

export default function ClubScreen() {
  const context = resolvePlatformContext()
  const teams = getTeamsForClub(context.club.id)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 132 }}>
      <div>
        <div style={{ opacity: 0.72, fontSize: 12, fontWeight: 900, letterSpacing: 0.8 }}>CLUB WORKSPACE</div>
        <h1 style={{ margin: "6px 0 4px", fontSize: 34, letterSpacing: -1.2 }}>Club</h1>
        <p style={{ margin: 0, color: "rgba(226,232,240,0.72)", lineHeight: 1.5 }}>
          Multi-club foundations, teams, coaches, parents and administration.
        </p>
      </div>

      <section style={panelStyle}>
        <div style={{ fontSize: 12, color: "rgba(226,232,240,0.62)", fontWeight: 900 }}>ACTIVE CLUB</div>
        <div style={{ marginTop: 7, fontSize: 24, fontWeight: 950 }}>{context.club.name}</div>
        <div style={{ marginTop: 4, color: "rgba(226,232,240,0.7)", fontWeight: 800 }}>{context.organisation.name}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginTop: 14 }}>
          <Metric label="Clubs" value={availableClubs.length.toString()} />
          <Metric label="Teams" value={teams.length.toString()} />
          <Metric label="Active Team" value={context.team.ageGroup} />
        </div>
      </section>

      <section style={panelStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22 }}>Teams</h2>
            <p style={{ margin: "5px 0 0", color: "rgba(226,232,240,0.68)" }}>Reference teams inside the active club.</p>
          </div>
          <div style={pillStyle}>Build 22.3</div>
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          {teams.map((team) => (
            <div key={team.id} style={{ borderRadius: 18, padding: 14, background: "rgba(2,6,23,0.48)", border: "1px solid rgba(148,163,184,0.12)" }}>
              <div style={{ fontSize: 18, fontWeight: 950 }}>{team.name}</div>
              <div style={{ marginTop: 4, color: "rgba(226,232,240,0.68)", fontWeight: 800 }}>{team.ageGroup} · {team.gender} · {team.season}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: "grid", gap: 12 }}>
        {adminSections.map((section) => (
          <button key={section} type="button" style={{ textAlign: "left", border: "1px solid rgba(148,163,184,0.14)", borderRadius: 22, padding: 17, color: "white", background: "rgba(15,23,42,0.88)", cursor: "pointer" }}>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{section}</div>
            <div style={{ marginTop: 6, color: "rgba(226,232,240,0.68)", lineHeight: 1.45 }}>
              Next step: connect {section.toLowerCase()} to club/team permissions and real data.
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

const panelStyle = {
  borderRadius: 24,
  padding: 18,
  background: "rgba(15,23,42,0.88)",
  border: "1px solid rgba(148,163,184,0.14)",
}

const pillStyle = {
  borderRadius: 999,
  padding: "8px 10px",
  background: "rgba(37,99,235,0.18)",
  color: "#bfdbfe",
  fontSize: 12,
  fontWeight: 900,
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderRadius: 16, padding: 12, background: "rgba(2,6,23,0.48)", border: "1px solid rgba(148,163,184,0.1)" }}>
      <div style={{ color: "rgba(226,232,240,0.58)", fontSize: 11, fontWeight: 900 }}>{label}</div>
      <div style={{ marginTop: 5, fontSize: 21, fontWeight: 950 }}>{value}</div>
    </div>
  )
}
