"use client"

type Props = {
  clubName?: string
  teamName?: string
  roleLabel?: string
  sectionLabel?: string
  modeLabel?: string
}

export default function TeamLocationBadge({
  clubName = "Leonard Stanley Youth FC",
  teamName = "All Teams",
  roleLabel = "Club Admin",
  sectionLabel = "Dashboard",
  modeLabel = "Club-wide view",
}: Props) {
  return (
    <div className="sharks-glass sharks-card-shine" style={{ borderRadius: 24, padding: 14, display: "grid", gap: 8, border: "1px solid rgba(125,211,252,0.22)" }}>
      <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 1000, letterSpacing: ".15em", textTransform: "uppercase" }}>
        {clubName}
      </div>
      <div style={{ color: "white", fontSize: 24, fontWeight: 1000, letterSpacing: "-0.04em" }}>
        {teamName}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[roleLabel, sectionLabel, modeLabel].map((label) => (
          <span key={label} style={{ borderRadius: 999, padding: "7px 10px", background: "rgba(14,165,233,0.12)", border: "1px solid rgba(125,211,252,0.24)", color: "#bae6fd", fontSize: 12, fontWeight: 900 }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
