"use client"

const sections = [
  "Teams",
  "Coaches",
  "Parents",
  "Registrations",
  "Fixtures",
  "Competitions",
  "Club Settings",
]

export default function ClubScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 132 }}>
      <div>
        <div style={{ opacity: 0.72, fontSize: 12, fontWeight: 900, letterSpacing: 0.8 }}>
          CLUB WORKSPACE
        </div>
        <h1 style={{ margin: "6px 0 4px", fontSize: 34, letterSpacing: -1.2 }}>Club</h1>
        <p style={{ margin: 0, color: "rgba(226,232,240,0.72)", lineHeight: 1.5 }}>
          Administration for teams, coaches, parents, fixtures, competitions and club settings.
        </p>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {sections.map((section) => (
          <button
            key={section}
            style={{
              textAlign: "left",
              border: "1px solid rgba(148,163,184,0.14)",
              borderRadius: 22,
              padding: 17,
              color: "white",
              background: "rgba(15,23,42,0.88)",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 900 }}>{section}</div>
            <div style={{ marginTop: 6, color: "rgba(226,232,240,0.68)", lineHeight: 1.45 }}>
              Build out {section.toLowerCase()} tools as the platform grows from team app to club operating system.
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
