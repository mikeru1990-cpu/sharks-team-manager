export type WorkspaceTab = "home" | "matchday" | "training" | "players" | "insights" | "club"

export type WorkspaceConfig = {
  id: WorkspaceTab
  label: string
  shortLabel: string
  icon: string
  description: string
}

export const ACTIVE_TEAM_NAME = "Leonard Stanley U11 Girls"

export const WORKSPACES: WorkspaceConfig[] = [
  {
    id: "home",
    label: "Home",
    shortLabel: "Home",
    icon: "🏠",
    description: "Daily coaching dashboard",
  },
  {
    id: "matchday",
    label: "Matchday",
    shortLabel: "Match",
    icon: "⚽",
    description: "Touchline tools, squad, rotations and reports",
  },
  {
    id: "training",
    label: "Training",
    shortLabel: "Train",
    icon: "🏃",
    description: "Session plans, attendance and drill history",
  },
  {
    id: "players",
    label: "Players",
    shortLabel: "Players",
    icon: "👥",
    description: "Player profiles, availability and development",
  },
  {
    id: "insights",
    label: "Insights",
    shortLabel: "Stats",
    icon: "📊",
    description: "Statistics, reports and smart alerts",
  },
  {
    id: "club",
    label: "Club",
    shortLabel: "Club",
    icon: "⚙️",
    description: "Teams, coaches, fixtures and administration",
  },
]

export function getWorkspace(tab: WorkspaceTab) {
  return WORKSPACES.find((workspace) => workspace.id === tab) ?? WORKSPACES[0]
}
