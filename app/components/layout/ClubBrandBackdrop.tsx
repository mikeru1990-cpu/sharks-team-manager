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
          right: -120,
          top: 70,
          width: 420,
          height: 420,
          opacity: 0.07,
          transform: "rotate(-12deg)",
          filter: "drop-shadow(0 30px 80px rgba(56,189,248,0.18))",
          backgroundImage: "url('/sharks-official-badge.svg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          backgroundPosition: "center",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: -60,
          bottom: 40,
          width: 320,
          height: 320,
          opacity: 0.05,
          transform: "rotate(10deg)",
          filter: "drop-shadow(0 20px 50px rgba(37,99,235,0.18))",
          backgroundImage: "url('/sharks-official-badge.svg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          backgroundPosition: "center",
        }}
      />

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

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(2,6,23,0) 0%, rgba(2,6,23,0.12) 40%, rgba(2,6,23,0.42) 100%)",
        }}
      />
    </div>
  )
}
