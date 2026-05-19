"use client"

import { ArrowRightLeft } from "lucide-react"
import OperationalCard from "../ui/OperationalCard"
import { eliteTheme } from "../../lib/eliteTheme"

const substitutions = [
  {
    off: "Bella",
    on: "Sophia",
    minute: "42'",
  },
  {
    off: "Lily",
    on: "Grace",
    minute: "51'",
  },
]

export default function SubstitutionPanel() {
  return (
    <OperationalCard
      title="Substitutions"
      subtitle="Live player rotation management"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {substitutions.map((sub, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 14,
              borderRadius: 14,
              background: "rgba(15,23,42,0.62)",
              border: `1px solid ${eliteTheme.colors.border}`,
            }}
          >
            <div>
              <div style={{ fontWeight: 800 }}>
                {sub.off} → {sub.on}
              </div>

              <div
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  opacity: 0.72,
                }}
              >
                Tactical rotation
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontWeight: 800,
              }}
            >
              <ArrowRightLeft size={16} />
              {sub.minute}
            </div>
          </div>
        ))}

        <button
          style={{
            border: "none",
            borderRadius: eliteTheme.radius.full,
            background: eliteTheme.gradients.primary,
            color: eliteTheme.colors.text,
            padding: "12px 14px",
            fontWeight: 800,
            cursor: "pointer",
            marginTop: 4,
          }}
        >
          Add Substitution
        </button>
      </div>
    </OperationalCard>
  )
}
