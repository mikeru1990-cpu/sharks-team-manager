"use client"

import { TEAM, initials, type MatchFormat, type PitchSlot, type Player } from "../lib/types"

type Props = {
  matchFormat: MatchFormat
  formation: string
  currentSlots: PitchSlot[]
  players: Player[]
  lineupMap: Record<string, string | null>
  selectedPlayerId: string | null
  onSelectPlayer: (playerId: string | null) => void
  onPlacePlayer: (slotId: string) => void
  onRemoveFromSlot: (slotId: string) => void
}

function ShirtDot({
  label,
  active = false,
  small = false,
}: {
  label: string
  active?: boolean
  small?: boolean
}) {
  const size = small ? 44 : 52

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        background: active
          ? `linear-gradient(180deg, ${TEAM.secondary} 0%, ${TEAM.primary} 100%)`
          : "rgba(255,255,255,0.96)",
        color: active ? "white" : "#0f172a",
        border: active ? "2px solid rgba(255,255,255,0.9)" : "2px solid rgba(255,255,255,0.7)",
        boxShadow: active
          ? "0 8px 18px rgba(15,23,42,0.25)"
          : "0 4px 10px rgba(15,23,42,0.12)",
        fontWeight: 900,
        fontSize: small ? 11 : 12,
      }}
    >
      {label}
    </div>
  )
}

function getRowOrder(position: PitchSlot["position"]) {
  if (position === "FWD") return 0
  if (position === "MID") return 1
  if (position === "DEF") return 2
  return 3
}

export default function PitchLineupBoard({
  currentSlots,
  players,
  lineupMap,
  selectedPlayerId,
  onSelectPlayer,
  onPlacePlayer,
  onRemoveFromSlot,
}: Props) {
  const rows = [...currentSlots]
    .sort((a, b) => getRowOrder(a.position) - getRowOrder(b.position))
    .reduce<Record<string, PitchSlot[]>>((acc, slot) => {
      if (!acc[slot.position]) acc[slot.position] = []
      acc[slot.position].push(slot)
      return acc
    }, {})

  const orderedRows = [rows.FWD || [], rows.MID || [], rows.DEF || [], rows.GK || []].filter(
    (row) => row.length > 0
  )

  return (
    <div
      style={{
        borderRadius: 28,
        overflow: "hidden",
        position: "relative",
        minHeight: 460,
        background: "linear-gradient(180deg, #1aa34a 0%, #12813a 100%)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
        padding: 18,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 18,
          border: "2px solid rgba(255,255,255,0.30)",
          borderRadius: 18,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 18,
          bottom: 18,
          width: 2,
          background: "rgba(255,255,255,0.24)",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 92,
          height: 92,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.24)",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 18,
          transform: "translateX(-50%)",
          width: "34%",
          height: 86,
          border: "2px solid rgba(255,255,255,0.24)",
          borderBottom: "none",
          borderRadius: "16px 16px 0 0",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 18,
          transform: "translateX(-50%)",
          width: "34%",
          height: 86,
          border: "2px solid rgba(255,255,255,0.24)",
          borderTop: "none",
          borderRadius: "0 0 16px 16px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: 420,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 18,
        }}
      >
        {orderedRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
              gap: 12,
              alignItems: "center",
            }}
          >
            {row.map((slot) => {
              const playerId = lineupMap[slot.id]
              const player = players.find((p) => p.id === playerId) || null

              return (
                <button
                  key={slot.id}
                  onClick={() => {
                    if (selectedPlayerId) {
                      onPlacePlayer(slot.id)
                      return
                    }

                    if (player) {
                      onRemoveFromSlot(slot.id)
                      return
                    }
                  }}
                  style={{
                    minHeight: 92,
                    borderRadius: 18,
                    border: selectedPlayerId
                      ? "2px solid rgba(191,219,254,0.95)"
                      : "1px solid rgba(255,255,255,0.24)",
                    background: selectedPlayerId
                      ? "rgba(219,234,254,0.24)"
                      : "rgba(255,255,255,0.10)",
                    display: "grid",
                    placeItems: "center",
                    padding: 8,
                  }}
                >
                  {player ? (
                    <div style={{ display: "grid", gap: 6, justifyItems: "center" }}>
                      <ShirtDot label={initials(player.name)} active />
                      <div
                        style={{
                          color: "white",
                          fontSize: 11,
                          fontWeight: 800,
                          textAlign: "center",
                          lineHeight: 1.15,
                          textShadow: "0 1px 2px rgba(0,0,0,0.25)",
                        }}
                      >
                        {player.name}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: 6, justifyItems: "center" }}>
                      <ShirtDot label="+" small />
                      <div
                        style={{
                          color: "rgba(255,255,255,0.92)",
                          fontSize: 11,
                          fontWeight: 800,
                          textAlign: "center",
                        }}
                      >
                        {slot.label}
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {selectedPlayerId ? (
        <div
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 16,
            zIndex: 3,
            padding: "10px 12px",
            borderRadius: 14,
            background: "rgba(15,23,42,0.78)",
            color: "white",
            fontSize: 13,
            fontWeight: 800,
            textAlign: "center",
            backdropFilter: "blur(8px)",
          }}
        >
          Tap a pitch slot to place selected player
        </div>
      ) : null}
    </div>
  )
}
