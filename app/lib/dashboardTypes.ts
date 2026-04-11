export type PeriodMode = "quarters" | "halves"

export type EventWithPlan = {
  id: string
  title: string
  date: string
  type: "training" | "match" | "other"
  startTime?: string
  location?: string
  opponent?: string
  notes?: string
  trainingPlanId?: string
  trainingPlanName?: string
  seasonId?: string
}

export type TrainingPlanState = {
  title: string
  warmUp: string
  drill1: string
  drill2: string
  game: string
  notes: string
}

export type MatchEventDraftSetter = (
  value:
    | {
        type: "goal" | "assist" | "sub" | "injury" | "note"
        playerId: string
        secondPlayerId: string
        note: string
      }
    | ((
        prev: {
          type: "goal" | "assist" | "sub" | "injury" | "note"
          playerId: string
          secondPlayerId: string
          note: string
        }
      ) => {
        type: "goal" | "assist" | "sub" | "injury" | "note"
        playerId: string
        secondPlayerId: string
        note: string
      })
) => void

export type SeasonItem = {
  id: string
  name: string
  startDate: string
  endDate: string
  active: boolean
}
