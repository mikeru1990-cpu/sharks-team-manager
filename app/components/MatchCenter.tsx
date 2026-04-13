"use client"

import type {
  MatchTab,
  MatchFormat,
  PitchSlot,
  Player,
  SavedLineup,
  TimelineItem,
} from "../lib/types"
import { TEAM, formatClock, formatMinutes } from "../lib/types"
import { Badge, PageCard, PrimaryButton, SectionHeader } from "./ui"

type PeriodMode = "quarters" | "halves"

type Props = {
  isAdmin: boolean
  matchTab: MatchTab
  setMatchTab: (tab: MatchTab) => void
  matchFormat: MatchFormat
  formation: string
  currentSlots: PitchSlot[]
  players: Player[]
  lineupMap: Record<string, string | null>
  benchIds: string[]
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  seconds: number
  running: boolean
  liveSecondsMap: Record<string, number>
  timeline: TimelineItem[]
  savedLineups: SavedLineup[]
  lineupName: string
  setLineupName: (value: string) => void
  activeDragPlayerId: string | null
  setActiveDragPlayerId: (id: string | null) => void
  setHomeTeam: (value: string) => Promise<void>
  setAwayTeam: (value: string) => Promise<void>
  setHomeScore: (value: number) => Promise<void>
  setAwayScore: (value: number) => Promise<void>
  setRunning: (value: boolean) => void
  resetClock: () => void
  saveMinutes: () => Promise<void>
  onChangeFormation: (format: MatchFormat, formation: string) => Promise<void>
  onSaveLineup: () => Promise<void>
  onLoadSavedLineup: (id: string) => Promise<void>
  onDeleteSavedLineup: (id: string) => Promise<void>
  onDragStartExternal: (event: any) => void
  onDragEndExternal: (event: any) => void
  onOpenCreateEvent: () => void
  onOpenEditEvent: (item: TimelineItem) => void
  onDeleteTimelineItem: (id: string) => Promise<void>
  onEndGame: () => Promise<void> | void
  trackingTitle: string
  periodMode: PeriodMode
  periodLength: number
  currentPeriod: number
  setCurrentPeriod: (value: number) => void
  setPeriodMode: (value: PeriodMode) => Promise<void>
  setPeriodLength: (value: number) => Promise<void>
  setLineupMapState?: (value: Record<string, string | null>) => void
  setBenchIdsState?: (value: string[]) => void
  persistMatchState?: (patch?: any) => Promise<void>
}

function miniButtonStyle(primary = false, danger = false, disabled = false) {
  return {
    padding: "10px 12px",
    borderRadius: 12,
    border: primary ? "none" : danger ? "1px solid #fecaca" : "1px solid #cbd5e1",
    background: disabled ? "#e2e8f0" : primary ? TEAM.primary : danger ? "#fff1f2" : "white",
    color: disabled ? "#94a3b8" : primary ? "white" : danger ? "#b91c1c" : "#0f172a",
    fontWeight: 800 as const,
    fontSize: 14,
  }
}

function MiniButton({
  children,
  onClick,
  primary = false,
  danger = false,
  disabled = false,
}: {
  children: React.ReactNode
  onClick?: () => void
  primary?: boolean
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={miniButtonStyle(primary, danger, disabled)}>
      {children}
    </button>
  )
}

function tabButtonStyle(active: boolean) {
  return {
    border: active ? "1px solid #bfdbfe" : "1px solid #cbd5e1",
    background: active ? "linear-gradient(180deg, #dbeafe 0%, #eff6ff 100%)" : "white",
    color: active ? "#1e3a8a" : "#475569",
    borderRadius: 14,
    padding: "10px 8px",
    fontWeight: 800 as const,
    fontSize: 12,
    boxShadow: active ? "0 4px 12px rgba(29, 78, 216, 0.10)" : "none",
    width: "100%",
    minWidth: 0,
    whiteSpace: "nowrap" as const,
  }
}

function TimelineBadge({ type }: { type: TimelineItem["type"] }) {
  if (type === "goal") return <Badge tone="green">Goal</Badge>
  if (type === "assist") return <Badge tone="blue">Assist</Badge>
  if (type === "injury") return <Badge tone="red">Injury</Badge>
  if (type === "sub") return <Badge tone="yellow">Sub</Badge>
  return <Badge tone="default">{type}</Badge>
}

export default function MatchCenter(props: Props) {
  const {
    isAdmin,
    matchTab,
    setMatchTab,
    matchFormat,
    formation,
    players,
    lineupMap,
    benchIds,
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    seconds,
    running,
    liveSecondsMap,
    timeline,
    savedLineups,
    lineupName,
    setLineupName,
    setHomeTeam,
    setAwayTeam,
    setHomeScore,
    setAwayScore,
    setRunning,
    resetClock,
    saveMinutes,
    onChangeFormation,
    onSaveLineup,
    onLoadSavedLineup,
    onDeleteSavedLineup,
    onOpenCreateEvent,
    onOpenEditEvent,
    onDeleteTimelineItem,
    onEndGame,
    trackingTitle,
    periodMode,
    periodLength,
    currentPeriod,
    setCurrentPeriod,
    setPeriodMode,
    setPeriodLength,
  } = props

  const safePlayers = Array.isArray(players) ? players : []
  const safeTimeline = Array.isArray(timeline) ? timeline : []
  const safeSavedLineups = Array.isArray(savedLineups) ? savedLineups : []
  const safeBenchIds = Array.isArray(benchIds) ? benchIds : []

  const lineupPlayers = Object.values(lineupMap || {})
    .filter(Boolean)
    .map((id) => safePlayers.find((p) => p.id === id))
    .filter(Boolean) as Player[]

  const benchPlayers = safeBenchIds
    .map((id) => safePlayers.find((p) => p.id === id))
    .filter(Boolean) as Player[]

  const periodCount = periodMode === "quarters" ? 4 : 2
  const periodLabel = periodMode === "quarters" ? `Q${currentPeriod}` : `H${currentPeriod}`
  const periodName = periodMode === "quarters" ? "Quarter" : "Half"
  const periodsTabLabel = periodMode === "quarters" ? "Quarters" : "Halves"

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PageCard tone="blue">
        <div style={{ color: "rgba(255,255,255,0.8)", fontWeight: 800, fontSize: 12 }}>
          MATCH CENTER
        </div>

        {trackingTitle ? (
          <div
            style={{
              marginTop: 8,
              fontSize: 13,
              fontWeight: 700,
              color: "rgba(255,255,255,0.95)",
              overflowWrap: "anywhere",
            }}
          >
            {trackingTitle}
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
            gap: 10,
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <input
            value={homeTeam}
            disabled={!isAdmin}
            onChange={(e) => void setHomeTeam(e.target.value)}
            style={{
              width: "100%",
              background: "transparent",
              color: "white",
              border: "none",
              borderBottom: "1px solid rgba(255,255,255,0.25)",
              fontSize: 15,
              fontWeight: 800,
              padding: "6px 0",
              outline: "none",
              minWidth: 0,
            }}
          />

          <div style={{ fontSize: 16, fontWeight: 900, opacity: 0.8, color: "white" }}>vs</div>

          <input
            value={awayTeam}
            disabled={!isAdmin}
            onChange={(e) => void setAwayTeam(e.target.value)}
            style={{
              width: "100%",
              background: "transparent",
              color: "white",
              border: "none",
              borderBottom: "1px solid rgba(255,255,255,0.25)",
              fontSize: 15,
              fontWeight: 800,
              padding: "6px 0",
              outline: "none",
              textAlign: "right",
              minWidth: 0,
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 10,
            alignItems: "center",
            marginTop: 14,
          }}
        >
          <div style={{ textAlign: "center", color: "white" }}>
            <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1 }}>{homeScore}</div>
            {isAdmin ? (
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                <MiniButton onClick={() => void setHomeScore(homeScore + 1)}>+1</MiniButton>
                <MiniButton onClick={() => void setHomeScore(Math.max(0, homeScore - 1))}>-1</MiniButton>
              </div>
            ) : null}
          </div>

          <div style={{ textAlign: "center", color: "white" }}>
            <div style={{ fontSize: 13, fontWeight: 900, opacity: 0.9 }}>{periodLabel}</div>
            <div style={{ fontSize: 30, fontWeight: 900, opacity: 0.95, lineHeight: 1.05 }}>
              {formatClock(seconds)}
            </div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>
              {periodLength} min {periodName.toLowerCase()}
            </div>
          </div>

          <div style={{ textAlign: "center", color: "white" }}>
            <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1 }}>{awayScore}</div>
            {isAdmin ? (
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                <MiniButton onClick={() => void setAwayScore(awayScore + 1)}>+1</MiniButton>
                <MiniButton onClick={() => void setAwayScore(Math.max(0, awayScore - 1))}>-1</MiniButton>
              </div>
            ) : null}
          </div>
        </div>

        {isAdmin ? (
          <div
            style={{
              marginTop: 12,
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 8,
            }}
          >
            <MiniButton primary onClick={() => setRunning(true)}>Start</MiniButton>
            <MiniButton onClick={() => setRunning(false)}>Pause</MiniButton>
            <MiniButton onClick={resetClock}>Reset</MiniButton>
            <MiniButton danger onClick={() => void onEndGame()}>End Game</MiniButton>
          </div>
        ) : null}
      </PageCard>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 8,
        }}
      >
        {[
          ["overview", "Overview"],
          ["lineup", "Lineup"],
          ["live", "Live"],
          ["quarters", periodsTabLabel],
          ["stats", "Stats"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setMatchTab(value as MatchTab)}
            style={tabButtonStyle(matchTab === value)}
          >
            {label}
          </button>
        ))}
      </div>

      {matchTab === "overview" && (
        <div style={{ display: "grid", gap: 16 }}>
          <PageCard>
            <SectionHeader title="Match Settings" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 10,
              }}
            >
              <div>
                <div style={{ fontWeight: 800, marginBottom: 6, fontSize: 13 }}>Game Type</div>
                <select
                  value={periodMode}
                  disabled={!isAdmin}
                  onChange={(e) => void setPeriodMode(e.target.value as PeriodMode)}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    fontSize: 15,
                    width: "100%",
                  }}
                >
                  <option value="quarters">4 Quarters</option>
                  <option value="halves">2 Halves</option>
                </select>
              </div>

              <div>
                <div style={{ fontWeight: 800, marginBottom: 6, fontSize: 13 }}>
                  {periodMode === "quarters" ? "Quarter Length" : "Half Length"}
                </div>
                <input
                  type="number"
                  min={1}
                  value={periodLength}
                  disabled={!isAdmin}
                  onChange={(e) => void setPeriodLength(Math.max(1, Number(e.target.value) || 1))}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    fontSize: 15,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <div style={{ fontWeight: 800, marginBottom: 6, fontSize: 13 }}>Current {periodName}</div>
                <select
                  value={currentPeriod}
                  disabled={!isAdmin}
                  onChange={(e) => setCurrentPeriod(Number(e.target.value))}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    fontSize: 15,
                    width: "100%",
                  }}
                >
                  {Array.from({ length: periodCount }, (_, i) => i + 1).map((period) => (
                    <option key={period} value={period}>
                      {periodMode === "quarters" ? `Quarter ${period}` : `Half ${period}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </PageCard>

          <PageCard tone="softGreen">
            <SectionHeader title="Clock & Minutes" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ color: "#065f46", fontWeight: 900, fontSize: 13 }}>{periodLabel}</div>
                <div style={{ fontSize: 36, fontWeight: 900, marginTop: 6 }}>{formatClock(seconds)}</div>
                <div style={{ marginTop: 4, fontWeight: 800, fontSize: 13 }}>
                  {periodLength} min {periodName.toLowerCase()}
                </div>
              </div>

              {isAdmin ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <MiniButton primary onClick={() => setRunning(true)}>Start</MiniButton>
                  <MiniButton onClick={() => setRunning(false)}>Pause</MiniButton>
                  <MiniButton onClick={resetClock}>Reset</MiniButton>
                  <MiniButton onClick={() => void saveMinutes()}>Save Minutes</MiniButton>
                </div>
              ) : null}
            </div>
          </PageCard>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            <PageCard>
              <SectionHeader title="Starting Group" />
              <div style={{ display: "grid", gap: 8 }}>
                {lineupPlayers.length === 0 ? (
                  <div style={{ color: "#64748b" }}>No lineup selected yet.</div>
                ) : (
                  lineupPlayers.map((player) => (
                    <div
                      key={player.id}
                      style={{
                        padding: 12,
                        borderRadius: 14,
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                      }}
                    >
                      <div style={{ fontWeight: 900 }}>{player.name}</div>
                      <div style={{ color: "#64748b", marginTop: 4, fontSize: 13 }}>
                        {player.positions.join("/")}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </PageCard>

            <PageCard>
              <SectionHeader title="Bench" />
              <div style={{ display: "grid", gap: 8 }}>
                {benchPlayers.length === 0 ? (
                  <div style={{ color: "#64748b" }}>No players on the bench.</div>
                ) : (
                  benchPlayers.map((player) => (
                    <div
                      key={player.id}
                      style={{
                        padding: 12,
                        borderRadius: 14,
                        border: "1px solid #e2e8f0",
                        background: "#fff7ed",
                      }}
                    >
                      <div style={{ fontWeight: 900 }}>{player.name}</div>
                      <div style={{ color: "#64748b", marginTop: 4, fontSize: 13 }}>
                        {player.positions.join("/")}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </PageCard>
          </div>
        </div>
      )}

      {matchTab === "lineup" && (
        <div style={{ display: "grid", gap: 16 }}>
          <PageCard>
            <SectionHeader title="Formation & Saved Lineups" />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0,1fr))",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <select
                value={matchFormat}
                disabled={!isAdmin}
                onChange={(e) => {
                  const nextFormat = e.target.value as MatchFormat
                  const nextFormation =
                    nextFormat === "7v7" ? "2-3-1" : nextFormat === "9v9" ? "3-3-2" : "4-3-3"
                  void onChangeFormation(nextFormat, nextFormation)
                }}
                style={{ padding: 12, borderRadius: 12, border: "1px solid #cbd5e1", fontSize: 15 }}
              >
                <option value="7v7">7v7</option>
                <option value="9v9">9v9</option>
                <option value="11v11">11v11</option>
              </select>

              <select
                value={formation}
                disabled={!isAdmin}
                onChange={(e) => void onChangeFormation(matchFormat, e.target.value)}
                style={{ padding: 12, borderRadius: 12, border: "1px solid #cbd5e1", fontSize: 15 }}
              >
                {Object.keys(
                  matchFormat === "7v7"
                    ? { "2-3-1": true, "3-2-1": true }
                    : matchFormat === "9v9"
                    ? { "3-3-2": true, "3-4-1": true }
                    : { "4-3-3": true, "4-4-2": true, "3-5-2": true }
                ).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {isAdmin ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
                <input
                  value={lineupName}
                  onChange={(e) => setLineupName(e.target.value)}
                  placeholder="Save lineup name"
                  style={{ padding: 12, borderRadius: 12, border: "1px solid #cbd5e1", fontSize: 15 }}
                />
                <PrimaryButton onClick={() => void onSaveLineup()}>Save</PrimaryButton>
              </div>
            ) : null}
          </PageCard>

          {safeSavedLineups.length > 0 && (
            <PageCard>
              <SectionHeader title="Saved Lineups" />
              <div style={{ display: "grid", gap: 10 }}>
                {safeSavedLineups.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) auto auto",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 900, fontSize: 14 }}>{item.name}</div>
                      <div style={{ color: "#64748b", marginTop: 4, fontSize: 12 }}>
                        {item.format} • {item.formation}
                      </div>
                    </div>
                    <MiniButton onClick={() => void onLoadSavedLineup(item.id)}>Load</MiniButton>
                    {isAdmin ? (
                      <MiniButton danger onClick={() => void onDeleteSavedLineup(item.id)}>Delete</MiniButton>
                    ) : null}
                  </div>
                ))}
              </div>
            </PageCard>
          )}

          <PageCard>
            <SectionHeader title="Current Lineup" />
            <div style={{ display: "grid", gap: 8 }}>
              {lineupPlayers.length === 0 ? (
                <div style={{ color: "#64748b" }}>No lineup selected yet.</div>
              ) : (
                lineupPlayers.map((player) => (
                  <div
                    key={player.id}
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>{player.name}</div>
                    <div style={{ color: "#64748b", marginTop: 4, fontSize: 13 }}>
                      {player.positions.join("/")}
                    </div>
                  </div>
                ))
              )}
            </div>
          </PageCard>
        </div>
      )}

      {matchTab === "live" && (
        <div style={{ display: "grid", gap: 16 }}>
          <PageCard>
            <SectionHeader
              title="Match Timeline"
              action={isAdmin ? <PrimaryButton onClick={onOpenCreateEvent}>Add Event</PrimaryButton> : null}
            />

            <div style={{ display: "grid", gap: 8 }}>
              {safeTimeline.length === 0 ? (
                <div style={{ color: "#64748b" }}>No live events yet.</div>
              ) : (
                [...safeTimeline]
                  .sort((a, b) => a.minute - b.minute || a.sortOrder - b.sortOrder)
                  .map((t) => (
                    <div
                      key={t.id}
                      style={{
                        padding: 12,
                        borderRadius: 14,
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        display: "grid",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <div style={{ fontWeight: 900 }}>{t.minute}'</div>
                          <TimelineBadge type={t.type} />
                        </div>

                        {isAdmin ? (
                          <div style={{ display: "flex", gap: 8 }}>
                            <MiniButton onClick={() => onOpenEditEvent(t)}>Edit</MiniButton>
                            <MiniButton danger onClick={() => void onDeleteTimelineItem(t.id)}>Delete</MiniButton>
                          </div>
                        ) : null}
                      </div>

                      <div style={{ color: "#475569", fontSize: 14 }}>{t.text}</div>
                    </div>
                  ))
              )}
            </div>
          </PageCard>

          <PageCard>
            <SectionHeader title="Live Minutes" />
            <div style={{ display: "grid", gap: 8 }}>
              {safePlayers.map((player) => (
                <div
                  key={player.id}
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                  }}
                >
                  <div style={{ fontWeight: 900 }}>{player.name}</div>
                  <div style={{ color: "#64748b", marginTop: 4, fontSize: 13 }}>
                    {formatMinutes(liveSecondsMap[player.id] || 0)}m live / {formatMinutes(player.seasonSeconds || 0)}m season
                  </div>
                </div>
              ))}
            </div>
          </PageCard>
        </div>
      )}

      {matchTab === "quarters" && (
        <PageCard tone="softYellow">
          <SectionHeader title={periodMode === "quarters" ? "Quarter Summary" : "Half Summary"} />
          <div style={{ color: "#475569", fontSize: 14 }}>
            Use the planner section below this card to save, load, and auto-generate{" "}
            {periodMode === "quarters" ? "quarter" : "half"} plans.
          </div>
        </PageCard>
      )}

      {matchTab === "stats" && (
        <PageCard>
          <SectionHeader title="Match Stats" />
          <div style={{ display: "grid", gap: 8 }}>
            {safePlayers.map((player) => (
              <div
                key={player.id}
                style={{
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                }}
              >
                <div style={{ fontWeight: 900 }}>{player.name}</div>
                <div style={{ color: "#64748b", marginTop: 4, fontSize: 13 }}>
                  Live {formatMinutes(liveSecondsMap[player.id] || 0)}m • Season {formatMinutes(player.seasonSeconds || 0)}m
                </div>
              </div>
            ))}
          </div>
        </PageCard>
      )}
    </div>
  )
}
