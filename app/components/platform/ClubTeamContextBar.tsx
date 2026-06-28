"use client"

import { defaultPlatformContext, getTeamDisplayName } from "../../lib/platform"

type Props = {
  currentSection?: string
}

export default function ClubTeamContextBar({ currentSection = "Home" }: Props) {
  const context = defaultPlatformContext

  return (
    <section
      style={{
        borderRadius: 22,
        padding: 14,
        background: "rgba(15,23,42,0.88)",
        border: "1px solid rgba(148,163,184,0.14)",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 12,
        alignItems: "center",
      }}
    >
      <div>
        <div style={{ color: "rgba(226,232,240,0.62)", fontSize: 11, fontWeight: 900, letterSpacing: 0.8 }}>
          CLUB PORTAL CONTEXT
        </div>
        <div style={{ marginTop: 5, fontSize: 18, fontWeight: 950 }}>
          {context.club.name}
        </div>
        <div style={{ marginTop: 3, color: "rgba(226,232,240,0.72)", fontSize: 13, fontWeight: 800 }}>
          {getTeamDisplayName(context.team)} · {currentSection}
        </div>
      </div>

      <div
        style={{
          borderRadius: 999,
          padding: "8px 10px",
          background: "rgba(37,99,235,0.18)",
          border: "1px solid rgba(96,165,250,0.24)",
          color: "#bfdbfe",
          fontSize: 12,
          fontWeight: 900,
          whiteSpace: "nowrap",
        }}
      >
        Head Coach
      </div>
    </section>
  )
}
