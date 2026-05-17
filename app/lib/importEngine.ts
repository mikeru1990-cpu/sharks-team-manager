import * as XLSX from "xlsx"

export type ImportedEvent = {
  type: "training" | "fixture" | "tournament" | "event"
  title: string
  date?: string
  time?: string
  opponent?: string
  venue?: string
  recurring?: boolean
  repeatDay?: string
}

const FIELD_MAPS: Record<string, string[]> = {
  title: ["title", "event", "session", "name"],
  type: ["type", "category"],
  date: ["date", "day", "event date"],
  time: ["time", "kickoff", "kick off", "start time", "ko"],
  opponent: ["opponent", "vs", "against"],
  venue: ["venue", "location", "pitch"],
}

function detectField(headers: string[], possible: string[]) {
  return headers.find((header) =>
    possible.some((p) => header.toLowerCase().includes(p.toLowerCase())),
  )
}

export async function importExcelFile(file: File) {
  const buffer = await file.arrayBuffer()

  const workbook = XLSX.read(buffer, {
    type: "array",
  })

  const sheetName = workbook.SheetNames[0]

  const sheet = workbook.Sheets[sheetName]

  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet)

  if (!rows.length) return []

  const headers = Object.keys(rows[0])

  const detectedFields = {
    title: detectField(headers, FIELD_MAPS.title),
    type: detectField(headers, FIELD_MAPS.type),
    date: detectField(headers, FIELD_MAPS.date),
    time: detectField(headers, FIELD_MAPS.time),
    opponent: detectField(headers, FIELD_MAPS.opponent),
    venue: detectField(headers, FIELD_MAPS.venue),
  }

  return rows.map<ImportedEvent>((row) => {
    const detectedType =
      row[detectedFields.type || ""]?.toString().toLowerCase() ||
      "event"

    return {
      type:
        detectedType.includes("train")
          ? "training"
          : detectedType.includes("fixture")
            ? "fixture"
            : detectedType.includes("tournament")
              ? "tournament"
              : "event",

      title:
        row[detectedFields.title || ""]?.toString() || "Untitled Event",

      date: row[detectedFields.date || ""]?.toString(),

      time: row[detectedFields.time || ""]?.toString(),

      opponent: row[detectedFields.opponent || ""]?.toString(),

      venue: row[detectedFields.venue || ""]?.toString(),

      recurring:
        detectedType.includes("weekly") ||
        detectedType.includes("recurring"),

      repeatDay: row[detectedFields.date || ""]?.toString(),
    }
  })
}
