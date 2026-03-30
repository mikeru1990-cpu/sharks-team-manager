"use client"

type Props = {
  text: string
  subtext?: string
}

export default function EmptyState({ text, subtext }: Props) {
  return (
    <div
      style={{
        padding: 20,
        textAlign: "center",
        color: "#64748b",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 600 }}>{text}</div>

      {subtext && (
        <div style={{ fontSize: 13, marginTop: 6, opacity: 0.8 }}>
          {subtext}
        </div>
      )}
    </div>
  )
}
