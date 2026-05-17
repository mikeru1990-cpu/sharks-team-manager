"use client"

import { Bell, CalendarDays, PlayCircle, Users } from "lucide-react"
import OperationalCard from "../ui/OperationalCard"
import OperationalScreenHeader from "../layout/OperationalScreenHeader"
import { eliteTheme } from "../../lib/eliteTheme"

export default function HomeMissionControl() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: eliteTheme.spacing.md,
        paddingBottom: 120,
      }}
    >
      <OperationalScreenHeader
        title="Mission Control"
        subtitle="Live football operations"
      />

      <OperationalCard
        title="Active Match"
        subtitle="Leonard Stanley Lionesses vs Brockworth"
        rightSlot={<PlayCircle size={22} color={eliteTheme.colors.primary} />}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 34,
                fontWeight: 900,
                color: eliteTheme.colors.text,
                letterSpacing: -1.2,
              }}
            >
              3-1
            </div>

            <div
              style={{
                color: eliteTheme.colors.textMuted,
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              54' • Quarter 3 • High Pressure
            </div>
          </div>

          <button
            style={{
              border: "none",
              borderRadius: eliteTheme.radius.full,
              background: eliteTheme.gradients.primary,
              color: eliteTheme.colors.text,
              padding: "12px 18px",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: eliteTheme.shadows.glowBlue,
            }}
          >
            Resume Match
          </button>
        </div>
      </OperationalCard>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: eliteTheme.spacing.md,
        }}
      >
        <OperationalCard
          compact
          title="Next Event"
          subtitle="Wednesday Training • 17:45"
          rightSlot={<CalendarDays size={18} color={eliteTheme.colors.primary} />}
        >
          <div
            style={{
              color: eliteTheme.colors.textMuted,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Attendance 82%
          </div>
        </OperationalCard>

        <OperationalCard
          compact
          title="Squad"
          subtitle="14 available"
          rightSlot={<Users size={18} color={eliteTheme.colors.primary} />}
        >
          <div
            style={{
              color: eliteTheme.colors.textMuted,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            2 pending replies
          </div>
        </OperationalCard>
      </div>

      <OperationalCard
        title="Operational Alerts"
        subtitle="Items needing attention"
        rightSlot={<Bell size={18} color={eliteTheme.colors.warning} />}
      >
        {[
          "No goalkeeper selected",
          "2 attendance replies missing",
          "Lineup not saved",
        ].map((alert) => (
          <div
            key={alert}
            style={{
              padding: "12px 14px",
              borderRadius: eliteTheme.radius.sm,
              background: "rgba(15,23,42,0.62)",
              border: `1px solid ${eliteTheme.colors.border}`,
              color: eliteTheme.colors.text,
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            ⚠ {alert}
          </div>
        ))}
      </OperationalCard>
    </div>
  )
}
