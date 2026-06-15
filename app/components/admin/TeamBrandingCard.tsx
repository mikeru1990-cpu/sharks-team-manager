"use client"

import type { TeamIdentity } from "../../lib/teamAccess"

export default function TeamBrandingCard({ team }: { team: TeamIdentity }) {
  return (
    <div className="sharks-glass sharks-card-shine" style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(125,211,252,0.22)' }}>
      <div style={{ height: 140, background: team.primaryColour || '#0ea5e9' }} />
      <div style={{ padding: 16 }}>
        <h3 style={{ color: 'white', margin: 0 }}>{team.displayName || team.name}</h3>
        <p style={{ color: '#cbd5e1' }}>Badge, wallpaper and team colours coming from team settings.</p>
      </div>
    </div>
  )
}