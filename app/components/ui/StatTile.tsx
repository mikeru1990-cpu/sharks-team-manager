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
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
      <div className="text-sm font-semibold text-slate-500 mb-2">
        {label}
      </div>

      <div className="text-3xl font-black text-slate-900">
        {value}
      </div>

      {subtitle && (
        <div className="text-sm text-slate-500 mt-2">
          {subtitle}
        </div>
      )}
    </div>
  )
}
