export type WorkspaceTab =
  | "home"
  | "schedule"
  | "matchday"
  | "team"
  | "more"
  | "training"
  | "players"
  | "insights"
  | "club"

export type WorkspaceConfig = {
  id: WorkspaceTab
  label: string
  shortLabel: string
  icon: string
  description: string
  primary?: boolean
}

export const ACTIVE_TEAM_NAME = "Leonard Stanley U11 Girls"

export const WORKSPACES: WorkspaceConfig[] = [
  {
    id: "home",
    label: "Home",
    shortLabel: "Home",
    icon: "🏠",
    description: "What matters today",
    primary: true,
  },
  {
    id: "schedule",
    label: "Schedule",
    shortLabel: "Schedule",
    icon: "📅",
    description: "Matches, training and events",
    primary: true,
  },
  {
    id: "matchday",
    label: "Matchday",
    shortLabel: "Match",
    icon: "⚽",
    description: "Prepare, coach and review",
    primary: true,
  },
  {
    id: "team",
    label: "Team",
    shortLabel: "Team",
    icon: "👥",
    description: "Squad, availability and development",
    primary: true,
  },
  {
    id: "more",
    label: "More",
    shortLabel: "More",
    icon: "•••",
    description: "Training, insights and club",
    primary: true,
  },
  {
    id: "training",
    label: "Training",
    shortLabel: "Training",
    icon: "🏃",
    description: "Plan and run sessions",
  },
  {
    id: "players",
    label: "Players",
    shortLabel: "Players",
    icon: "👥",
    description: "Legacy player route",
  },
  {
    id: "insights",
    label: "Insights",
    shortLabel: "Insights",
    icon: "📊",
    description: "Reports and coaching intelligence",
  },
  {
    id: "club",
    label: "Club",
    shortLabel: "Club",
    icon: "⚙️",
    description: "Club standards and administration",
  },
]

export const PRIMARY_WORKSPACES = WORKSPACES.filter((workspace) => workspace.primary)

export function getWorkspace(tab: WorkspaceTab) {
  return WORKSPACES.find((workspace) => workspace.id === tab) ?? WORKSPACES[0]
}
