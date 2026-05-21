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
import { useMatchStateStore } from "../../lib/matchStateStore"

export default function SlideOverTacticalPanels() {
  const [formationOpen, setFormationOpen] = useState(false)
  const [subsOpen, setSubsOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)

  const formation = useMatchStateStore((state) => state.formation)
  const setFormation = useMatchStateStore((state) => state.setFormation)

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

        {(["2-3-1", "3-2-1", "2-2-2"] as const).map((shape) => (
          <button
            key={shape}
            onClick={() => {
              setFormation(shape)
              setFormationOpen(false)
            }}
            style={{
              border: "none",
              borderRadius: 20,
              padding: "18px 16px",
              background:
                formation === shape
                  ? "linear-gradient(135deg,#2563eb,#7c3aed)"
                  : "rgba(15,23,42,0.82)",
              color: "white",
              fontWeight: 900,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {shape}
          </button>
        ))}
      </div>
    </>
  )
}
