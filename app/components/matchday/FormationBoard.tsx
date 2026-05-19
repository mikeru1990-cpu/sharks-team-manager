"use client"

import OperationalCard from "../ui/OperationalCard"
import { eliteTheme } from "../../lib/eliteTheme"

const formation = {
  gk: ["Emily"],
  def: ["Bella", "Sophia"],
  mid: ["Ava", "Lily", "Grace"],
  fwd: ["Mia"],
}

function PlayerNode({ name }: { name: string }) {
  return (
    <div
      style={{
        width: 74,
        height: 74,
        borderRadius: 999,
        background: eliteTheme.gradients.primary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: eliteTheme.colors.text,
        fontWeight: 800,
        fontSize: 12,
        textAlign: "center",
        boxShadow: eliteTheme.shadows.glowBlue,
        border: `2px solid ${eliteTheme.colors.border}`,
      }}
    >
      {name}
    </div>
  )
}

export default function FormationBoard() {
  return (
    <OperationalCard
      title="Formation Board"
      subtitle="Live tactical shape"
    >
      <div
        style={{
          borderRadius: 20,
          padding: 18,
          background:
            "linear-gradient(180deg,#14532d 0%, #166534 100%)",
          border: `1px solid ${eliteTheme.colors.border}`,
          display: "flex",
          flexDirection: "column",
          gap: 28,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: 18 }}>
          {formation.fwd.map((player) => (
            <PlayerNode key={player} name={player} />
          ))}
        </div>

        <div style={{ display: "flex", gap: 18 }}>
          {formation.mid.map((player) => (
            <PlayerNode key={player} name={player} />
          ))}
        </div>

        <div style={{ display: "flex", gap: 18 }}>
          {formation.def.map((player) => (
            <PlayerNode key={player} name={player} />
          ))}
        </div>

        <div style={{ display: "flex", gap: 18 }}>
          {formation.gk.map((player) => (
            <PlayerNode key={player} name={player} />
          ))}
        </div>
      </div>
    </OperationalCard>
  )
}
