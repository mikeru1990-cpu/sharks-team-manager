"use client"

export default function ClubBrandBackdrop() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 15% 8%, rgba(56,189,248,0.22), transparent 32%), radial-gradient(circle at 85% 12%, rgba(37,99,235,0.28), transparent 34%), radial-gradient(circle at 50% 100%, rgba(14,165,233,0.14), transparent 42%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.08,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage:
            "radial-gradient(circle at center, black 0%, transparent 78%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          right: -72,
          top: 92,
          width: 270,
          height: 270,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.10)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(14,165,233,0.07))",
          display: "grid",
          placeItems: "center",
          color: "rgba(255,255,255,0.11)",
          fontSize: 66,
          fontWeight: 1000,
          letterSpacing: "-0.08em",
          transform: "rotate(-12deg)",
          boxShadow: "0 40px 100px rgba(14,165,233,0.14)",
        }}
      >
        LSFC
      </div>

      <div
        style={{
          position: "absolute",
          left: -26,
          bottom: 104,
          fontSize: 138,
          lineHeight: 1,
          opacity: 0.055,
          transform: "rotate(-10deg)",
          filter: "drop-shadow(0 20px 40px rgba(56,189,248,0.25))",
        }}
      >
        🦈
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "38%",
          width: 520,
          height: 180,
          transform: "translateX(-50%) rotate(-9deg)",
          borderRadius: "999px",
          background:
            "linear-gradient(90deg, transparent, rgba(56,189,248,0.08), transparent)",
          filter: "blur(4px)",
        }}
      />
    </div>
  )
}
