import { makeId, type TrainingTemplate, type TrainingSession } from "./types"

export function buildSessionFromTemplate(template: TrainingTemplate): TrainingSession {
  return {
    id: makeId(),
    name: template.name,
    blocks: [
      {
        id: makeId(),
        title: "Warm Up",
        duration: 10,
        description: template.warmUp,
      },
      {
        id: makeId(),
        title: "Drill 1",
        duration: 15,
        description: template.drill1,
      },
      {
        id: makeId(),
        title: "Drill 2",
        duration: 15,
        description: template.drill2,
      },
      {
        id: makeId(),
        title: "Game",
        duration: 20,
        description: template.game,
      },
    ],
  }
}
