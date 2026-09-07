"use client"

import { useEffect, useRef } from "react"
import {
  canManageCloudTeam,
  cloudErrorMode,
  getCloudSessionUser,
  pullSquadFromCloud,
  pushSquadToCloud,
  resolveActiveCloudTeam,
  setSquadCloudStatus,
} from "../../lib/squadCloud"
import {
  loadSquadPlayers,
  saveSquadPlayers,
  scrubSensitiveSquadCache,
  squadChangeEvent,
  type SquadStorePlayer,
} from "../../lib/squadStore"
import { supabase } from "../../lib/supabase"

export default function SquadCloudBridge() {
  const applyingRemote = useRef(false)
  const teamIdRef = useRef<string | null>(null)
  const canManageRef = useRef(false)
  const uploadTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!supabase) {
      setSquadCloudStatus({
        mode: "local",
        canManage: true,
        teamId: null,
        teamName: null,
        lastSyncedAt: null,
        message: "Stored on this device",
      })
      return
    }

    let cancelled = false

    async function syncFromCloud(seedIfEmpty = true) {
      try {
        setSquadCloudStatus({
          mode: navigator.onLine ? "syncing" : "offline",
          canManage: canManageRef.current,
          teamId: teamIdRef.current,
          teamName: null,
          lastSyncedAt: null,
          message: navigator.onLine ? "Syncing squad…" : "Offline · using saved squad",
        })

        const user = await getCloudSessionUser()
        if (!user || cancelled) {
          teamIdRef.current = null
          canManageRef.current = false
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

        const team = await resolveActiveCloudTeam()
        if (!team || cancelled) {
          setSquadCloudStatus({
            mode: "needs_setup",
            canManage: false,
            teamId: null,
            teamName: null,
            lastSyncedAt: null,
            message: "No team access has been assigned to this account",
          })
          return
        }

        const canManage = await canManageCloudTeam(team.id)
        if (cancelled) return

        teamIdRef.current = team.id
        canManageRef.current = canManage

        let remote = await pullSquadFromCloud(team.id, canManage)
        if (cancelled) return

        if (!remote.length && canManage && seedIfEmpty) {
          await pushSquadToCloud(team.id, loadSquadPlayers())
          remote = await pullSquadFromCloud(team.id, true)
        }

        applyingRemote.current = true
        saveSquadPlayers(remote)
        queueMicrotask(() => {
          applyingRemote.current = false
        })

        setSquadCloudStatus({
          mode: "cloud",
          canManage,
          teamId: team.id,
          teamName: team.name,
          lastSyncedAt: new Date().toISOString(),
          message: canManage ? "Cloud synced · coach access" : "Cloud synced · view only",
        })
      } catch (error) {
        if (cancelled) return
        const state = cloudErrorMode(error)
        setSquadCloudStatus({
          ...state,
          canManage: canManageRef.current,
          teamId: teamIdRef.current,
          teamName: null,
          lastSyncedAt: null,
        })
      }
    }

    function scheduleUpload(event: Event) {
      if (applyingRemote.current || !canManageRef.current || !teamIdRef.current) return
      const custom = event as CustomEvent<SquadStorePlayer[]>
      const players = Array.isArray(custom.detail) ? custom.detail : loadSquadPlayers()

      if (uploadTimer.current) window.clearTimeout(uploadTimer.current)
      uploadTimer.current = window.setTimeout(async () => {
        try {
          setSquadCloudStatus({
            mode: "syncing",
            canManage: true,
            teamId: teamIdRef.current,
            teamName: null,
            lastSyncedAt: null,
            message: "Saving squad to cloud…",
          })
          await pushSquadToCloud(teamIdRef.current!, players)
          if (cancelled) return
          setSquadCloudStatus({
            mode: "cloud",
            canManage: true,
            teamId: teamIdRef.current,
            teamName: null,
            lastSyncedAt: new Date().toISOString(),
            message: "Cloud synced · coach access",
          })
        } catch (error) {
          if (cancelled) return
          const state = cloudErrorMode(error)
          setSquadCloudStatus({
            ...state,
            canManage: true,
            teamId: teamIdRef.current,
            teamName: null,
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

    function handleAuth() {
      teamIdRef.current = null
      canManageRef.current = false
      applyingRemote.current = true
      scrubSensitiveSquadCache()
      queueMicrotask(() => {
        applyingRemote.current = false
      })
      void syncFromCloud(true)
    }

    window.addEventListener(squadChangeEvent, scheduleUpload)
    window.addEventListener("online", handleOnline)
    window.addEventListener("focus", handleFocus)

    const { data: authListener } = supabase.auth.onAuthStateChange(() => handleAuth())
    void syncFromCloud(true)

    return () => {
      cancelled = true
      if (uploadTimer.current) window.clearTimeout(uploadTimer.current)
      window.removeEventListener(squadChangeEvent, scheduleUpload)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("focus", handleFocus)
      authListener.subscription.unsubscribe()
    }
  }, [])

  return null
}
