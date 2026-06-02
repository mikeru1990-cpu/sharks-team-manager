"use client"

import type { TimelineItem } from "../../lib/types"

type Props = {
  timeline?: TimelineItem[]
  onEdit?: (item: TimelineItem) => void
  onDelete?: (id: string) => Promise<void> | void
}

const iconByType: Record<string, string> = {
  goal: "⚽",
  assist: "🎯",
  sub: "🔄",
  injury: "🚑",
  note: "📝",
}

const colourByType: Record<string, string> = {
  goal: "#22c55e",
  assist: "#38bdf8",
  sub: "#facc15",
  injury: "#fb7185",
  note: "#a78bfa",
}

export default function LiveTimelinePanel({ timeline = [], onEdit, onDelete }: Props) {
  const sortedTimeline = timeline
    .slice()
    .sort((a, b) => {
      const sortOrder = (b.sortOrder || 0) - (a.sortOrder || 0)
      if (sortOrder !== 0) return sortOrder
      return (b.minute || 0) - (a.minute || 0)
    })

  return (
    <div
      className="sharks-glass sharks-card-shine"
      style={{
        borderRadius: 28,
        padding: 16,
        display: "grid",
        gap: 14,
        border: "1px solid rgba(125,211,252,0.22)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".15em" }}>
            LIVE MATCH TIMELINE
          </div>
          <div style={{ color: "white", fontSize: 22, fontWeight: 1000, marginTop: 4 }}>
            Match Events
          </div>
        </div>
        <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 900 }}>{timeline.length} total</div>
      </div>

      {sortedTimeline.length === 0 ? (
        <div
          style={{
            borderRadius: 20,
            padding: 16,
            background: "rgba(2,6,23,0.42)",
            border: "1px dashed rgba(148,163,184,0.28)",
            color: "#cbd5e1",
            fontWeight: 750,
            lineHeight: 1.5,
          }}
        >
          No match moments logged yet. Use the quick actions to add goals, assists, subs, injuries or notes.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {sortedTimeline.map((item) => {
            const colour = colourByType[item.type] || "#94a3b8"
            const icon = iconByType[item.type] || "•"

            return (
              <div
                key={item.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "56px minmax(0,1fr) auto",
                  gap: 10,
                  alignItems: "center",
                  borderRadius: 20,
                  padding: 12,
                  background: "rgba(2,6,23,0.46)",
                  border: `1px solid ${colour}55`,
                  boxShadow: `0 12px 30px ${colour}10`,
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, lineHeight: 1 }}>{icon}</div>
                  <div style={{ color: colour, fontSize: 12, fontWeight: 1000, marginTop: 4 }}>{item.minute}'</div>
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ color: "white", fontWeight: 1000, overflow: "hidden", textOverflow: "ellipsis" }}>{item.text}</div>
                  <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", marginTop: 3 }}>
                    {item.type}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  {onEdit ? (
                    <button
                      onClick={() => onEdit(item)}
                      style={{ border: "1px solid rgba(125,211,252,0.30)", background: "rgba(14,165,233,0.10)", color: "#7dd3fc", borderRadius: 12, padding: "8px 9px", fontWeight: 900 }}
                    >
                      Edit
                    </button>
                  ) : null}
                  {onDelete ? (
                    <button
                      onClick={() => void onDelete(item.id)}
                      style={{ border: "1px solid rgba(251,113,133,0.30)", background: "rgba(244,63,94,0.10)", color: "#fb7185", borderRadius: 12, padding: "8px 9px", fontWeight: 900 }}
                    >
                      Del
                    </button>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
