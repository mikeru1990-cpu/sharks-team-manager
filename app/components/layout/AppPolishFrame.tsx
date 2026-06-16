"use client"

export default function AppPolishFrame() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        background:
          "radial-gradient(circle at 12% 8%, rgba(56,189,248,0.12), transparent 28%), radial-gradient(circle at 90% 14%, rgba(250,204,21,0.08), transparent 24%), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px)",
        backgroundSize: "auto, auto, 44px 44px, 44px 44px",
      }}
    />
  )
}
