"use client"

import { ReactNode } from "react"
import { cardStyle } from "../../lib/types"

type Props = {
  title?: string
  children: ReactNode
  tone?: string
}

export default function SectionCard({ title, children, tone }: Props) {
  return (
    <div style={cardStyle(tone)}>
      {title ? (
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>{title}</div>
      ) : null}
      {children}
    </div>
  )
}
