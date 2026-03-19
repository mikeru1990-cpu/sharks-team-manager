"use client"

import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import type { MatchTab, MatchFormat, MatchEventDraft, PitchSlot, Player, SavedLineup, TimelineItem } from "../lib/types"
import {
  TEAM,
  buttonPrimary,
  buttonSecondary,
  cardStyle,
  chipStyle,
  formatClock,
  formatMinutes,
  initials,
} from "../lib/types"
import { canPlaySlot } from "../lib/rotation"

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
  onDragStartExternal: (event: DragStartEvent) => void
  onDragEndExternal: (event: DragEndEvent) => void
  onOpenCreateEvent: () => void
  onOpenEditEvent: (item: TimelineItem) => void
  onDeleteTimelineItem: (id: string) => Promise<void>
}

function ShirtMarker({ player, compact = false }: { player: Player; compact?: boolean }) {
  return (
    <div
      style={{
        width: compact ? 54 : 62,
        height: compact ? 54 : 62,
        margin: "0 auto",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: "polygon(18% 6%, 32% 6%, 39% 18%, 61% 18%, 68% 6%, 82% 6%, 94% 30%, 79% 38%, 79% 100%, 21% 100%, 21% 38%, 6% 30%)",
          background: `linear-gradient(180deg, ${TEAM.secondary} 0%, ${TEAM.primary} 100%)`,
          border: "2px solid rgba(255,255,255,0.75)",
          boxShadow: "0 8px 16px rgba(2,6,23,0.18)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          color: "white",
          fontSize: compact ? 11 : 12,
          fontWeight: 900,
          textShadow: "0 2px 4px rgba(0,0,0,0.25)",
        }}
      >
        {initials(player.name)}
      </div>
    </div>
  )
}

function PlayerBadges({ player }: { player: Player }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
      {player.mainGK ? <span style={{ fontSize: 11, fontWeight: 900 }}>MAIN GK</span> : null}
      {player.backupGK ? <span style={{ fontSize: 11, fontWeight: 900 }}>BACKUP GK</span> : null}
      {player.captain ? <span style={{ fontSize: 11, fontWeight: 900 }}>C</span> : null}
      {player.viceCaptain ? <span style={{ fontSize: 11, fontWeight: 900 }}>VC</span> : null}
    </div>
  )
}

function parseDragId(value: string) {
  const parts = value.split("::")
  if (parts.length !== 4) return null
  return { playerId: parts[1], fromId: parts[3] }
}

function DraggablePlayerCard({
  player,
  originId,
  compact = false,
  subtitle,
}: {
  player: Player
  originId: string
  compact?: boolean
  subtitle?: string
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `player::${player.id}::from::${originId}`,
  })

  const dragStyle = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.55 : 1,
    touchAction: "none" as const,
    cursor: "grab",
  }

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={{
          ...dragStyle,
          width: "100%",
          maxWidth: 160,
          borderRadius: 18,
          background: "rgba(255,255,255,0.16)",
          padding: 10,
          textAlign: "center",
          color: "white",
        }}
      >
        <ShirtMarker player={player} compact />
        <div style={{ marginTop: 8, fontWeight: 900, fontSize: 14 }}>{player.name}</div>
        <div style={{ marginTop: 4, fontSize: 11 }}>{player.positions.join("/")}</div>
        <div style={{ marginTop: 6 }}>
          <PlayerBadges player={player} />
        </div>
        {subtitle ? <div style={{ marginTop: 6, fontSize: 11 }}>{subtitle}</div> : null}
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        ...dragStyle,
        border: "1px solid #e2e8f0",
        padding: 14,
        borderRadius: 18,
        background: "white",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <ShirtMarker player={player} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 900, fontSize: 18 }}>{player.name}</div>
        <div style={{ color: "#64748b", marginTop: 4 }}>{player.positions.join("/")}</div>
        <div style={{ marginTop: 6 }}>
          <PlayerBadges player={player} />
        </div>
        {subtitle ? <div style={{ color: "#64748b", marginTop: 6 }}>{subtitle}</div> : null}
      </div>
    </div>
  )
}

function PitchDropSlot({
  slot,
  player,
  activePlayer,
  liveSeconds,
}: {
  slot: PitchSlot
  player?: Player
  activePlayer?: Player | null
  liveSeconds?: number
}) {
  const { isOver, setNodeRef } = useDroppable({ id: slot.id })
  const invalid = activePlayer ? !canPlaySlot(activePlayer, slot.position) : false

  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 136,
        borderRadius: 22,
        border: isOver
          ? invalid
            ? "2px solid #ef4444"
            : "2px solid #93c5fd"
          : "1px solid rgba(255,255,255,0.22)",
        background: isOver
          ? invalid
            ? "rgba(239,68,68,0.22)"
            : "rgba(147,197,253,0.25)"
          : "rgba(255,255,255,0.12)",
        display: "grid",
        placeItems: "center",
        padding: 10,
      }}
    >
      {player ? (
        <DraggablePlayerCard
          player={player}
          originId={slot.id}
          compact
          subtitle={typeof liveSeconds === "number" ? `${formatMinutes(liveSeconds)} min` : undefined}
        />
      ) : (
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.95)" }}>
          <div style={{ fontWeight: 900, fontSize: 12 }}>{slot.label}</div>
          <div style={{ marginTop: 4, fontSize: 12 }}>{slot.position}</div>
        </div>
      )}
    </div>
  )
}

function BenchDropZone({ children }: { children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id: "bench" })

  return (
    <div
      ref={setNodeRef}
      style={{
        padding: 14,
        borderRadius: 20,
        border: isOver ? `2px solid ${TEAM.secondary}` : "1px solid #e2e8f0",
        background: isOver ? "#eff6ff" : "#fff7ed",
      }}
    >
      {children}
    </div>
  )
}

export default function MatchCenter(props: Props) {
  const {
    isAdmin,
    matchTab,
    setMatchTab,
    matchFormat,
    formation,
    currentSlots,
    players,
    lineupMap,
    benchIds,
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    seconds,
    liveSecondsMap,
    timeline,
    savedLineups,
    lineupName,
    setLineupName,
    activeDragPlayerId,
    setActiveDragPlayerId,
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
    onDragStartExternal,
    onDragEndExternal,
    onOpenCreateEvent,
    onOpenEditEvent,
    onDeleteTimelineItem,
  } = props

  const lineupPlayers = Object.values(lineupMap)
    .filter(Boolean)
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[]

  const benchPlayers = benchIds
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[]

  const activeDragPlayer = players.find((p) => p.id === activeDragPlayerId) || null

  const pitchRows = [
    currentSlots.filter((s) => s.position === "FWD"),
    currentSlots.filter((s) => s.position === "MID"),
    currentSlots.filter((s) => s.position === "DEF"),
    currentSlots.filter((s) => s.position === "GK"),
  ]

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div
        style={{
          ...cardStyle(`linear-gradient(135deg, ${TEAM.primary} 0%, #0c235f 100%)`),
          color: "white",
        }}
      >
        <div style={{ fontSize: 14, opacity: 0.82, fontWeight: 800 }}>MATCH CENTER</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: 12,
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
              fontSize: 18,
              fontWeight: 800,
              padding: "6px 0",
              outline: "none",
            }}
          />

          <div style={{ fontSize: 22, fontWeight: 900, opacity: 0.8 }}>vs</div>

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
              fontSize: 18,
              fontWeight: 800,
              padding: "6px 0",
              outline: "none",
              textAlign: "right",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: 12,
            alignItems: "center",
            marginTop: 16,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, fontWeight: 900 }}>{homeScore}</div>
            {isAdmin ? (
              <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                <button onClick={() => void setHomeScore(homeScore + 1)} style={buttonSecondary()}>
                  +1
                </button>
                <button onClick={() => void setHomeScore(Math.max(0, homeScore - 1))} style={buttonSecondary()}>
                  -1
                </button>
              </div>
            ) : null}
          </div>

          <div style={{ fontSize: 34, fontWeight: 900, opacity: 0.85 }}>{formatClock(seconds)}</div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, fontWeight: 900 }}>{awayScore}</div>
            {isAdmin ? (
              <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                <button onClick={() => void setAwayScore(awayScore + 1)} style={buttonSecondary()}>
                  +1
                </button>
                <button onClick={() => void setAwayScore(Math.max(0, awayScore - 1))} style={buttonSecondary()}>
                  -1
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, overflowX: "auto", width: "100%", boxSizing: "border-box" }}>
        {[
          ["overview", "Overview"],
          ["lineup", "Lineup"],
          ["live", "Live"],
          ["quarters", "Quarters"],
          ["stats", "Stats"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setMatchTab(value as MatchTab)}
            style={{
              ...chipStyle(matchTab === value),
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {matchTab === "overview" ? (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={cardStyle("#ecfccb")}>
            <div style={{ color: "#4d7c0f", fontWeight: 900, fontSize: 16 }}>Match Clock</div>
            <div style={{ fontSize: 52, fontWeight: 900, marginTop: 8 }}>{formatClock(seconds)}</div>
            {isAdmin ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 10, marginTop: 14 }}>
                <button onClick={() => setRunning(true)} style={buttonPrimary()}>
                  Start
                </button>
                <button onClick={() => setRunning(false)} style={buttonSecondary()}>
                  Pause
                </button>
                <button onClick={resetClock} style={buttonSecondary()}>
                  Reset
                </button>
                <button onClick={() => void saveMinutes()} style={buttonSecondary()}>
                  Save
                </button>
              </div>
            ) : null}
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            <div style={cardStyle()}>
              <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Starting XI / Starting Group</div>
              <div style={{ display: "grid", gap: 10 }}>
                {lineupPlayers.map((player) => (
                  <div
                    key={player.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 18,
                      padding: 12,
                      background: "#f8fafc",
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <ShirtMarker player={player} />
                    <div>
                      <div style={{ fontWeight: 900 }}>{player.name}</div>
                      <div style={{ color: "#64748b", marginTop: 4 }}>{player.positions.join("/")}</div>
                      <div style={{ marginTop: 6 }}>
                        <PlayerBadges player={player} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Bench</div>
              <div style={{ display: "grid", gap: 10 }}>
                {benchPlayers.length === 0 ? (
                  <div style={{ color: "#64748b" }}>No players on the bench.</div>
                ) : (
                  benchPlayers.map((player) => (
                    <div
                      key={player.id}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 18,
                        padding: 12,
                        background: "#fff7ed",
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                      }}
                    >
                      <ShirtMarker player={player} />
                      <div>
                        <div style={{ fontWeight: 900 }}>{player.name}</div>
                        <div style={{ color: "#64748b", marginTop: 4 }}>{player.positions.join("/")}</div>
                        <div style={{ marginTop: 6 }}>
                          <PlayerBadges player={player} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {matchTab === "lineup" ? (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={cardStyle()}>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Formation & Saved Lineups</div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10, marginBottom: 10 }}>
              <select
                value={matchFormat}
                disabled={!isAdmin}
                onChange={(e) => {
                  const nextFormat = e.target.value as MatchFormat
                  const nextFormation = nextFormat === "7v7" ? "2-3-1" : nextFormat === "9v9" ? "3-3-2" : "4-3-3"
                  void onChangeFormation(nextFormat, nextFormation)
                }}
                style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
              >
                <option value="7v7">7v7</option>
                <option value="9v9">9v9</option>
                <option value="11v11">11v11</option>
              </select>

              <select
                value={formation}
                disabled={!isAdmin}
                onChange={(e) => void onChangeFormation(matchFormat, e.target.value)}
                style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
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
                  style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
                />
                <button onClick={() => void onSaveLineup()} style={buttonPrimary()}>
                  Save
                </button>
              </div>
            ) : null}
          </div>

          {savedLineups.length > 0 ? (
            <div style={cardStyle()}>
              <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Saved Lineups</div>
              <div style={{ display: "grid", gap: 10 }}>
                {savedLineups.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: 14,
                      borderRadius: 16,
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      display: "grid",
                      gridTemplateColumns: "1fr auto auto",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 900 }}>{item.name}</div>
                      <div style={{ color: "#64748b", marginTop: 4 }}>
                        {item.format} • {item.formation}
                      </div>
                    </div>
                    <button onClick={() => void onLoadSavedLineup(item.id)} style={buttonSecondary()}>
                      Load
                    </button>
                    {isAdmin ? (
                      <button onClick={() => void onDeleteSavedLineup(item.id)} style={buttonSecondary()}>
                        Delete
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div style={cardStyle()}>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Real Drag-and-Drop Tactics Board</div>

            <DndContext
              collisionDetection={closestCenter}
              onDragStart={(e) => {
                const parsed = parseDragId(String(e.active.id))
                setActiveDragPlayerId(parsed?.playerId || null)
                onDragStartExternal(e)
              }}
              onDragEnd={(e) => {
                setActiveDragPlayerId(null)
                onDragEndExternal(e)
              }}
            >
              <div
                style={{
                  ...cardStyle("linear-gradient(180deg, #1d8a3f 0%, #157435 100%)"),
                  color: "white",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 14,
                    border: "2px solid rgba(255,255,255,0.25)",
                    borderRadius: 26,
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: 14,
                    bottom: 14,
                    width: 2,
                    background: "rgba(255,255,255,0.20)",
                    transform: "translateX(-50%)",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: 110,
                    height: 110,
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.22)",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
                  }}
                />

                <div style={{ position: "relative", zIndex: 1, display: "grid", gap: 18 }}>
                  {pitchRows.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
                        gap: 12,
                        alignItems: "center",
                      }}
                    >
                      {row.map((slot) => {
                        const playerId = lineupMap[slot.id]
                        const player = players.find((p) => p.id === playerId)
                        return (
                          <PitchDropSlot
                            key={slot.id}
                            slot={slot}
                            player={player}
                            activePlayer={activeDragPlayer}
                            liveSeconds={playerId ? liveSecondsMap[playerId] || 0 : 0}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Bench</div>
                <BenchDropZone>
                  <div style={{ display: "grid", gap: 10 }}>
                    {benchPlayers.length === 0 ? (
                      <div style={{ color: "#64748b" }}>No players on the bench.</div>
                    ) : (
                      benchPlayers.map((player) => (
                        <DraggablePlayerCard
                          key={player.id}
                          player={player}
                          originId="bench"
                          subtitle={`${formatMinutes(liveSecondsMap[player.id] || 0)} min live`}
                        />
                      ))
                    )}
                  </div>
                </BenchDropZone>
              </div>
            </DndContext>
          </div>
        </div>
      ) : null}

      {matchTab === "live" ? (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={cardStyle()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 900 }}>Match Timeline</div>
              {isAdmin ? (
                <button onClick={onOpenCreateEvent} style={buttonPrimary()}>
                  Add Event
                </button>
              ) : null}
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {[...timeline]
                .sort((a, b) => a.minute - b.minute || a.sortOrder - b.sortOrder)
                .map((t) => (
                  <div
                    key={t.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: isAdmin ? "60px 1fr auto auto" : "60px 1fr",
                      gap: 12,
                      padding: 12,
                      borderRadius: 14,
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>{t.minute}'</div>
                    <div>
                      <div style={{ fontWeight: 800, textTransform: "capitalize" }}>{t.type}</div>
                      <div style={{ color: "#475569", marginTop: 4 }}>{t.text}</div>
                    </div>
                    {isAdmin ? <button onClick={() => onOpenEditEvent(t)} style={buttonSecondary()}>Edit</button> : null}
                    {isAdmin ? <button onClick={() => void onDeleteTimelineItem(t.id)} style={buttonSecondary()}>Delete</button> : null}
                  </div>
                ))}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Live Minutes</div>
            <div style={{ display: "grid", gap: 10 }}>
              {players.map((player) => (
                <div
                  key={player.id}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <ShirtMarker player={player} compact />
                    <div>
                      <div style={{ fontWeight: 900 }}>{player.name}</div>
                      <div style={{ color: "#64748b", marginTop: 4 }}>{player.positions.join("/")}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 900 }}>{formatMinutes(liveSecondsMap[player.id] || 0)} min</div>
                    <div style={{ color: "#64748b", fontSize: 13 }}>
                      season {formatMinutes(player.seasonSeconds || 0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {matchTab === "stats" ? (
        <div style={cardStyle()}>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Match Stats</div>
          <div style={{ display: "grid", gap: 10 }}>
            {players.map((player) => (
              <div
                key={player.id}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <ShirtMarker player={player} compact />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900 }}>{player.name}</div>
                  <div style={{ color: "#64748b", marginTop: 4 }}>
                    Live: {formatMinutes(liveSecondsMap[player.id] || 0)} min • Season: {formatMinutes(player.seasonSeconds || 0)} min
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
