"use client"

import { useState } from "react"
import {
  ArrowLeftRight,
  BrainCircuit,
  ChevronLeft,
  ChevronUp,
  Shield,
  Users,
} from "lucide-react"

export default function SlideOverTacticalPanels() {
  const [formationOpen, setFormationOpen] = useState(false)
  const [subsOpen, setSubsOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setFormationOpen((prev) => !prev)}
        style={{
          position: "fixed",
          left: 16,
          top: "40%",
          zIndex: 70,
          border: "none",
          borderRadius: 18,
          padding: 16,
          background: "rgba(2,6,23,0.94)",
          color: "white",
          backdropFilter: "blur(20px)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          cursor: "pointer",
        }}
      >
        <Shield size={22} />
      </button>

      <button
        onClick={() => setSubsOpen((prev) => !prev)}
        style={{
          position: "fixed",
          bottom: 18,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 70,
          border: "none",
          borderRadius: 20,
          padding: "14px 18px",
          background: "rgba(2,6,23,0.94)",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 10,
          backdropFilter: "blur(20px)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          cursor: "pointer",
        }}
      >
        <Users size={20} />
        Substitutions
      </button>

      <button
        onClick={() => setAiOpen((prev) => !prev)}
        style={{
          position: "fixed",
          right: 16,
          top: "42%",
          zIndex: 70,
          border: "none",
          borderRadius: 18,
          padding: 16,
          background: "rgba(2,6,23,0.94)",
          color: "white",
          backdropFilter: "blur(20px)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          cursor: "pointer",
        }}
      >
        <BrainCircuit size={22} />
      </button>

      <div
        style={{
          position: "fixed",
          top: 0,
          left: formationOpen ? 0 : -340,
          width: 320,
          height: "100vh",
          zIndex: 80,
          transition: "all 0.28s ease",
          background: "rgba(2,6,23,0.96)",
          backdropFilter: "blur(26px)",
          borderRight: "1px solid rgba(148,163,184,0.12)",
          padding: 22,
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
            <div style={{ fontSize: 12, opacity: 0.72 }}>
              FORMATION ORCHESTRATION
            </div>

            <div style={{ fontSize: 24, fontWeight: 900 }}>
              Tactical Shape
            </div>
          </div>

          <button
            onClick={() => setFormationOpen(false)}
            style={{
              border: "none",
              background: "transparent",
              color: "white",
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={22} />
          </button>
        </div>

        {["2-3-1", "3-2-1", "2-2-2"].map((shape) => (
          <button
            key={shape}
            style={{
              border: "none",
              borderRadius: 20,
              padding: "18px 16px",
              background: "rgba(15,23,42,0.82)",
              color: "white",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            {shape}
          </button>
        ))}
      </div>

      <div
        style={{
          position: "fixed",
          left: 12,
          right: 12,
          bottom: subsOpen ? 82 : -420,
          zIndex: 80,
          transition: "all 0.28s ease",
          borderRadius: 30,
          background: "rgba(2,6,23,0.96)",
          backdropFilter: "blur(26px)",
          border: "1px solid rgba(148,163,184,0.12)",
          padding: 22,
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
            <div style={{ fontSize: 12, opacity: 0.72 }}>
              LIVE SUBSTITUTION ORCHESTRATION
            </div>

            <div style={{ fontSize: 24, fontWeight: 900 }}>
              Tactical Changes
            </div>
          </div>

          <button
            onClick={() => setSubsOpen(false)}
            style={{
              border: "none",
              background: "transparent",
              color: "white",
              cursor: "pointer",
            }}
          >
            <ChevronUp size={22} />
          </button>
        </div>

        {[
          "Emily → fatigue threshold high",
          "Sophia → transition impact rising",
          "Ava → defensive workload escalating",
        ].map((item) => (
          <div
            key={item}
            style={{
              borderRadius: 20,
              padding: 18,
              background: "rgba(15,23,42,0.82)",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <ArrowLeftRight size={20} />
            <div style={{ fontWeight: 800 }}>{item}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          position: "fixed",
          top: 0,
          right: aiOpen ? 0 : -360,
          width: 340,
          height: "100vh",
          zIndex: 80,
          transition: "all 0.28s ease",
          background: "rgba(2,6,23,0.96)",
          backdropFilter: "blur(26px)",
          borderLeft: "1px solid rgba(148,163,184,0.12)",
          padding: 22,
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
            <div style={{ fontSize: 12, opacity: 0.72 }}>
              AI ORCHESTRATION LAYER
            </div>

            <div style={{ fontSize: 24, fontWeight: 900 }}>
              Tactical Intelligence
            </div>
          </div>

          <button
            onClick={() => setAiOpen(false)}
            style={{
              border: "none",
              background: "transparent",
              color: "white",
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={22} />
          </button>
        </div>

        {[
          "⚡ Transition lane probability increasing",
          "🧠 Compact defensive mode recommended",
          "⚠ Left overload pressure escalating",
        ].map((insight) => (
          <div
            key={insight}
            style={{
              borderRadius: 22,
              padding: 18,
              background: "rgba(15,23,42,0.82)",
              lineHeight: 1.6,
              fontWeight: 800,
            }}
          >
            {insight}
          </div>
        ))}
      </div>
    </>
  )
}
