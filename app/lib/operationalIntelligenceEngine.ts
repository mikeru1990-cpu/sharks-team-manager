export type OperationalAlert = {
  id: string
  level: "info" | "warning" | "critical"
  category:
    | "fixtures"
    | "attendance"
    | "goalkeeper"
    | "training"
    | "schedule"
  title: string
  description: string
}

export type IntelligenceFixture = {
  id: string
  date: string
}

export type IntelligenceTraining = {
  id: string
  date: string
}

export type IntelligencePlayer = {
  id: string
  name: string
  available?: boolean
  mainGK?: boolean
}

function daysBetween(a: Date, b: Date) {
  return Math.abs(b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)
}

export function generateOperationalAlerts({
  fixtures,
  trainings,
  players,
}: {
  fixtures: IntelligenceFixture[]
  trainings: IntelligenceTraining[]
  players: IntelligencePlayer[]
}): OperationalAlert[] {
  const alerts: OperationalAlert[] = []

  const sortedFixtures = [...fixtures].sort(
    (a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  for (let i = 0; i < sortedFixtures.length - 1; i++) {
    const current = new Date(sortedFixtures[i].date)
    const next = new Date(sortedFixtures[i + 1].date)

    if (daysBetween(current, next) <= 3) {
      alerts.push({
        id: crypto.randomUUID(),
        level: "warning",
        category: "fixtures",
        title: "Fixture Congestion Detected",
        description: "Multiple fixtures scheduled within a short period.",
      })

      break
    }
  }

  const hasGoalkeeper = players.some(
    (player) => player.available && player.mainGK,
  )

  if (!hasGoalkeeper) {
    alerts.push({
      id: crypto.randomUUID(),
      level: "critical",
      category: "goalkeeper",
      title: "No Goalkeeper Available",
      description: "No available goalkeeper currently marked for events.",
    })
  }

  const upcomingTraining = trainings.some((training) => {
    const trainingDate = new Date(training.date)

    return daysBetween(new Date(), trainingDate) <= 7
  })

  if (!upcomingTraining) {
    alerts.push({
      id: crypto.randomUUID(),
      level: "warning",
      category: "training",
      title: "No Upcoming Training Session",
      description: "No training session scheduled within the next 7 days.",
    })
  }

  if (!alerts.length) {
    alerts.push({
      id: crypto.randomUUID(),
      level: "info",
      category: "schedule",
      title: "Operations Running Smoothly",
      description: "No operational issues currently detected.",
    })
  }

  return alerts
}
