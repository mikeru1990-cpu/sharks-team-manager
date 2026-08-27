"use client"

import type {ReactNode} from "react"
import {BarChart3,Dumbbell,Home,Settings,Trophy,Users} from "lucide-react"
import {WORKSPACES,type WorkspaceTab} from "../../lib/workspaces"
import {defaultPlatformContext} from "../../lib/platform"
import InstallAppBanner from "../ui/InstallAppBanner"

type Props={children:ReactNode;activeTab:WorkspaceTab;onTabChange:(tab:WorkspaceTab)=>void;isAdmin?:boolean;signOut?:()=>Promise<void>}
const icons:Record<WorkspaceTab,ReactNode>={home:<Home/>,matchday:<Trophy/>,training:<Dumbbell/>,players:<Users/>,insights:<BarChart3/>,club:<Settings/>}

export default function PremiumAppShell({children,activeTab,onTabChange,signOut}:Props){
 const context=defaultPlatformContext,activeWorkspace=WORKSPACES.find(w=>w.id===activeTab)??WORKSPACES[0]
 return <div className="fos-clean-shell">
  <aside className="fos-clean-sidebar">
   <div className="fos-clean-brand"><div className="fos-clean-brandmark">LS</div><div><strong>Football OS</strong><span>Sharks Team Manager</span></div></div>
   <div className="fos-clean-team"><small>ACTIVE TEAM</small><strong>{context.team.name}</strong><span>{context.team.season}</span></div>
   <nav aria-label="Football OS navigation" className="fos-clean-menu">{WORKSPACES.map(w=><button type="button" key={w.id} aria-current={activeTab===w.id?"page":undefined} onClick={()=>onTabChange(w.id)} className={activeTab===w.id?"active":""}><i>{icons[w.id]}</i><span><strong>{w.label}</strong><small>{w.description}</small></span></button>)}</nav>
   <div className="fos-clean-sidebar-foot"><span>Leonard Stanley Sharks FC</span>{signOut&&<button type="button" onClick={()=>void signOut()}>Sign out</button>}</div>
  </aside>
  <div className="fos-clean-body">
   <header className="fos-clean-topbar"><div><small>LEONARD STANLEY SHARKS FC</small><strong>{activeWorkspace.label}</strong></div><div className="fos-clean-profile"><span>U11</span><div>MR</div></div></header>
   <main className="fos-clean-main"><InstallAppBanner/><div className="fos-workspace-stage" key={activeTab}>{children}</div></main>
  </div>
  <nav aria-label="Football OS mobile navigation" className="fos-clean-mobile-nav">{WORKSPACES.map(w=><button type="button" key={w.id} aria-current={activeTab===w.id?"page":undefined} onClick={()=>onTabChange(w.id)} className={activeTab===w.id?"active":""}><i>{icons[w.id]}</i><span>{w.shortLabel}</span></button>)}</nav>
 </div>
}
