"use client"

import { useState } from "react"
import { ArrowRightLeft, CheckCircle2, UserPlus } from "lucide-react"

const substitutions = [
  {
    playerOut: "Emily",
    playerIn: "Isla",
    reason: "Critical fatigue threshold reached",
  },
  {
    playerOut: "Sophia",
    playerIn: "Lily",
    reason: "Tactical transition restructuring",
  },
]

export default function LiveSubstitutionEngine() {
  const [activeSub, setActiveSub] = useState(0)

  const selectedSub = substitutions[activeSub]

  return (
    <div
      style={{
        borderRadius: 30,
        padding: 22,
        background: "rgba(2,6,23,0.92)",
        border: "1px solid rgba(148,163,184,0.12)",
        backdropFilter: "blur(24px)",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            LIVE SUBSTITUTION ORCHESTRATION
          </div>

          <div style={{ fontSize: 26, fontWeight: 900 }}>
            Live Substitution Engine
          </div>
        </div>

        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 18,
            background: "rgba(37,99,235,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowRightLeft size={24} />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
        }}
      >
        {substitutions.map((sub, index) => (
          <button
            key={sub.playerOut}
            onClick={() => setActiveSub(index)}
            style={{
              border: "none",
              borderRadius: 18,
              padding: "12px 16px",
              background:
                activeSub === index
                  ? "linear-gradient(135deg,#2563eb,#7c3aed)"
                  : "rgba(15,23,42,0.82)",
              color: "white",
              fontWeight: 800,
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            {sub.playerOut} → {sub.playerIn}
          </button>
        ))}
      </div>

      <div
        style={{
          borderRadius: 24,
          padding: 20,
          background: "rgba(15,23,42,0.82)",
          border: "1px solid rgba(148,163,184,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              ACTIVE CHANGE
            </div>

            <div style={{ fontWeight: 900, fontSize: 24 }}>
              {selectedSub.playerOut} → {selectedSub.playerIn}
            </div>
          </div>

          <div
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              background: "rgba(34,197,94,0.18)",
              color: "#22c55e",
              fontWeight: 800,
              fontSize: 12,
            }}
          >
            READY
          </div>
        </div>

        <div
          style={{
            lineHeight: 1.7,
            opacity: 0.9,
            fontWeight: 700,
          }}
        >
          {selectedSub.reason}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <button
            style={{
              border: "none",
              borderRadius: 18,
              padding: "14px 16px",
              background: "linear-gradient(135deg,#22c55e,#16a34a)",
              color: "white",
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: "pointer",
            }}
          >
            <CheckCircle2 size={18} />
            Confirm
          </button>

          <button
            style={{
              border: "none",
              borderRadius: 18,
              padding: "14px 16px",
              background: "rgba(37,99,235,0.18)",
              color: "white",
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: "pointer",
            }}
          >
            <UserPlus size={18} />
            Queue Next
          </button>
        </div>
      </div>
    </div>
  )
}
