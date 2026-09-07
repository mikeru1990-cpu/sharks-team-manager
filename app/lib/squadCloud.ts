"use client"

import { useSyncExternalStore } from "react"
import { supabase } from "./supabase"
import type { SquadAvailability, SquadStorePlayer } from "./squadStore"

export type SquadCloudMode =
  | "local"
  | "syncing"
  | "cloud"
  | "offline"
  | "needs_setup"
  | "error"

export type SquadCloudStatus = {
  mode: SquadCloudMode
  canManage: boolean
  teamId: string | null
  teamName: string | null
  lastSyncedAt: string | null
  message: string
}

const localStatus: SquadCloudStatus = {
  mode: "local",
  canManage: true,
  teamId: null,
  teamName: null,
  lastSyncedAt: null,
  message: "Stored on this device",
}

let currentStatus = localStatus
const listeners = new Set<() => void>()

export function setSquadCloudStatus(next: SquadCloudStatus) {
  currentStatus = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useSquadCloudStatus() {
  return useSyncExternalStore(subscribe, () => currentStatus, () => localStatus)
}

export type CloudTeam = {
  id: string
  name: string
  age_group: string | null
  season: string | null
}

type CloudPlayerRow = {
  id: string
  team_id: string
  external_key: string
  first_name: string
  last_name: string
  known_as: string | null
  shirt_number: number | null
  primary_position: string | null
  secondary_positions: string[] | null
  responsibilities: string[] | null
  availability: string | null
  active: boolean
}

type PrivateRow = {
  player_id: string
  parent_contact: string | null
  medical_notes: string | null
  development_notes: string | null
}

function availability(value: string | null | undefined): SquadAvailability {
  return value === "Doubtful" || value === "Injured" || value === "Unavailable"
    ? value
    : "Available"
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length <= 1) return { firstName: parts[0] ?? "Player", lastName: "" }
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts.at(-1) ?? "",
  }
}

export async function getCloudSessionUser() {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user ?? null
}

export async function resolveActiveCloudTeam(): Promise<CloudTeam | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from("teams")
    .select("id,name,age_group,season")
    .order("name", { ascending: true })

  if (error) throw error

  const teams = (data ?? []) as CloudTeam[]
  return (
    teams.find((team) => team.name.toLowerCase().includes("u11") && team.name.toLowerCase().includes("girl")) ??
    teams.find((team) => team.age_group?.toUpperCase() === "U11") ??
    teams[0] ??
    null
  )
}

export async function canManageCloudTeam(teamId: string) {
  if (!supabase) return false
  const { data, error } = await supabase.rpc("can_manage_team", { target_team: teamId })
  if (error) throw error
  return data === true
}

export async function pullSquadFromCloud(teamId: string, canManage: boolean): Promise<SquadStorePlayer[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from("players")
    .select(
      "id,team_id,external_key,first_name,last_name,known_as,shirt_number,primary_position,secondary_positions,responsibilities,availability,active",
    )
    .eq("team_id", teamId)
    .eq("active", true)
    .order("shirt_number", { ascending: true, nullsFirst: false })
    .order("last_name", { ascending: true })

  if (error) throw error

  const rows = (data ?? []) as CloudPlayerRow[]
  let privateByPlayer = new Map<string, PrivateRow>()

  if (canManage && rows.length) {
    const { data: privateData, error: privateError } = await supabase
      .from("player_private_details")
      .select("player_id,parent_contact,medical_notes,development_notes")
      .eq("team_id", teamId)

    if (privateError) throw privateError
    privateByPlayer = new Map(
      ((privateData ?? []) as PrivateRow[]).map((row) => [row.player_id, row]),
    )
  }

  return rows.map((row) => {
    const privateRow = privateByPlayer.get(row.id)
    return {
      id: row.external_key,
      cloudId: row.id,
      name: [row.first_name, row.last_name].filter(Boolean).join(" ").trim(),
      knownAs: row.known_as ?? undefined,
      primaryPosition: row.primary_position ?? "TBC",
      secondaryPositions: Array.isArray(row.secondary_positions) ? row.secondary_positions : [],
      responsibilities:
        Array.isArray(row.responsibilities) && row.responsibilities.length
          ? row.responsibilities
          : ["Squad Player"],
      availability: availability(row.availability),
      shirtNumber: row.shirt_number == null ? "" : String(row.shirt_number),
      parentContact: canManage ? privateRow?.parent_contact ?? "" : "",
      medicalNotes: canManage ? privateRow?.medical_notes ?? "" : "",
      developmentNotes: canManage ? privateRow?.development_notes ?? "" : "",
    }
  })
}

export async function pushSquadToCloud(teamId: string, players: SquadStorePlayer[]) {
  if (!supabase) return

  const generalPayload = players.map((player) => {
    const { firstName, lastName } = splitName(player.name)
    const parsedShirt = Number.parseInt(player.shirtNumber, 10)
    return {
      team_id: teamId,
      external_key: player.id,
      first_name: firstName,
      last_name: lastName,
      known_as: player.knownAs?.trim() || null,
      shirt_number: Number.isFinite(parsedShirt) ? parsedShirt : null,
      primary_position: player.primaryPosition || "TBC",
      secondary_positions: player.secondaryPositions,
      responsibilities: player.responsibilities.length ? player.responsibilities : ["Squad Player"],
      availability: player.availability,
      active: true,
      updated_at: new Date().toISOString(),
    }
  })

  const { data: saved, error } = await supabase
    .from("players")
    .upsert(generalPayload, { onConflict: "team_id,external_key" })
    .select("id,external_key")

  if (error) throw error

  const savedRows = (saved ?? []) as Array<{ id: string; external_key: string }>
  const idByKey = new Map(savedRows.map((row) => [row.external_key, row.id]))

  const privatePayload = players
    .map((player) => {
      const playerId = idByKey.get(player.id) ?? player.cloudId
      if (!playerId) return null
      return {
        player_id: playerId,
        team_id: teamId,
        parent_contact: player.parentContact,
        medical_notes: player.medicalNotes,
        development_notes: player.developmentNotes,
        updated_at: new Date().toISOString(),
      }
    })
    .filter(Boolean)

  if (privatePayload.length) {
    const { error: privateError } = await supabase
      .from("player_private_details")
      .upsert(privatePayload, { onConflict: "player_id" })
    if (privateError) throw privateError
  }

  const { data: existing, error: existingError } = await supabase
    .from("players")
    .select("id,external_key")
    .eq("team_id", teamId)
    .eq("active", true)

  if (existingError) throw existingError

  const activeKeys = new Set(players.map((player) => player.id))
  const staleIds = ((existing ?? []) as Array<{ id: string; external_key: string }>)
    .filter((row) => !activeKeys.has(row.external_key))
    .map((row) => row.id)

  if (staleIds.length) {
    const { error: deactivateError } = await supabase
      .from("players")
      .update({ active: false, updated_at: new Date().toISOString() })
      .in("id", staleIds)
    if (deactivateError) throw deactivateError
  }
}

export function cloudErrorMode(error: unknown): Pick<SquadCloudStatus, "mode" | "message"> {
  const candidate = error as { code?: string; message?: string }
  const text = candidate?.message ?? "Cloud squad sync failed."

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { mode: "offline", message: "Offline · using the saved squad on this device" }
  }

  if (
    candidate?.code === "42P01" ||
    candidate?.code === "42703" ||
    /player_private_details|external_key|known_as|responsibilities|availability/i.test(text)
  ) {
    return { mode: "needs_setup", message: "Cloud squad migration still needs to be applied" }
  }

  return { mode: "error", message: text }
}
