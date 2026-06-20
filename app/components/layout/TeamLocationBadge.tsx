"use client"

import ClubBadge from "../branding/ClubBadge"

type Props = {
  clubName?: string
  teamName?: string
  roleLabel?: string
  sectionLabel?: string
  modeLabel?: string
  primaryColour?: string
  metaLabel?: string
}

export default function TeamLocationBadge({
  clubName = "Leonard Stanley Youth FC",
  teamName = "All Teams",
  roleLabel = "Club Admin",
  sectionLabel = "Dashboard",
  modeLabel = "Club-wide view",
  primaryColour = "#38bdf8",
  metaLabel,
}: Props) {
  return (
    <div
      className="sharks-glass"
      style={{
        borderRadius: 22,
        padding: 11,
        display: "grid",
        gridTemplateColumns: "auto minmax(0,1fr) auto",
        alignItems: "center",
        gap: 10,
        border: `1px solid ${primaryColour}55`,
        minWidth: 0,
        boxShadow: `0 16px 36px ${primaryColour}14`,
      }}
    >
      <ClubBadge size={46} />

      <div style={{ minWidth: 0 }}>
        <div style={{ color: "#94a3b8", fontSize: 9, fontWeight: 1000, letterSpacing: ".13em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {clubName}
        </div>
        <div style={{ color: "white", fontSize: 21, fontWeight: 1000, letterSpacing: "-0.045em", lineHeight: 1.05, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {teamName}
        </div>
        {metaLabel ? (
          <div style={{ color: primaryColour, fontSize: 11, fontWeight: 900, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {metaLabel}
          </div>
        ) : null}
      </div>

      <div style={{ display: "grid", gap: 4, justifyItems: "end", flex: "0 0 auto" }}>
        <span style={{ borderRadius: 999, padding: "5px 8px", background: `${primaryColour}18`, border: `1px solid ${primaryColour}55`, color: "#e0f2fe", fontSize: 10, fontWeight: 1000, whiteSpace: "nowrap" }}>
          {roleLabel}
        </span>
        <span style={{ color: "#94a3b8", fontSize: 10, fontWeight: 900, whiteSpace: "nowrap" }}>
          {sectionLabel} · {modeLabel}
        </span>
      </div>
    </div>
  )
}
