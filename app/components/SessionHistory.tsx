"use client"

import { cardStyle } from "../lib/types"
import type { TrainingSessionRecord } from "../lib/types"

type Props = {
  sessions: TrainingSessionRecord[]
}

export default function SessionHistory({ sessions }: Props) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={cardStyle()}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
          Session History
        </div>

        {sessions.length === 0 ? (
          <div style={{ color: "#64748b" }}>No saved sessions yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {sessions.map((session) => (
              <div
                key={session.id}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  display: "grid",
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>{session.planName}</div>
                  <div style={{ color: "#64748b", marginTop: 4 }}>{session.date}</div>
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  {session.blocks.map((block) => (
                    <div
                      key={block.id}
                      style={{
                        padding: 10,
                        borderRadius: 12,
                        background: block.completed ? "#dcfce7" : "#fff7ed",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div style={{ fontWeight: 800 }}>
                        {block.title} {block.completed ? "✓" : ""}
                      </div>
                      <div style={{ color: "#475569", marginTop: 4 }}>{block.description}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{ fontWeight: 800, marginBottom: 4 }}>Notes</div>
                  <div style={{ color: "#475569" }}>{session.notes || "No notes."}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
