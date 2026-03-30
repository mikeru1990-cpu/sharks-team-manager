"use client"

type Props = {
  title: string
  description?: string
}

export default function EmptyState({ title, description }: Props) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 16,
        border: "1px dashed #cbd5e1",
        background: "#f8fafc",
        color: "#475569",
      }}
    >
      <div style={{ fontWeight: 900 }}>{title}</div>
      {description ? <div style={{ marginTop: 6 }}>{description}</div> : null}
    </div>
  )
}
