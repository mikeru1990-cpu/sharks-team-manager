"use client"

import type { ReactNode } from "react"
import { WORKSPACES, type WorkspaceTab } from "../../lib/workspaces"
import { defaultPlatformContext } from "../../lib/platform"
import InstallAppBanner from "../ui/InstallAppBanner"

type Props={children:ReactNode;activeTab:WorkspaceTab;onTabChange:(tab:WorkspaceTab)=>void;isAdmin?:boolean;signOut?:()=>Promise<void>}

export default function PremiumAppShell({children,activeTab,onTabChange}:Props){
 const context=defaultPlatformContext
 const activeWorkspace=WORKSPACES.find(w=>w.id===activeTab)??WORKSPACES[0]
 return <div className="fos-app-shell fos-v3">
  <header className="fos-shell-header fos-v3-header">
   <div className="fos-v3-brand"><div className="fos-v3-mark" aria-hidden="true">⚽</div><div><strong>Football OS</strong><span>{context.team.name} · {context.team.season}</span></div></div>
   <div className="fos-v3-context"><span aria-hidden="true">{activeWorkspace.icon}</span><strong>{activeWorkspace.shortLabel}</strong></div>
  </header>
  <main className="fos-shell-main fos-v3-main">
   <InstallAppBanner/>
   <div className="fos-workspace-stage" key={activeTab}>{children}</div>
  </main>
  <nav aria-label="Football OS workspaces" className="fos-shell-nav fos-v3-nav">{WORKSPACES.map(w=>{const selected=activeTab===w.id;return <button type="button" key={w.id} aria-label={w.label} aria-current={selected?"page":undefined} onClick={()=>onTabChange(w.id)} className={`fos-shell-nav__item ${selected?"fos-shell-nav__item--active":""}`}><span className="fos-shell-nav__icon" aria-hidden="true">{w.icon}</span><span className="fos-shell-nav__label">{w.shortLabel}</span></button>})}</nav>
 </div>
}
