"use client"

import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"

import type {
  MatchTab,
  MatchFormat,
  PitchSlot,
  Player,
  SavedLineup,
  TimelineItem,
} from "../lib/types"

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
  onDragStartExternal: (event: DragStartEvent) => void
  onDragEndExternal: (event: DragEndEvent) => void
  onOpenCreateEvent: () => void
  onOpenEditEvent: (item: TimelineItem) => void
  onDeleteTimelineItem: (id: string) => Promise<void>

  periodMode: PeriodMode
  periodLength: number
  currentPeriod: number
  setCurrentPeriod: (value: number) => void
  setPeriodMode: (value: PeriodMode) => Promise<void>
  setPeriodLength: (value: number) => Promise<void>
}

export default function MatchCenter(props: Props) {
  const {
    isAdmin,
    matchTab,
    setMatchTab,
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    seconds,
    setHomeTeam,
    setAwayTeam,
    setHomeScore,
    setAwayScore,
    setRunning,
    resetClock,
    saveMinutes,
    periodMode,
    periodLength,
    currentPeriod,
    setCurrentPeriod,
    setPeriodMode,
    setPeriodLength,
  } = props

  const periodCount = periodMode === "quarters" ? 4 : 2
  const periodLabel = periodMode === "quarters" ? `Q${currentPeriod}` : `H${currentPeriod}`
  const periodName = periodMode === "quarters" ? "Quarter" : "Half"

  return (
    <div style={{ display: "grid", gap: 16 }}>

      {/* SCOREBOARD */}
      <div
        style={{
          ...cardStyle(`linear-gradient(135deg, ${TEAM.primary} 0%, #0c235f 100%)`),
          color: "white",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 800 }}>MATCH CENTER</div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          marginTop: 10,
        }}>
          <input value={homeTeam} disabled={!isAdmin} onChange={(e)=>void setHomeTeam(e.target.value)} style={{background:"transparent",border:"none",color:"white",fontWeight:800}}/>
          <div style={{ fontWeight:900 }}>vs</div>
          <input value={awayTeam} disabled={!isAdmin} onChange={(e)=>void setAwayTeam(e.target.value)} style={{background:"transparent",border:"none",color:"white",fontWeight:800,textAlign:"right"}}/>
        </div>

        <div style={{
          display:"grid",
          gridTemplateColumns:"1fr auto 1fr",
          alignItems:"center",
          marginTop:16
        }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:64,fontWeight:900 }}>{homeScore}</div>
            {isAdmin && (
              <div style={{ display:"flex",justifyContent:"center",gap:8 }}>
                <button onClick={()=>void setHomeScore(homeScore+1)} style={buttonSecondary()}>+1</button>
                <button onClick={()=>void setHomeScore(Math.max(0,homeScore-1))} style={buttonSecondary()}>-1</button>
              </div>
            )}
          </div>

          <div style={{ textAlign:"center" }}>
            <div style={{ fontWeight:900 }}>{periodLabel}</div>
            <div style={{ fontSize:32,fontWeight:900 }}>{formatClock(seconds)}</div>
            <div style={{ fontSize:12 }}>{periodLength} min {periodName.toLowerCase()}</div>
          </div>

          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:64,fontWeight:900 }}>{awayScore}</div>
            {isAdmin && (
              <div style={{ display:"flex",justifyContent:"center",gap:8 }}>
                <button onClick={()=>void setAwayScore(awayScore+1)} style={buttonSecondary()}>+1</button>
                <button onClick={()=>void setAwayScore(Math.max(0,awayScore-1))} style={buttonSecondary()}>-1</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display:"flex",gap:8,overflowX:"auto" }}>
        {["overview","lineup","live","quarters","stats"].map(tab => (
          <button key={tab} onClick={()=>setMatchTab(tab as MatchTab)} style={chipStyle(matchTab===tab)}>
            {tab}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {matchTab === "overview" && (
        <>
          {/* SETTINGS */}
          <div style={cardStyle()}>
            <div style={{ fontWeight:900,fontSize:20,marginBottom:10 }}>Match Settings</div>

            <div style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))",
              gap:10
            }}>
              <select value={periodMode} disabled={!isAdmin}
                onChange={(e)=>void setPeriodMode(e.target.value as PeriodMode)}
                style={{ padding:12 }}>
                <option value="quarters">4 Quarters</option>
                <option value="halves">2 Halves</option>
              </select>

              <input type="number" value={periodLength} disabled={!isAdmin}
                onChange={(e)=>void setPeriodLength(Number(e.target.value))}
                style={{ padding:12 }}
              />

              <select value={currentPeriod} disabled={!isAdmin}
                onChange={(e)=>setCurrentPeriod(Number(e.target.value))}
                style={{ padding:12 }}>
                {Array.from({length:periodCount}).map((_,i)=>(
                  <option key={i+1}>{i+1}</option>
                ))}
              </select>
            </div>
          </div>

          {/* CLOCK */}
          <div style={cardStyle("#ecfccb")}>
            <div style={{ fontSize:40,fontWeight:900 }}>{formatClock(seconds)}</div>

            <div style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fit, minmax(120px, 1fr))",
              gap:10,
              marginTop:10
            }}>
              <button onClick={()=>setRunning(true)} style={buttonPrimary()}>Start</button>
              <button onClick={()=>setRunning(false)} style={buttonSecondary()}>Pause</button>
              <button onClick={resetClock} style={buttonSecondary()}>Reset</button>
              <button onClick={()=>void saveMinutes()} style={buttonSecondary()}>Save</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
