"use client"

import type { TeamIdentity } from "../../lib/teamAccess"
import { getTeamDisplayName } from "../../lib/teamAccess"

type Props = {
  team?: TeamIdentity | null
  compact?: boolean
}

export default function TeamBrandPreview({ team = null, compact = false }: Props) {
  const name = team ? getTeamDisplayName(team) : "All Teams"
  const primary = team?.primaryColour || "#0ea5e9"
  const secondary = team?.secondaryColour || "#ffffff"
  const wallpaper = team?.wallpaperUrl || ""
  const badge = team?.badgeUrl || ""

  return (
    <section
      className="sharks-card-shine"
      style={{
        borderRadius: 28,
        overflow: "hidden",
        border: `1px solid ${primary}55`,
        background: "rgba(2,6,23,0.55)",
      }}
    >
      <div
        style={{
          minHeight: compact ? 112 : 170,
          padding: 18,
          display: "grid",
          alignItems: "end",
          background: wallpaper
            ? `linear-gradient(180deg, rgba(2,6,23,0.10), rgba(2,6,23,0.88)), url(${wallpaper}) center/cover`
            : `linear-gradient(135deg, ${primary}66, rgba(2,6,23,0.92))`,
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "center", minWidth: 0 }}>
          <div
            style={{
              width: compact ? 54 : 72,
              height: compact ? 54 : 72,
              borderRadius: 22,
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
              background: "rgba(255,255,255,0.12)",
              border: `1px solid ${secondary}66`,
              color: "white",
              fontWeight: 1000,
              boxShadow: "0 18px 45px rgba(0,0,0,0.38)",
            }}
          >
            {badge ? <img src={badge} alt="Team badge" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "LS"}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ color: "#cbd5e1", fontSize: 11, fontWeight: 1000, letterSpacing: ".14em", textTransform: "uppercase" }}>
              Team Brand
            </div>
            <div style={{ color: "white", fontSize: compact ? 23 : 32, fontWeight: 1000, letterSpacing: "-0.045em", overflow: "hidden", textOverflow: "ellipsis" }}>
              {name}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
