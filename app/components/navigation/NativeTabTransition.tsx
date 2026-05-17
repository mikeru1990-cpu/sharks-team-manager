"use client"

import { useEffect, useRef } from "react"
import type { ReactNode } from "react"

type Props = {
  activeKey: string
  children: ReactNode
}

export default function NativeTabTransition({
  activeKey,
  children,
}: Props) {
  const previousKey = useRef(activeKey)

  useEffect(() => {
    if (previousKey.current !== activeKey) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })

      previousKey.current = activeKey
    }
  }, [activeKey])

  return (
    <div
      key={activeKey}
      style={{
        animation: "nativeScreenFade 0.22s ease-out",
        minHeight: "100%",
      }}
    >
      {children}

      <style jsx>{`
        @keyframes nativeScreenFade {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
