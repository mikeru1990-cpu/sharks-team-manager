"use client"

import type { MainTab } from "../../lib/types"
import { HomeIcon, CalendarIcon, FootballIcon, UsersIcon, ChartIcon, CapIcon } from "../AppIcons"

type Props = { tab: MainTab; setTab: (tab: MainTab) => void }

const items: Array<{ key: MainTab; label: string; shortLabel: string; icon: React.ReactNode }> = [
  { key: "home", label: "Home command centre", shortLabel: "Home", icon: <HomeIcon size={18} /> },
  { key: "match", label: "Matchday workspace", shortLabel: "Matchday", icon: <FootballIcon size={18} /> },
  { key: "events", label: "Training workspace", shortLabel: "Training", icon: <CalendarIcon size={18} /> },
  { key: "players", label: "Players workspace", shortLabel: "Players", icon: <UsersIcon size={18} /> },
  { key: "stats", label: "Insights workspace", shortLabel: "Insights", icon: <ChartIcon size={18} /> },
  { key: "coaches", label: "Club workspace", shortLabel: "Club", icon: <CapIcon size={18} /> },
]

export default function BottomNav({ tab, setTab }: Props) {
  function changeTab(nextTab: MainTab) {
    setTab(nextTab)
    try { window.localStorage.setItem("sharks-last-tab", nextTab) } catch {}
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" }))
  }

  return <nav aria-label="Main app navigation" style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 6, width: "min(94vw, 720px)", zIndex: 100, borderRadius: 24, padding: 5, background: "linear-gradient(135deg, rgba(2,6,23,0.97), rgba(15,23,42,0.92))", border: "1px solid rgba(125,211,252,0.24)", boxShadow: "0 14px 34px rgba(0,0,0,0.48), 0 0 24px rgba(14,165,233,0.10), inset 0 1px 0 rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}><div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 4 }}>{items.map((item) => { const active = tab === item.key; return <button key={item.key} aria-label={item.label} aria-current={active ? "page" : undefined} title={item.label} onClick={() => changeTab(item.key)} style={{ border: active ? "1px solid rgba(125,211,252,0.64)" : "1px solid rgba(148,163,184,0.08)", background: active ? "linear-gradient(135deg, #2563eb 0%, #0284c7 58%, #0f172a 100%)" : "rgba(255,255,255,0.038)", color: active ? "white" : "#cbd5e1", borderRadius: 17, padding: "6px 2px 6px", display: "grid", justifyItems: "center", alignContent: "center", gap: 2, minWidth: 0, minHeight: 48, cursor: "pointer", position: "relative", overflow: "hidden", boxShadow: active ? "0 8px 20px rgba(37,99,235,0.34), inset 0 1px 0 rgba(255,255,255,0.16)" : "inset 0 1px 0 rgba(255,255,255,0.03)" }}>{active ? <div style={{ position: "absolute", left: "50%", bottom: 3, width: 18, height: 2, borderRadius: 999, background: "#7dd3fc", transform: "translateX(-50%)", boxShadow: "0 0 10px rgba(125,211,252,0.9)" }} /> : null}<div style={{ lineHeight: 1, transform: active ? "translateY(-1px) scale(0.98)" : "scale(0.84)", display: "grid", placeItems: "center", position: "relative", zIndex: 1 }}>{item.icon}</div><div style={{ fontSize: 8, fontWeight: active ? 1000 : 850, whiteSpace: "nowrap", opacity: active ? 1 : 0.82, position: "relative", zIndex: 1 }}>{item.shortLabel}</div></button> })}</div></nav>
}
