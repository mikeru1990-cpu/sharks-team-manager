import PageCard from "../ui/PageCard"
import SectionHeader from "../ui/SectionHeader"

import type {
  Player,
  PlayerMatchRating,
} from "../../lib/types"

import {
  buildFairnessInsights,
} from "../../lib/intelligence/fairnessEngine"

type Props = {
  players: Player[]
  ratings: PlayerMatchRating[]
}

export default function FairnessOverview({
  players,
  ratings,
}: Props) {
  const insights = buildFairnessInsights(
    players,
    ratings
  )

  return (
    <PageCard>
      <SectionHeader
        title="Fairness Intelligence"
        subtitle="Squad balance and performance insights"
      />

      <div className="grid gap-3">
        {insights.slice(0, 6).map((item) => (
          <div
            key={item.playerId}
            className="border border-slate-200 rounded-2xl p-4 bg-slate-50"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-black text-slate-900">
                  {item.playerName}
                </div>

                <div className="text-sm text-slate-500 mt-1">
                  {item.warning || "Balanced performance"}
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-slate-900">
                  {item.fairnessScore}
                </div>

                <div className="text-xs text-slate-500">
                  Fairness
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageCard>
  )
}
