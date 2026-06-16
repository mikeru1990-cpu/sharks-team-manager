"use client"

import type { TeamIdentity } from "../../lib/teamAccess"

type Props = {
  team?: TeamIdentity | null
}

export default function TeamEditorPanel({ team }: Props) {
  if (!team) {
    return (
      <div className="sharks-glass" style={{ borderRadius: 20, padding: 16 }}>
        Select a team to edit.
      </div>
    )
  }

  return (
    <section className="sharks-glass sharks-card-shine" style={{ borderRadius: 24, padding: 16, display: "grid", gap: 12 }}>
      <div style={{ color: 'white', fontSize: 22, fontWeight: 1000 }}>
        {team.displayName || team.name}
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ color: '#94a3b8' }}>Age Group: {team.ageGroup}</div>
        <div style={{ color: '#94a3b8' }}>Section: {team.section}</div>
        <div style={{ color: '#94a3b8' }}>Squad: {team.squadName}</div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button style={{ borderRadius: 12, padding: '10px 12px' }}>Change Badge</button>
        <button style={{ borderRadius: 12, padding: '10px 12px' }}>Change Wallpaper</button>
        <button style={{ borderRadius: 12, padding: '10px 12px' }}>Team Colours</button>
      </div>
    </section>
  )
}
