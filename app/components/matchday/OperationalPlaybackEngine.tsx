"use client"

import { PauseCircle, PlayCircle, SkipForward, Waves } from "lucide-react"

const playbackMoments = [
  {
    time: "07:42",
    title: "Press activation",
    detail: "Midfield compactness increased by 18%",
  },
  {
    time: "09:18",
    title: "Transition acceleration",
    detail: "Right-side transition lane opened",
  },
  {
    time: "11:05",
    title: "Shape restructuring",
    detail: "Formation shifted into defensive recovery",
  },
]

export default function OperationalPlaybackEngine() {
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
            TACTICAL PLAYBACK MEMORY
          </div>

          <div style={{ fontSize: 24, fontWeight: 900 }}>
            Operational Playback Engine
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
          }}
        >
          {[PlayCircle, PauseCircle, SkipForward].map((Icon, index) => (
            <div
              key={index}
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background: "rgba(37,99,235,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={18} />
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          height: 8,
          borderRadius: 999,
          overflow: "hidden",
          background: "rgba(148,163,184,0.12)",
        }}
      >
        <div
          style={{
            width: "58%",
            height: "100%",
            background:
              "linear-gradient(90deg,#2563eb,#7c3aed,#22c55e)",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {playbackMoments.map((moment) => (
          <div
            key={moment.time}
            style={{
              borderRadius: 20,
              padding: 16,
              background: "rgba(15,23,42,0.82)",
              border: "1px solid rgba(148,163,184,0.08)",
              display: "flex",
              alignItems: "center",
              gap: 14,
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
                flexShrink: 0,
              }}
            >
              <Waves size={18} />
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <div style={{ fontWeight: 900 }}>{moment.title}</div>
                <div style={{ opacity: 0.72 }}>{moment.time}</div>
              </div>

              <div style={{ fontWeight: 700, opacity: 0.82 }}>
                {moment.detail}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
