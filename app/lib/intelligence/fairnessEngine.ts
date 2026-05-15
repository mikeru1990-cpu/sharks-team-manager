import type {
  Player,
  PlayerMatchRating,
} from "../types"

export type FairnessInsight = {
  playerId: string
  playerName: string
  averageRating: number
  fairnessScore: number
  warning?: string
}

export function buildFairnessInsights(
  players: Player[],
  ratings: PlayerMatchRating[]
): FairnessInsight[] {
  return players.map((player) => {
    const playerRatings = ratings.filter(
      (rating) => rating.playerId === player.id
    )

    const total = playerRatings.reduce(
      (sum, rating) => sum + rating.rating,
      0
    )

    const averageRating = playerRatings.length
      ? total / playerRatings.length
      : 0

    let warning = ""

    if (playerRatings.length === 0) {
      warning = "No recent match ratings"
    } else if (averageRating < 6) {
      warning = "Performance dip detected"
    } else if (averageRating >= 8) {
      warning = "Strong recent form"
    }

    return {
      playerId: player.id,
      playerName: player.name,
      averageRating: Number(
        averageRating.toFixed(1)
      ),
      fairnessScore: Math.max(
        50,
        Math.min(100, Math.round(averageRating * 10))
      ),
      warning,
    }
  })
}
