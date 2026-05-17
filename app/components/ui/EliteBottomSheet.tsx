"use client"

import { eliteTheme } from "../../lib/eliteTheme"
import type { ReactNode } from "react"

type Props = {
  open: boolean
  title?: string
  subtitle?: string
  children: ReactNode
  onClose?: () => void
}

export default function EliteBottomSheet({
  open,
  title,
  subtitle,
  children,
  onClose,
}: Props) {
  if (!open) return null

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(2,6,23,0.72)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 9998,
        }}
      />

      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          borderTopLeftRadius: eliteTheme.radius.xl,
          borderTopRightRadius: eliteTheme.radius.xl,
          border: `1px solid ${eliteTheme.colors.border}`,
          background: eliteTheme.gradients.card,
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          boxShadow: `${eliteTheme.shadows.large}, ${eliteTheme.shadows.glowBlue}`,
          overflow: "hidden",
          animation: "slideUp 0.24s ease-out",
        }}
      >
        <div
          style={{
            width: 56,
            height: 6,
            borderRadius: 999,
            background: "rgba(226,232,240,0.22)",
            margin: "12px auto 8px",
          }}
        />

        {(title || subtitle) && (
          <div
            style={{
              padding: `${eliteTheme.spacing.md}px ${eliteTheme.spacing.lg}px`,
              borderBottom: `1px solid ${eliteTheme.colors.border}`,
            }}
          >
            {title && (
              <div
                style={{
                  ...eliteTheme.typography.title,
                  color: eliteTheme.colors.text,
                  marginBottom: 4,
                }}
              >
                {title}
              </div>
            )}

            {subtitle && (
              <div
                style={{
                  ...eliteTheme.typography.caption,
                  color: eliteTheme.colors.textMuted,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        )}

        <div
          style={{
            padding: eliteTheme.spacing.lg,
            maxHeight: "72vh",
            overflowY: "auto",
          }}
        >
          {children}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}
