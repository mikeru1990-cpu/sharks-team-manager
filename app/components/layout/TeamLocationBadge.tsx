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
    <div
      className="sharks-glass"
      style={{
        borderRadius: 20,
        padding: 10,
        display: "flex",
        alignItems: "center",
        gap: 10,
        border: "1px solid rgba(125,211,252,0.22)",
        minWidth: 0,
      }}
    >
      <div
        className="sharks-app-badge"
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          flex: "0 0 auto",
          backgroundColor: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(125,211,252,0.24)",
        }}
      />

      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ color: "#94a3b8", fontSize: 9, fontWeight: 1000, letterSpacing: ".13em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {clubName}
        </div>
        <div style={{ color: "white", fontSize: 21, fontWeight: 1000, letterSpacing: "-0.045em", lineHeight: 1.05, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {teamName}
        </div>
      </div>

      <div style={{ display: "grid", gap: 4, justifyItems: "end", flex: "0 0 auto" }}>
        <span style={{ borderRadius: 999, padding: "5px 8px", background: "rgba(14,165,233,0.12)", border: "1px solid rgba(125,211,252,0.24)", color: "#bae6fd", fontSize: 10, fontWeight: 1000, whiteSpace: "nowrap" }}>
          {roleLabel}
        </span>
        <span style={{ color: "#94a3b8", fontSize: 10, fontWeight: 900, whiteSpace: "nowrap" }}>
          {sectionLabel} · {modeLabel}
        </span>
      </div>
    </div>
  )
}
