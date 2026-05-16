type Props = {
  children: React.ReactNode
}

export default function PageCard({
  children,
}: Props) {
  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-[28px]
        border
        border-white/10
        bg-white/[0.06]
        backdrop-blur-xl
        p-6
        shadow-[0_20px_50px_rgba(0,0,0,0.35)]
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-br
          from-white/[0.08]
          via-transparent
          to-blue-500/[0.05]
        "
      />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
