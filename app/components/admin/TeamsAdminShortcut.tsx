"use client"

type Props = {
  onOpenTeams?: () => void
}

export default function TeamsAdminShortcut({ onOpenTeams }: Props) {
  return (
    <section className="sharks-glass sharks-card-shine" style={{ borderRadius: 24, padding: 16, display: "grid", gap: 10, border: "1px solid rgba(125,211,252,0.22)" }}>
      <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".15em", textTransform: "uppercase" }}>
        Club Teams
      </div>
      <div style={{ color: "white", fontSize: 22, fontWeight: 1000 }}>
        Manage Team Setup
      </div>
      <div style={{ color: "#cbd5e1", fontWeight: 750 }}>
        Add and maintain boys, girls, mixed and multiple squads by age group.
      </div>
      <button onClick={onOpenTeams} style={{ border: "1px solid rgba(56,189,248,0.45)", background: "rgba(14,165,233,0.14)", color: "#bae6fd", borderRadius: 14, padding: "10px 12px", fontWeight: 1000 }}>
        Open Teams Manager
      </button>
    </section>
  )
}
