"use client"

type Props = {
  badgeUrl?: string
  wallpaperUrl?: string
  teamPhotoUrl?: string
}

export default function TeamMediaFields({ badgeUrl = "", wallpaperUrl = "", teamPhotoUrl = "" }: Props) {
  const items = [
    { label: "Badge", value: badgeUrl },
    { label: "Wallpaper", value: wallpaperUrl },
    { label: "Team Photo", value: teamPhotoUrl },
  ]

  return (
    <div className="sharks-glass" style={{ borderRadius: 20, padding: 14, display: "grid", gap: 10 }}>
      <div style={{ color: "white", fontWeight: 1000, fontSize: 18 }}>Team Media</div>
      {items.map((item) => (
        <div key={item.label} style={{ display: "grid", gridTemplateColumns: "100px minmax(0, 1fr)", gap: 10, alignItems: "center" }}>
          <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 900 }}>{item.label}</div>
          <div style={{ color: item.value ? "#bbf7d0" : "#cbd5e1", fontSize: 12, fontWeight: 850, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.value || "Not set"}
          </div>
        </div>
      ))}
    </div>
  )
}
