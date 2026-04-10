"use client"

import { buttonPrimary, buttonSecondary, cardStyle } from "../../lib/types"
import type { SeasonFormState } from "../../lib/dashboardTypes"

type Props = {
  open: boolean
  value: SeasonFormState
  setValue: (value: SeasonFormState) => void
  onClose: () => void
  onSave: () => Promise<void> | void
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
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 120,
        padding: 16,
      }}
    >
      <div style={{ ...cardStyle(), width: "100%", maxWidth: 460 }}>
        <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>
          Start New Season
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <input
            value={value.name}
            onChange={(e) =>
              setValue({
                ...value,
                name: e.target.value,
              })
            }
            placeholder="Season name e.g. 2026/27"
            style={{
              padding: 14,
              borderRadius: 14,
              border: "1px solid #cbd5e1",
              fontSize: 16,
            }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>Start Date</div>
              <input
                type="date"
                value={value.startDate}
                onChange={(e) =>
                  setValue({
                    ...value,
                    startDate: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: 14,
                  borderRadius: 14,
                  border: "1px solid #cbd5e1",
                  fontSize: 16,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>End Date</div>
              <input
                type="date"
                value={value.endDate}
                onChange={(e) =>
                  setValue({
                    ...value,
                    endDate: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: 14,
                  borderRadius: 14,
                  border: "1px solid #cbd5e1",
                  fontSize: 16,
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div
            style={{
              padding: 12,
              borderRadius: 12,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#475569",
              lineHeight: 1.5,
              fontSize: 14,
            }}
          >
            This should create a new active season while keeping past seasons as archived history.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={() => void onSave()} style={{ ...buttonPrimary(), flex: 1 }}>
            Create Season
          </button>
          <button onClick={onClose} style={{ ...buttonSecondary(), flex: 1 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
