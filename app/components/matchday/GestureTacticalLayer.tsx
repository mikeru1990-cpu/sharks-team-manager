"use client"

import { Move, ScanSearch, Touchpad } from "lucide-react"

const gestures = [
  {
    title: "Drag Repositioning",
    detail: "Live tactical repositioning enabled",
    icon: Move,
  },
  {
    title: "Spatial Detection",
    detail: "Gesture overlays adapting live",
    icon: ScanSearch,
  },
  {
    title: "Touch Interaction",
    detail: "Native tactical gestures active",
    icon: Touchpad,
  },
]

export default function GestureTacticalLayer() {
  return (
    <div
      style={{
        borderRadius: 28,
        padding: 20,
        background: "rgba(2,6,23,0.9)",
        border: "1px solid rgba(148,163,184,0.12)",
        backdropFilter: "blur(22px)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          INTERACTION ENGINE
        </div>

        <div style={{ fontSize: 24, fontWeight: 900 }}>
          Gesture Tactical Layer
        </div>
      </div>

      {gestures.map((gesture) => {
        const Icon = gesture.icon

        return (
          <div
            key={gesture.title}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: 16,
              borderRadius: 18,
              background: "rgba(15,23,42,0.82)",
              border: "1px solid rgba(148,163,184,0.08)",
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: "rgba(37,99,235,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={18} />
            </div>

            <div>
              <div style={{ fontWeight: 800 }}>{gesture.title}</div>
              <div style={{ opacity: 0.72, marginTop: 4 }}>
                {gesture.detail}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
