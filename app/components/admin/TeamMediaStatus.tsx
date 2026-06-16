"use client"

import type { TeamIdentity } from "../../lib/teamAccess"

type Props = {
  team?: TeamIdentity | null
}

export default function TeamMediaStatus({ team }: Props) {
  if (!team) return null

  return (
    <section className="sharks-glass sharks-card-shine" style={{ borderRadius: 24, padding: 16, display: "grid", gap: 12 }}>
      <div style={{ color: "white", fontSize: 22, fontWeight: 1000 }}>
        Team Media
      </div>
      <Status label="Badge" ready={Boolean(team.badgeUrl)} />
      <Status label="Wallpaper" ready={Boolean(team.wallpaperUrl)} />
      <Status label="Team Photo" ready={Boolean(team.teamPhotoUrl)} />
    </section>
  )
}

function Status({ label, ready }: { label: string; ready: boolean }) {
  return (
    <div style={{ borderRadius: 16, padding: 12, background: "rgba(15,23,42,0.72)", border: "1px solid rgba(125,211,252,0.22)", color: ready ? "#86efac" : "#94a3b8", fontWeight: 900 }}>
      {label}: {ready ? "Set" : "Not set"}
    </div>
  )
}
