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
 return <div className="fos-app-shell fos-v4">
  <aside className="fos-desktop-sidebar">
   <div className="fos-desktop-brand"><div className="fos-desktop-mark">⚽</div><div><strong>Football OS</strong><span>Sharks Team Manager</span></div></div>
   <div className="fos-desktop-team"><small>ACTIVE TEAM</small><strong>{context.team.name}</strong><span>{context.team.season}</span></div>
   <nav className="fos-desktop-menu" aria-label="Football OS desktop navigation">{WORKSPACES.map(w=><button type="button" key={w.id} className={activeTab===w.id?"active":""} onClick={()=>onTabChange(w.id)}><i>{icons[w.id]}</i><span><strong>{w.label}</strong><small>{w.description}</small></span></button>)}</nav>
   <div className="fos-desktop-foot"><span>Leonard Stanley Sharks FC</span>{signOut&&<button type="button" onClick={()=>void signOut()}>Sign out</button>}</div>
  </aside>
  <div className="fos-v4-body">
   <header className="fos-shell-header fos-v4-header"><div className="fos-v4-brand"><div className="fos-v4-mark">⚽</div><div><strong>Football OS</strong><span>{context.team.name} · {context.team.season}</span></div></div><div className="fos-v4-context"><span>{icons[activeTab]}</span><div><small>WORKSPACE</small><strong>{activeWorkspace.label}</strong></div></div></header>
   <main className="fos-shell-main fos-v4-main"><InstallAppBanner/><div className="fos-workspace-stage" key={activeTab}>{children}</div></main>
  </div>
  <nav aria-label="Football OS workspaces" className="fos-shell-nav fos-v4-nav">{WORKSPACES.map(w=>{const selected=activeTab===w.id;return <button type="button" key={w.id} aria-label={w.label} aria-current={selected?"page":undefined} onClick={()=>onTabChange(w.id)} className={`fos-shell-nav__item ${selected?"fos-shell-nav__item--active":""}`}><span className="fos-shell-nav__icon">{icons[w.id]}</span><span className="fos-shell-nav__label">{w.shortLabel}</span></button>})}</nav>
 </div>
}
