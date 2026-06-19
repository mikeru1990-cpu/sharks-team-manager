"use client"

import type { PitchSlot, Player } from "../../lib/types"

type Props = {
  currentSlots: PitchSlot[]
  lineupMap: Record<string, string | null>
  benchIds: string[]
  players: Player[]
}

function getPlayer(players: Player[], id?: string | null) {
  return id ? players.find((player) => player.id === id) || null : null
}

export default function MatchLineupStrip({ currentSlots, lineupMap, benchIds, players }: Props) {
  const starters = currentSlots
    .map((slot) => ({ slot, player: getPlayer(players, lineupMap?.[slot.id]) }))
    .filter((item) => item.player)
  const bench = benchIds.map((id) => getPlayer(players, id)).filter(Boolean) as Player[]

  return (
    <section className="sharks-glass sharks-card-shine" style={{ borderRadius: 24, padding: 14, display: "grid", gap: 12, border: "1px solid rgba(125,211,252,0.24)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".16em", textTransform: "uppercase" }}>Current Quarter</div>
          <div style={{ color: "white", fontSize: 22, fontWeight: 1000, marginTop: 3 }}>Starting lineup</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Pill label="On" value={starters.length} colour="#22c55e" />
          <Pill label="Bench" value={bench.length} colour="#facc15" />
        </div>
      </div>

      {starters.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: 8 }}>
          {starters.map(({ slot, player }) => (
            <div key={slot.id} style={{ borderRadius: 16, padding: 10, background: "rgba(2,6,23,0.48)", border: "1px solid rgba(148,163,184,0.16)", display: "grid", gap: 4 }}>
              <div style={{ color: "#7dd3fc", fontSize: 10, fontWeight: 1000, letterSpacing: ".09em" }}>{slot.label} • {slot.position}</div>
              <div style={{ color: "white", fontSize: 14, fontWeight: 1000, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{player?.name}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ borderRadius: 16, padding: 12, background: "rgba(2,6,23,0.40)", border: "1px dashed rgba(148,163,184,0.22)", color: "#cbd5e1", fontWeight: 800 }}>
          No starting lineup selected yet.
        </div>
      )}

      {bench.length ? (
        <div style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 850, lineHeight: 1.45 }}>
          Bench: {bench.slice(0, 8).map((player) => player.name).join(", ")}{bench.length > 8 ? ` +${bench.length - 8} more` : ""}
        </div>
      ) : null}
    </section>
  )
}

function Pill({ label, value, colour }: { label: string; value: number; colour: string }) {
  return (
    <div style={{ borderRadius: 999, padding: "7px 10px", background: `${colour}18`, border: `1px solid ${colour}55`, color: colour, fontSize: 12, fontWeight: 1000 }}>
      {label} {value}
    </div>
  )
}
