"use client"

import { eliteTheme } from "../../lib/eliteTheme"
import EliteGlassCard from "../ui/EliteGlassCard"

export type TimelineEvent = {
  id: string
  minute: number
  type: "goal" | "assist" | "sub" | "injury" | "card"
  player: string
  secondaryPlayer?: string
}

type Props = {
  events: TimelineEvent[]
}

const eventIcons: Record<TimelineEvent["type"], string> = {
  goal: "⚽",
  assist: "🎯",
  sub: "🔄",
  injury: "🚑",
  card: "🟨",
}

export default function LiveMatchTimeline({ events }: Props) {
  return (
    <EliteGlassCard
      title="Live Match Timeline"
      subtitle="Real-time match events and momentum"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: eliteTheme.spacing.md,
        }}
      >
        {!events.length && (
          <div
            style={{
              borderRadius: eliteTheme.radius.md,
              padding: eliteTheme.spacing.lg,
              background: "rgba(15,23,42,0.45)",
              border: `1px solid ${eliteTheme.colors.border}`,
              color: eliteTheme.colors.textMuted,
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            No match events yet.
          </div>
        )}

        {events.map((event) => (
          <div
            key={event.id}
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: eliteTheme.radius.md,
              padding: eliteTheme.spacing.md,
              background: "rgba(30,41,59,0.58)",
              border: `1px solid ${eliteTheme.colors.border}`,
              boxShadow: eliteTheme.shadows.soft,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              animation: "timelineSlide 0.25s ease-out",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.18,
                background:
                  "linear-gradient(90deg, rgba(56,189,248,0.22), transparent)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                position: "relative",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: eliteTheme.radius.md,
                  background: "rgba(15,23,42,0.72)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  border: `1px solid ${eliteTheme.colors.border}`,
                }}
              >
                {eventIcons[event.type]}
              </div>

              <div>
                <div
                  style={{
                    color: eliteTheme.colors.text,
                    fontWeight: 800,
                    marginBottom: 4,
                  }}
                >
                  {event.player}
                </div>

                <div
                  style={{
                    color: eliteTheme.colors.textMuted,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {event.type.toUpperCase()}
                  {event.secondaryPlayer
                    ? ` • ${event.secondaryPlayer}`
                    : ""}
                </div>
              </div>
            </div>

            <div
              style={{
                color: eliteTheme.colors.primary,
                fontWeight: 900,
                fontSize: 20,
                position: "relative",
                zIndex: 2,
              }}
            >
              {event.minute}'
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes timelineSlide {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </EliteGlassCard>
  )
}
