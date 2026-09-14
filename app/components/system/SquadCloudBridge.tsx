"use client"

import { useEffect, useRef } from "react"
import {
  cloudErrorMode,
  pullSquadFromCloud,
  pushSquadToCloud,
  setSquadCloudStatus,
} from "../../lib/squadCloud"
import {
  loadLegacySquadForMigration,
  loadSquadPlayers,
  saveSquadPlayers,
  setSquadStorageScope,
  squadChangeEvent,
  type SquadStorePlayer,
} from "../../lib/squadStore"
import { supabase } from "../../lib/supabase"
import { useTeamAccess } from "./TeamAccessProvider"

export default function SquadCloudBridge() {
  const { activeTeam } = useTeamAccess()
  const applyingRemote = useRef(false)
  const uploadTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!supabase) {
      setSquadStorageScope(null)
      setSquadCloudStatus({
        mode: "local",
        canManage: true,
        teamId: null,
        teamName: null,
        lastSyncedAt: null,
        message: "Private preview · stored on this device",
      })
      return
    }

    if (!activeTeam) {
      setSquadStorageScope(null)
      setSquadCloudStatus({
        mode: "needs_setup",
        canManage: false,
        teamId: null,
        teamName: null,
        lastSyncedAt: null,
        message: "No team has been assigned to this account",
      })
      return
    }

    setSquadStorageScope(activeTeam.teamId)

    let cancelled = false

    async function syncFromCloud(seedIfEmpty = true) {
      if (!activeTeam) return
      try {
        setSquadCloudStatus({
          mode: navigator.onLine ? "syncing" : "offline",
          canManage: activeTeam.canManage,
          teamId: activeTeam.teamId,
          teamName: activeTeam.teamName,
          lastSyncedAt: null,
          message: navigator.onLine ? "Syncing squad…" : "Offline · using saved squad",
        })

        let remote = await pullSquadFromCloud(activeTeam.teamId, activeTeam.canManage)
        if (cancelled) return

        if (!remote.length && activeTeam.canManage && seedIfEmpty) {
          const legacy = loadLegacySquadForMigration()
          if (legacy.length) {
            await pushSquadToCloud(activeTeam.teamId, legacy)
            remote = await pullSquadFromCloud(activeTeam.teamId, true)
          }
        }

        applyingRemote.current = true
        saveSquadPlayers(remote)
        queueMicrotask(() => {
          applyingRemote.current = false
        })

        setSquadCloudStatus({
          mode: "cloud",
          canManage: activeTeam.canManage,
          teamId: activeTeam.teamId,
          teamName: activeTeam.teamName,
          lastSyncedAt: new Date().toISOString(),
          message: activeTeam.canManage ? "Cloud synced · coach access" : "Cloud synced · view only",
        })
      } catch (error) {
        if (cancelled) return
        const state = cloudErrorMode(error)
        setSquadCloudStatus({
          ...state,
          canManage: activeTeam.canManage,
          teamId: activeTeam.teamId,
          teamName: activeTeam.teamName,
          lastSyncedAt: null,
        })
      }
    }

    function scheduleUpload(event: Event) {
      if (applyingRemote.current || !activeTeam.canManage) return
      const custom = event as CustomEvent<SquadStorePlayer[]>
      const players = Array.isArray(custom.detail) ? custom.detail : loadSquadPlayers()

      if (uploadTimer.current) window.clearTimeout(uploadTimer.current)
      uploadTimer.current = window.setTimeout(async () => {
        try {
          setSquadCloudStatus({
            mode: "syncing",
            canManage: true,
            teamId: activeTeam.teamId,
            teamName: activeTeam.teamName,
            lastSyncedAt: null,
            message: "Saving squad to cloud…",
          })
          await pushSquadToCloud(activeTeam.teamId, players)
          if (cancelled) return
          setSquadCloudStatus({
            mode: "cloud",
            canManage: true,
            teamId: activeTeam.teamId,
            teamName: activeTeam.teamName,
            lastSyncedAt: new Date().toISOString(),
            message: "Cloud synced · coach access",
          })
        } catch (error) {
          if (cancelled) return
          const state = cloudErrorMode(error)
          setSquadCloudStatus({
            ...state,
            canManage: true,
            teamId: activeTeam.teamId,
            teamName: activeTeam.teamName,
            lastSyncedAt: null,
          })
        }
      }, 650)
    }

    function handleOnline() {
      void syncFromCloud(false)
    }

    function handleFocus() {
      void syncFromCloud(false)
    }

    window.addEventListener(squadChangeEvent, scheduleUpload)
    window.addEventListener("online", handleOnline)
    window.addEventListener("focus", handleFocus)
    void syncFromCloud(true)

    return () => {
      cancelled = true
      if (uploadTimer.current) window.clearTimeout(uploadTimer.current)
      window.removeEventListener(squadChangeEvent, scheduleUpload)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("focus", handleFocus)
    }
  }, [activeTeam?.teamId, activeTeam?.teamName, activeTeam?.canManage])

  return null
}
