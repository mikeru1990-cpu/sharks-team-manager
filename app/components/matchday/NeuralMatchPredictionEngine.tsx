"use client"

import { Activity, BrainCircuit, TrendingUp } from "lucide-react"
import OperationalCard from "../ui/OperationalCard"
import { eliteTheme } from "../../lib/eliteTheme"

const predictions = [
  {
    title: "Win Probability",
    value: "78%",
    icon: TrendingUp,
    color: "#22c55e",
  },
  {
    title: "Neural Match Engine",
    value: "Processing",
    icon: BrainCircuit,
    color: "#8b5cf6",
  },
  {
    title: "Pressure Analysis",
    value: "Elevated",
    icon: Activity,
    color: "#ef4444",
  },
]

export default function NeuralMatchPredictionEngine() {
  return (
    <OperationalCard
      title="Neural Match Prediction Engine"
      subtitle="AI-powered tactical prediction systems"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {predictions.map((prediction) => {
          const Icon = prediction.icon

          return (
            <div
              key={prediction.title}
              style={{
                padding: 16,
                borderRadius: 18,
                background: "rgba(15,23,42,0.62)",
                border: `1px solid ${eliteTheme.colors.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: `${prediction.color}22`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} color={prediction.color} />
                </div>

                <div>
                  <div style={{ fontWeight: 800 }}>
                    {prediction.title}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      opacity: 0.72,
                    }}
                  >
                    Tactical prediction systems live
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontWeight: 900,
                  color: prediction.color,
                }}
              >
                {prediction.value}
              </div>
            </div>
          )
        })}
      </div>
    </OperationalCard>
  )
}
