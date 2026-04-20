"use client"

import { THEME } from "../../lib/theme"
import {
  Badge,
  PageCard,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
} from "../ui"

type Props = {
  open: boolean
  value: {
    name: string
    startDate: string
    endDate: string
  }
  setValue: (value: {
    name: string
    startDate: string
    endDate: string
  }) => void
  onClose: () => void
  onSave: () => Promise<void> | void
}

function overlayStyle() {
  return {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(15,23,42,0.52)",
    display: "grid",
    placeItems: "center",
    zIndex: 220,
    padding: 16,
    backdropFilter: "blur(8px)",
  }
}

function fieldStyle() {
  return {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: 14,
    borderRadius: 16,
    border: "1px solid #cbd5e1",
    fontSize: 16,
    background: "white",
    color: THEME.colors.textPrimary,
    outline: "none",
  }
}

function labelStyle() {
  return {
    fontWeight: 800,
    fontSize: 13,
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  }
}

export default function SeasonModal({
  open,
  value,
  setValue,
  onClose,
  onSave,
}: Props) {
  if (!open) return null

  return (
    <div style={overlayStyle()}>
      <div style={{ width: "100%", maxWidth: 560 }}>
        <PageCard>
          <SectionHeader
            title="Start New Season"
            subtitle="Create a new season and switch the app into it."
            action={<Badge tone="blue">Season Setup</Badge>}
          />

          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <div style={labelStyle()}>Season name</div>
              <input
                value={value.name}
                onChange={(e) =>
                  setValue({
                    ...value,
                    name: e.target.value,
                  })
                }
                placeholder="Season name e.g. 2026/27"
                style={fieldStyle()}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div>
                <div style={labelStyle()}>Start date</div>
                <input
                  type="date"
                  value={value.startDate}
                  onChange={(e) =>
                    setValue({
                      ...value,
                      startDate: e.target.value,
                    })
                  }
                  style={fieldStyle()}
                />
              </div>

              <div>
                <div style={labelStyle()}>End date</div>
                <input
                  type="date"
                  value={value.endDate}
                  onChange={(e) =>
                    setValue({
                      ...value,
                      endDate: e.target.value,
                    })
                  }
                  style={fieldStyle()}
                />
              </div>
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: THEME.colors.textSecondary,
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: THEME.colors.textPrimary }}>Tip:</strong> Use a clear label like
              {" "}“2026/27” and set the full date range for that season.
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: 16,
            }}
          >
            <PrimaryButton onClick={() => void onSave()}>
              Create Season
            </PrimaryButton>

            <SecondaryButton onClick={onClose}>
              Cancel
            </SecondaryButton>
          </div>
        </PageCard>
      </div>
    </div>
  )
}
