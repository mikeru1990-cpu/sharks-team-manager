import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

type SaveResultBody = {
  eventId?: string
  homeScore?: number
  awayScore?: number
}

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          error:
            "Missing Supabase server environment variables. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.",
        },
        { status: 500 }
      )
    }

    const body = (await req.json()) as SaveResultBody
    const eventId = body.eventId
    const homeScore = Number(body.homeScore ?? 0)
    const awayScore = Number(body.awayScore ?? 0)

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error } = await supabase
      .from("match_state")
      .update({
        home_score: homeScore,
        away_score: awayScore,
      })
      .eq("event_id", eventId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
