type Props = {
  title: string
  subtitle?: string
}

export default function SectionHeader({
  title,
  subtitle,
}: Props) {
  return (
    <div className="mb-4">
      <div className="text-2xl font-black text-slate-900">
        {title}
      </div>

      {subtitle && (
        <div className="text-sm text-slate-500 mt-1">
          {subtitle}
        </div>
      )}
    </div>
  )
}
