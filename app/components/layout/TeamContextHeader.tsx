"use client"

type TeamContextHeaderProps = {
  clubName?: string
  activeTeamName?: string | null
  role?: string
  currentSection?: string
  allTeamsMode?: boolean
  nextEventLabel?: string
}

export default function TeamContextHeader({
  clubName = "Leonard Stanley FC",
  activeTeamName = "Leonard Stanley U11 Girls",
  role = "Coach",
  currentSection = "Home",
  allTeamsMode = false,
  nextEventLabel = "Next training: Wednesday 17:45",
}: TeamContextHeaderProps) {
  return (
    <section
      style={{
        borderRadius: 24,
        padding: 16,
        background: "linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,41,59,0.82))",
        border: "1px solid rgba(148,163,184,0.16)",
        boxShadow: "0 18px 50px rgba(2,6,23,0.35)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900, letterSpacing: 0.8 }}>
            {clubName}
          </div>
          <h2 style={{ margin: "5px 0 0", fontSize: 22, fontWeight: 950, letterSpacing: -0.7 }}>
            {allTeamsMode ? "Club-wide view" : activeTeamName}
          </h2>
        </div>

        <div
          style={{
            borderRadius: 999,
            padding: "8px 11px",
            background: "rgba(37,99,235,0.2)",
            border: "1px solid rgba(96,165,250,0.24)",
            color: "#bfdbfe",
            fontSize: 12,
            fontWeight: 900,
            whiteSpace: "nowrap",
          }}
        >
          {role}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        <ContextPill label="Section" value={currentSection} />
        <ContextPill label="Next" value={nextEventLabel} />
      </div>
    </section>
  )
}

function ContextPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: 12,
        background: "rgba(2,6,23,0.48)",
        border: "1px solid rgba(148,163,184,0.12)",
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 11, color: "rgba(226,232,240,0.56)", fontWeight: 800 }}>{label}</div>
      <div style={{ marginTop: 5, fontSize: 13, color: "white", fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {value}
      </div>
    </div>
  )
}
