"use client"

type Props = {
  seasons: any[]
  activeSeasonId: string
  onChange: (id: string) => void
  onCreate: () => void
}

export default function SeasonSwitcher({
  seasons,
  activeSeasonId,
  onChange,
  onCreate,
}: Props) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #dbe3ef",
        borderRadius: 24,
        padding: 16,
        boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: "#64748b",
            textTransform: "uppercase",
          }}
        >
          Active Season
        </div>
        <div style={{ marginTop: 4, fontSize: 22, fontWeight: 900 }}>
          {seasons.find((s) => s.id === activeSeasonId)?.name || "No season"}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select
          value={activeSeasonId}
          onChange={(e) => onChange(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 14,
            border: "1px solid #cbd5e1",
            background: "white",
            fontSize: 15,
            fontWeight: 700,
            minWidth: 180,
          }}
        >
          {seasons.map((season) => (
            <option key={season.id} value={season.id}>
              {season.name}
            </option>
          ))}
        </select>

        <button
          onClick={onCreate}
          style={{
            padding: "12px 16px",
            borderRadius: 16,
            border: "none",
            background: "#06245c",
            color: "white",
            fontWeight: 800,
            fontSize: 16,
          }}
        >
          New Season
        </button>
      </div>
    </div>
  )
}
