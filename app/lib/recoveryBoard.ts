export type RecoveryStatus = "working" | "partial" | "needs_recovery" | "planned"

export type RecoveryItem = {
  area: string
  status: RecoveryStatus
  progress: number
  notes: string
  nextAction: string
}

export const recoveryBoard: RecoveryItem[] = [
  { area: "Home", status: "partial", progress: 55, notes: "Uses real squad counts and events, but dashboard actions still need live data.", nextAction: "Connect attendance, fixtures and tasks." },
  { area: "Matchday", status: "partial", progress: 45, notes: "Squad, lineup and timeline interactions now work locally. Needs fixture persistence, timer, subs and reports.", nextAction: "Add match timer and player-specific event logging." },
  { area: "Training", status: "partial", progress: 35, notes: "Real event data is visible. Session planner and attendance need restoring.", nextAction: "Restore training plans and attendance register." },
  { area: "Players", status: "partial", progress: 60, notes: "Confirmed U11 squad is in the app. Profiles, photos and editing need restoring.", nextAction: "Add player profile view and edit flow." },
  { area: "Insights", status: "partial", progress: 35, notes: "Fake stats removed. Needs real match results and historical stats restored.", nextAction: "Restore results, head-to-head and league table generation." },
  { area: "Club", status: "planned", progress: 25, notes: "Club/team context exists but admin tools are not fully functional yet.", nextAction: "Build coach, parent and team administration." },
  { area: "Parent Portal", status: "planned", progress: 0, notes: "Not built yet.", nextAction: "Create parent-only child view and availability flow." },
  { area: "Database", status: "planned", progress: 5, notes: "Currently local reference data. Needs Supabase source of truth.", nextAction: "Design Football OS database schema." },
]
