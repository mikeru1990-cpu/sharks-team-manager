import { create } from "zustand"

export type TacticalMode =
  | "high-press"
  | "balanced"
  | "compact-block"
  | "counter"
  | "possession"

export type FormationType = "2-3-1" | "3-2-1" | "2-2-2"

export interface MatchEvent {
  id: number
  minute: string
  title: string
  detail: string
}

interface MatchState {
  score: {
    us: number
    them: number
  }

  timer: number
  quarter: number
  momentum: number

  tacticalMode: TacticalMode
  formation: FormationType

  pressureState: {
    left: number
    center: number
    right: number
  }

  fatigueLevels: Record<string, number>

  alerts: string[]

  events: MatchEvent[]

  setTacticalMode: (mode: TacticalMode) => void
  setFormation: (formation: FormationType) => void
  updatePressure: (
    side: "left" | "center" | "right",
    value: number,
  ) => void
  updateFatigue: (player: string, value: number) => void
  addAlert: (alert: string) => void
  addEvent: (event: MatchEvent) => void
  setScore: (us: number, them: number) => void
  setQuarter: (quarter: number) => void
  setMomentum: (momentum: number) => void
}

export const useMatchStateStore = create<MatchState>((set) => ({
  score: {
    us: 2,
    them: 1,
  },

  timer: 1124,
  quarter: 2,
  momentum: 76,

  tacticalMode: "high-press",
  formation: "2-3-1",

  pressureState: {
    left: 82,
    center: 68,
    right: 91,
  },

  fatigueLevels: {
    Emily: 84,
    Sophia: 61,
    Ava: 72,
  },

  alerts: [
    "Defensive shape instability detected",
    "Transition opportunity emerging",
  ],

  events: [
    {
      id: 1,
      minute: "12'",
      title: "Goal Scored",
      detail: "Sophia finished transition attack",
    },
  ],

  setTacticalMode: (mode) =>
    set(() => ({
      tacticalMode: mode,
    })),

  setFormation: (formation) =>
    set(() => ({
      formation,
    })),

  updatePressure: (side, value) =>
    set((state) => ({
      pressureState: {
        ...state.pressureState,
        [side]: value,
      },
    })),

  updateFatigue: (player, value) =>
    set((state) => ({
      fatigueLevels: {
        ...state.fatigueLevels,
        [player]: value,
      },
    })),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
    })),

  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events],
    })),

  setScore: (us, them) =>
    set(() => ({
      score: {
        us,
        them,
      },
    })),

  setQuarter: (quarter) =>
    set(() => ({
      quarter,
    })),

  setMomentum: (momentum) =>
    set(() => ({
      momentum,
    })),
}))
