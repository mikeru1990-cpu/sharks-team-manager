import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "../../lib/supabase-admin"

export const dynamic = "force-dynamic"

function addWeeks(date: string, weeks: number) {
  const next = new Date(`${date}T12:00:00`)
  next.setDate(next.getDate() + weeks * 7)
  return next.toISOString().split("T")[0]
}

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Missing Supabase admin environment variables" },
        { status: 500 }
      )
    }

    const body = await req.json()
    const repeatWeeklyCount = Math.max(1, Math.min(52, Number(body.repeatWeeklyCount || 1)))
    const firstDate = String(body.firstDate || "")

    if (!firstDate || repeatWeeklyCount <= 1) {
      return NextResponse.json({ success: true, inserted: 0 })
    }

    const rows = Array.from({ length: repeatWeeklyCount - 1 }, (_, index) => {
      const date = addWeeks(firstDate, index + 1)
      return {
        id: crypto.randomUUID(),
        date,
        day: date,
        title: String(body.title || "Untitled event"),
        type: body.type || "training",
        start_time: body.startTime || "00:00",
        location: body.location || "",
        opponent: body.opponent || "",
        notes: body.notes || "",
        training_plan_id: body.trainingPlanId || null,
        training_plan_name: body.trainingPlanName || "",
        season_id: body.seasonId || null,
      }
    })

    const { error } = await supabaseAdmin.from("events").insert(rows)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, inserted: rows.length })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
