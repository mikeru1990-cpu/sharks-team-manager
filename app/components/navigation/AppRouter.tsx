"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import ClubScreen from "../club/ClubScreen"
import HomeMissionControl from "../home/HomeMissionControl"
import InsightsScreen from "../insights/InsightsScreen"
import ActiveMatchBanner from "../matchday/ActiveMatchBanner"
import MatchdayScreen from "../matchday/MatchdayScreen"
import PlayersScreen from "../players/PlayersScreen"
import TrainingScreen from "../training/TrainingScreen"
import type { WorkspaceTab } from "../../lib/workspaces"

type Props = { activeTab: WorkspaceTab; onNavigate: (tab: WorkspaceTab) => void }
type BoundaryProps = { workspace: WorkspaceTab; onHome: () => void; children: ReactNode }
type BoundaryState = { failed: boolean }

class WorkspaceBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false }
  static getDerivedStateFromError(): BoundaryState { return { failed: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Football OS workspace error", this.props.workspace, error, info) }
  componentDidUpdate(prev: BoundaryProps) { if (prev.workspace !== this.props.workspace && this.state.failed) this.setState({ failed: false }) }
  render() {
    if (!this.state.failed) return this.props.children
    return <section className="fos-workspace-recovery"><div className="fos-recovery-icon">↻</div><div><small>WORKSPACE RECOVERY</small><h2>This screen hit a problem</h2><p>Your saved Football OS data has not been cleared. Return home and reopen the workspace.</p></div><button type="button" onClick={this.props.onHome}>Return home</button></section>
  }
}

export default function AppRouter({ activeTab, onNavigate }: Props) {
  let content: ReactNode
  switch (activeTab) {
    case "matchday": content = <MatchdayScreen />; break
    case "training": content = <TrainingScreen />; break
    case "players": content = <PlayersScreen />; break
    case "insights": content = <InsightsScreen />; break
    case "club": content = <ClubScreen />; break
    case "home":
    default:
      content = <div className="fos-home-stack"><ActiveMatchBanner onNavigate={onNavigate} /><HomeMissionControl onNavigate={onNavigate} /></div>
  }
  return <WorkspaceBoundary workspace={activeTab} onHome={() => onNavigate("home")}><div key={activeTab} className={`fos-workspace fos-workspace--${activeTab}`}>{content}</div></WorkspaceBoundary>
}
