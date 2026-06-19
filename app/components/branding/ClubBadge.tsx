"use client"

type Props = {
  size?: number
  label?: string
  variant?: "card" | "plain"
}

export default function ClubBadge({ size = 58, label = "Leonard Stanley Youth Football Academy", variant = "card" }: Props) {
  return (
    <div
      aria-label={label}
      role="img"
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: variant === "card" ? Math.max(14, Math.round(size * 0.28)) : 0,
        padding: variant === "card" ? Math.max(4, Math.round(size * 0.08)) : 0,
        background: variant === "card" ? "rgba(255,255,255,0.96)" : "transparent",
        border: variant === "card" ? "1px solid rgba(125,211,252,0.30)" : "none",
        boxShadow: variant === "card" ? "0 14px 30px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.7)" : "none",
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
        flex: "0 0 auto",
      }}
    >
      <img
        src="/sharks-official-badge.svg"
        alt=""
        aria-hidden="true"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
        }}
      />
    </div>
  )
}
