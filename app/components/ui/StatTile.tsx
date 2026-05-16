type Props = {
  label: string
  value: string | number
  subtitle?: string
}

export default function StatTile({
  label,
  value,
  subtitle,
}: Props) {
  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-[28px]
        border
        border-blue-400/10
        bg-gradient-to-br
        from-slate-900/95
        via-slate-900/88
        to-blue-950/80
        p-5
        shadow-[0_18px_40px_rgba(0,0,0,0.45)]
        backdrop-blur-xl
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_40%)]
        "
      />

      <div className="relative z-10 grid gap-3">
        <div
          className="
            text-[11px]
            font-black
            uppercase
            tracking-[0.14em]
            text-blue-200/80
          "
        >
          {label}
        </div>

        <div
          className="
            text-5xl
            font-black
            leading-none
            tracking-[-0.05em]
            text-white
          "
        >
          {value}
        </div>

        {subtitle && (
          <div
            className="
              text-sm
              font-medium
              text-slate-300
              leading-relaxed
            "
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  )
}
