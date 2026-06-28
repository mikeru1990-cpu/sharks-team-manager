"use client"

import type { MainTab } from "../../lib/types"
import { HomeIcon, CalendarIcon, FootballIcon, UsersIcon, ChartIcon, CapIcon } from "../AppIcons"

type Props = { tab: MainTab; setTab: (tab: MainTab) => void }

const items: Array<{ key: MainTab; label: string; shortLabel: string; icon: React.ReactNode }> = [
  { key: "home", label: "Home control centre", shortLabel: "Home", icon: <HomeIcon size={18} /> },
  { key: "events", label: "Training workspace", shortLabel: "Training", icon: <CalendarIcon size={18} /> },
  { key: "match", label: "Matchday workspace", shortLabel: "Matchday", icon: <FootballIcon size={18} /> },
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

  return <nav aria-label="Main app navigation" style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 8, width: "min(94vw, 760px)", zIndex: 100, borderRadius: 26, padding: 6, background: "linear-gradient(135deg, rgba(2,6,23,0.98), rgba(15,23,42,0.94))", border: "1px solid rgba(125,211,252,0.26)", boxShadow: "0 18px 44px rgba(0,0,0,0.52), 0 0 28px rgba(14,165,233,0.12), inset 0 1px 0 rgba(255,255,255,0.08)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)" }}><div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 5 }}>{items.map((item) => { const active = tab === item.key; return <button key={item.key} aria-label={item.label} aria-current={active ? "page" : undefined} onClick={() => changeTab(item.key)} style={{ border: active ? "1px solid rgba(125,211,252,0.68)" : "1px solid rgba(148,163,184,0.09)", background: active ? "linear-gradient(135deg, #2563eb 0%, #0284c7 58%, #0f172a 100%)" : "rgba(255,255,255,0.04)", color: active ? "white" : "#cbd5e1", borderRadius: 18, padding: "7px 2px 7px", display: "grid", justifyItems: "center", alignContent: "center", gap: 3, minWidth: 0, minHeight: 52, cursor: "pointer", position: "relative", overflow: "hidden", boxShadow: active ? "0 10px 24px rgba(37,99,235,0.36), inset 0 1px 0 rgba(255,255,255,0.18)" : "inset 0 1px 0 rgba(255,255,255,0.035)", transition: "transform 140ms ease, background 140ms ease, border 140ms ease" }}>{active ? <div style={{ position: "absolute", left: 8, right: 8, top: 5, height: 2, borderRadius: 999, background: "#7dd3fc", boxShadow: "0 0 12px rgba(125,211,252,0.9)" }} /> : null}<div style={{ lineHeight: 1, transform: active ? "translateY(0) scale(1)" : "scale(0.86)", display: "grid", placeItems: "center", position: "relative", zIndex: 1, opacity: active ? 1 : 0.86 }}>{item.icon}</div><div style={{ fontSize: 8.5, fontWeight: active ? 1000 : 850, whiteSpace: "nowrap", opacity: active ? 1 : 0.78, position: "relative", zIndex: 1, letterSpacing: active ? "0" : "-.01em" }}>{item.shortLabel}</div></button> })}</div></nav>
}
