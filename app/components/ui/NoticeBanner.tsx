"use client"

type Props = {
  tone?: "success" | "warning" | "error" | "info"
  text: string
}

export default function NoticeBanner({ tone = "info", text }: Props) {
  const styles =
    tone === "success"
      ? { background: "#dcfce7", border: "1px solid #86efac", color: "#166534" }
      : tone === "warning"
      ? { background: "#fef3c7", border: "1px solid #fcd34d", color: "#92400e" }
      : tone === "error"
      ? { background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b" }
      : { background: "#dbeafe", border: "1px solid #93c5fd", color: "#1d4ed8" }

  return (
    <div
      style={{
        ...styles,
        padding: 12,
        borderRadius: 12,
        fontWeight: 700,
      }}
    >
      {text}
    </div>
  )
}
