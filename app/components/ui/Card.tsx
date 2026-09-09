import type { HTMLAttributes, ReactNode } from "react"
import clsx from "clsx"

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  elevated?: boolean
  interactive?: boolean
}

export default function Card({
  children,
  elevated = false,
  interactive = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        "fos-card",
        elevated && "fos-card--elevated",
        interactive && "fos-card--interactive",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
