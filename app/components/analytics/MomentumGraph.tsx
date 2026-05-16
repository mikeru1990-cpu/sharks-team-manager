"use client"

export type MomentumPoint = {
  minute: number
  value: number
}

type Props = {
  points: MomentumPoint[]
}

function buildPath(points: MomentumPoint[], width: number, height: number) {
  if (points.length === 0) return ""

  const maxMinute = Math.max(...points.map((p) => p.minute), 1)

  return points
    .map((point, index) => {
      const x = (point.minute / maxMinute) * width
      const y = height / 2 - point.value * (height / 2.4)

      return `${index === 0 ? "M" : "L"} ${x} ${y}`
    })
    .join(" ")
}

export default function MomentumGraph({ points }: Props) {
  const width = 900
  const height = 240

  const path = buildPath(points, width, height)

  return (
    <div
      style={{
        borderRadius: 30,
        border: "1px solid rgba(148,163,184,0.12)",
        background: "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.92))",
        padding: 24,
        boxShadow: "0 26px 60px rgba(0,0,0,0.45)",
        overflow: "hidden",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <div
            style={{
              color: "white",
              fontWeight: 900,
              fontSize: 24,
              marginBottom: 4,
            }}
          >
            Live Momentum
          </div>

          <div
            style={{
              color: "rgba(226,232,240,0.7)",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Tactical pressure and match control swings
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#3b82f6",
              boxShadow: "0 0 18px rgba(59,130,246,0.8)",
            }}
          />

          <div
            style={{
              color: "#bfdbfe",
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            Sharks Momentum
          </div>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          overflowX: "auto",
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{
            width: "100%",
            minWidth: 700,
            height: 260,
          }}
        >
          <defs>
            <linearGradient id="momentumFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(59,130,246,0.35)" />
              <stop offset="100%" stopColor="rgba(59,130,246,0.02)" />
            </linearGradient>
          </defs>

          {[0.2, 0.4, 0.6, 0.8].map((line) => (
            <line
              key={line}
              x1="0"
              y1={height * line}
              x2={width}
              y2={height * line}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          ))}

          <line
            x1="0"
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="2"
          />

          <path
            d={`${path} L ${width} ${height / 2} L 0 ${height / 2} Z`}
            fill="url(#momentumFill)"
          />

          <path
            d={path}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="5"
            strokeLinecap="round"
            style={{
              filter: "drop-shadow(0 0 12px rgba(59,130,246,0.75))",
            }}
          />

          {points.map((point) => {
            const maxMinute = Math.max(...points.map((p) => p.minute), 1)
            const x = (point.minute / maxMinute) * width
            const y = height / 2 - point.value * (height / 2.4)

            return (
              <g key={`${point.minute}-${point.value}`}>
                <circle
                  cx={x}
                  cy={y}
                  r="7"
                  fill="#60a5fa"
                  style={{
                    filter: "drop-shadow(0 0 12px rgba(96,165,250,0.9))",
                  }}
                />

                <text
                  x={x}
                  y={height - 14}
                  textAnchor="middle"
                  fill="rgba(226,232,240,0.7)"
                  fontSize="12"
                  fontWeight="700"
                >
                  {point.minute}'
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
