"use client"

import type {
  EventItem,
  MatchEventDraft,
} from "./types"

export type PeriodMode = "quarters" | "halves"

export type EventWithPlan = EventItem & {
  trainingPlanId?: string
  trainingPlanName?: string
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
  updater: MatchEventDraft | ((prev: MatchEventDraft) => MatchEventDraft)
) => void
