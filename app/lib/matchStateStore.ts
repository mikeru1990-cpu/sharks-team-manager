import { create } from "zustand"

export type TacticalMode =
  | "high-press"
  | "balanced"
  | "compact-block"
  | "counter"
  | "possession"

export type FormationType = "2-3-1" | "3-2-1" | "2-2-2"

export interface PlayerPosition {
  id: number
  name: string
  x: number
  y: number
}

export interface MatchEvent {
  id: number
  minute: string
  title: string
  detail: string
}

interface MatchState {
  score: { us: number; them: number }
  timer: number
  quarter: number
  momentum: number
  tacticalMode: TacticalMode
  formation: FormationType
  players: PlayerPosition[]
  pressureState: { left: number; center: number; right: number }
  fatigueLevels: Record<string, number>
  alerts: string[]
  events: MatchEvent[]
  setTacticalMode: (mode: TacticalMode) => void
  setFormation: (formation: FormationType) => void
  movePlayer: (id: number, direction: "up" | "down" | "left" | "right") => void
  setPlayerPosition: (id: number, x: number, y: number) => void
  updatePressure: (side: "left" | "center" | "right", value: number) => void
  updateFatigue: (player: string, value: number) => void
  addAlert: (alert: string) => void
  addEvent: (event: MatchEvent) => void
  setScore: (us: number, them: number) => void
  setQuarter: (quarter: number) => void
  setMomentum: (momentum: number) => void
}

export const useMatchStateStore = create<MatchState>((set) => ({
  score: { us: 0, them: 0 },
  timer: 0,
  quarter: 1,
  momentum: 0,
  tacticalMode: "balanced",
  formation: "2-3-1",
  players: [],
  pressureState: { left: 0, center: 0, right: 0 },
  fatigueLevels: {},
  alerts: [],
  events: [],

  setTacticalMode: (mode) => set(() => ({ tacticalMode: mode })),
  setFormation: (formation) => set(() => ({ formation })),
  movePlayer: (id, direction) =>
    set((state) => ({
      players: state.players.map((player) => {
        if (player.id !== id) return player
        const amount = 4
        return {
          ...player,
          x: direction === "left" ? Math.max(5, player.x - amount) : direction === "right" ? Math.min(95, player.x + amount) : player.x,
          y: direction === "up" ? Math.max(5, player.y - amount) : direction === "down" ? Math.min(90, player.y + amount) : player.y,
        }
      }),
    })),
  setPlayerPosition: (id, x, y) =>
    set((state) => ({ players: state.players.map((player) => (player.id === id ? { ...player, x, y } : player)) })),
  updatePressure: (side, value) => set((state) => ({ pressureState: { ...state.pressureState, [side]: value } })),
  updateFatigue: (player, value) => set((state) => ({ fatigueLevels: { ...state.fatigueLevels, [player]: value } })),
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
  addEvent: (event) => set((state) => ({ events: [event, ...state.events] })),
  setScore: (us, them) => set(() => ({ score: { us, them } })),
  setQuarter: (quarter) => set(() => ({ quarter })),
  setMomentum: (momentum) => set(() => ({ momentum })),
}))
