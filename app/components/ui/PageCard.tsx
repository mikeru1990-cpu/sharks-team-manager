type Props = {
  children: React.ReactNode
}

export default function PageCard({
  children,
}: Props) {
  return (
    <div
      className="
        bg-white
        border
        border-slate-200
        rounded-3xl
        p-5
        shadow-sm
      "
    >
      {children}
    </div>
  )
}
