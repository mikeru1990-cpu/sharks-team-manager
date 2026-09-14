import { createClient } from "@supabase/supabase-js"

const required = [
  "SUPABASE_TEST_URL",
  "SUPABASE_TEST_ANON_KEY",
  "FOOTBALL_OS_TEST_TEAM_ID",
  "FOOTBALL_OS_OTHER_TEAM_ID",
  "FOOTBALL_OS_COACH_EMAIL",
  "FOOTBALL_OS_COACH_PASSWORD",
  "FOOTBALL_OS_ASSISTANT_EMAIL",
  "FOOTBALL_OS_ASSISTANT_PASSWORD",
  "FOOTBALL_OS_PARENT_EMAIL",
  "FOOTBALL_OS_PARENT_PASSWORD",
]

const missing = required.filter((name) => !process.env[name]?.trim())
if (missing.length) {
  console.error(`Missing release-test environment variables: ${missing.join(", ")}`)
  process.exit(2)
}

const url = process.env.SUPABASE_TEST_URL
const anonKey = process.env.SUPABASE_TEST_ANON_KEY
const targetTeamId = process.env.FOOTBALL_OS_TEST_TEAM_ID
const forbiddenTeamId = process.env.FOOTBALL_OS_OTHER_TEAM_ID

const scenarios = [
  {
    name: "Coach",
    email: process.env.FOOTBALL_OS_COACH_EMAIL,
    password: process.env.FOOTBALL_OS_COACH_PASSWORD,
    allowedRoles: new Set(["manager", "coach"]),
    canManage: true,
  },
  {
    name: "Assistant coach",
    email: process.env.FOOTBALL_OS_ASSISTANT_EMAIL,
    password: process.env.FOOTBALL_OS_ASSISTANT_PASSWORD,
    allowedRoles: new Set(["assistant_coach"]),
    canManage: true,
  },
  {
    name: "Parent",
    email: process.env.FOOTBALL_OS_PARENT_EMAIL,
    password: process.env.FOOTBALL_OS_PARENT_PASSWORD,
    allowedRoles: new Set(["parent", "viewer"]),
    canManage: false,
  },
]

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function client() {
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

async function querySingleTeamMembership(supabase, scenario) {
  const { data, error } = await supabase
    .from("team_memberships")
    .select("team_id,role")
    .eq("team_id", targetTeamId)

  if (error) throw new Error(`${scenario.name}: team membership query failed: ${error.message}`)
  assert(Array.isArray(data) && data.length === 1, `${scenario.name}: expected exactly one membership for the release-test team`)
  assert(
    scenario.allowedRoles.has(data[0].role),
    `${scenario.name}: unexpected team role '${data[0].role}'`,
  )
}

async function verifyTargetTeamVisible(supabase, scenario) {
  const { data, error } = await supabase
    .from("teams")
    .select("id,name,age_group,season")
    .eq("id", targetTeamId)

  if (error) throw new Error(`${scenario.name}: target-team query failed: ${error.message}`)
  assert(Array.isArray(data) && data.length === 1, `${scenario.name}: assigned team is not visible`)
}

async function verifyOtherTeamHidden(supabase, scenario) {
  const { data: teamRows, error: teamError } = await supabase
    .from("teams")
    .select("id")
    .eq("id", forbiddenTeamId)

  if (teamError) throw new Error(`${scenario.name}: cross-team team query failed: ${teamError.message}`)
  assert(teamRows.length === 0, `${scenario.name}: can see a team that was not assigned`)

  const { data: playerRows, error: playerError } = await supabase
    .from("players")
    .select("id")
    .eq("team_id", forbiddenTeamId)
    .limit(1)

  if (playerError) throw new Error(`${scenario.name}: cross-team player query failed: ${playerError.message}`)
  assert(playerRows.length === 0, `${scenario.name}: can see players from another team`)
}

async function verifyManagementCapability(supabase, scenario) {
  const { data, error } = await supabase.rpc("can_manage_team", { target_team: targetTeamId })
  if (error) throw new Error(`${scenario.name}: can_manage_team failed: ${error.message}`)
  assert(data === scenario.canManage, `${scenario.name}: expected can_manage_team=${scenario.canManage}, received ${String(data)}`)
}

async function getVisiblePlayer(supabase, scenario) {
  const { data, error } = await supabase
    .from("players")
    .select("id,known_as")
    .eq("team_id", targetTeamId)
    .eq("active", true)
    .limit(1)

  if (error) throw new Error(`${scenario.name}: player query failed: ${error.message}`)
  assert(data.length > 0, `${scenario.name}: no active player is visible in the release-test team`)
  return data[0]
}

function isExpectedPermissionError(error) {
  if (!error) return false
  const message = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase()
  return message.includes("42501") || message.includes("permission denied") || message.includes("row-level security")
}

async function verifyWriteBoundary(supabase, scenario, player) {
  const { data, error } = await supabase
    .from("players")
    .update({ known_as: player.known_as })
    .eq("id", player.id)
    .select("id")

  if (scenario.canManage) {
    if (error) throw new Error(`${scenario.name}: coach write was rejected: ${error.message}`)
    assert(data?.length === 1, `${scenario.name}: expected an authorised player write to affect one row`)
    return
  }

  if (error) {
    assert(isExpectedPermissionError(error), `${scenario.name}: unexpected player-write error: ${error.message}`)
    return
  }

  assert(data?.length === 0, `${scenario.name}: view-only account was able to update a player`)
}

async function verifyPrivateDetailsBoundary(supabase, scenario) {
  const { data, error } = await supabase
    .from("player_private_details")
    .select("player_id,parent_contact,medical_notes,development_notes")
    .eq("team_id", targetTeamId)
    .limit(5)

  if (error) throw new Error(`${scenario.name}: private-details query failed: ${error.message}`)

  if (!scenario.canManage) {
    assert(data.length === 0, `${scenario.name}: view-only account can read protected player details`)
  }
}

async function runScenario(scenario) {
  const supabase = client()

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: scenario.email,
    password: scenario.password,
  })

  if (signInError || !signInData.user) {
    throw new Error(`${scenario.name}: sign-in failed${signInError ? `: ${signInError.message}` : ""}`)
  }

  try {
    await querySingleTeamMembership(supabase, scenario)
    await verifyTargetTeamVisible(supabase, scenario)
    await verifyOtherTeamHidden(supabase, scenario)
    await verifyManagementCapability(supabase, scenario)
    const player = await getVisiblePlayer(supabase, scenario)
    await verifyWriteBoundary(supabase, scenario, player)
    await verifyPrivateDetailsBoundary(supabase, scenario)
    console.log(`✓ ${scenario.name}: authentication, team scope, write access and private-data boundary passed`)
  } finally {
    await supabase.auth.signOut()
  }
}

console.log("Football OS release access verification")
console.log(`Target team: ${targetTeamId}`)
console.log(`Forbidden team: ${forbiddenTeamId}`)

let failed = false
for (const scenario of scenarios) {
  try {
    await runScenario(scenario)
  } catch (error) {
    failed = true
    console.error(`✗ ${scenario.name}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

if (failed) {
  console.error("\nRole-access release verification FAILED")
  process.exit(1)
}

console.log("\nRole-access release verification PASSED")
