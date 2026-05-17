"use client"

import { useState } from "react"
import EliteGlassCard from "../ui/EliteGlassCard"
import { eliteTheme } from "../../lib/eliteTheme"
import {
  importExcelFile,
  type ImportedEvent,
} from "../../lib/importEngine"

export default function ExcelImportUploader() {
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<ImportedEvent[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]

    if (!file) return

    try {
      setLoading(true)
      setError(null)

      const imported = await importExcelFile(file)

      setEvents(imported)
    } catch (err) {
      console.error(err)
      setError("Unable to import spreadsheet")
    } finally {
      setLoading(false)
    }
  }

  return (
    <EliteGlassCard
      title="Smart Excel Import"
      subtitle="Import fixtures, training, tournaments and recurring schedules"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: eliteTheme.spacing.lg,
        }}
      >
        <label
          style={{
            border: `1px dashed ${eliteTheme.colors.border}`,
            borderRadius: eliteTheme.radius.lg,
            padding: eliteTheme.spacing.xl,
            background: "rgba(15,23,42,0.45)",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 42,
              marginBottom: 12,
            }}
          >
            📥
          </div>

          <div
            style={{
              color: eliteTheme.colors.text,
              fontWeight: 800,
              marginBottom: 6,
            }}
          >
            Upload Excel Schedule
          </div>

          <div
            style={{
              color: eliteTheme.colors.textMuted,
              fontSize: 13,
            }}
          >
            Supports fixtures, training, tournaments and recurring events
          </div>

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleUpload}
            style={{ display: "none" }}
          />
        </label>

        {loading && (
          <div
            style={{
              color: eliteTheme.colors.primary,
              fontWeight: 700,
            }}
          >
            Importing schedule...
          </div>
        )}

        {error && (
          <div
            style={{
              color: eliteTheme.colors.danger,
              fontWeight: 700,
            }}
          >
            {error}
          </div>
        )}

        {!!events.length && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                color: eliteTheme.colors.text,
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              Import Preview ({events.length})
            </div>

            {events.map((item, index) => (
              <div
                key={index}
                style={{
                  borderRadius: eliteTheme.radius.md,
                  padding: eliteTheme.spacing.md,
                  background: "rgba(30,41,59,0.55)",
                  border: `1px solid ${eliteTheme.colors.border}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      color: eliteTheme.colors.text,
                      fontWeight: 800,
                    }}
                  >
                    {item.title}
                  </div>

                  <div
                    style={{
                      color: eliteTheme.colors.primary,
                      fontWeight: 700,
                      fontSize: 12,
                      textTransform: "uppercase",
                    }}
                  >
                    {item.type}
                  </div>
                </div>

                <div
                  style={{
                    color: eliteTheme.colors.textMuted,
                    fontSize: 13,
                  }}
                >
                  {item.date} • {item.time}
                </div>

                {item.opponent && (
                  <div
                    style={{
                      color: eliteTheme.colors.textMuted,
                      fontSize: 13,
                    }}
                  >
                    vs {item.opponent}
                  </div>
                )}

                {item.recurring && (
                  <div
                    style={{
                      color: eliteTheme.colors.success,
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    🔁 Recurring Session Detected
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </EliteGlassCard>
  )
}
