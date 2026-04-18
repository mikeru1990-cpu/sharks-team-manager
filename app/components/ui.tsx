import { THEME } from "../lib/theme"

export function PageCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: THEME.colors.surface,
        borderRadius: THEME.radius.card,
        padding: 16,
        border: `1px solid ${THEME.colors.border}`,
        boxShadow: THEME.shadow.card,
      }}
    >
      {children}
    </div>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 20,
        fontWeight: 800,
        color: THEME.colors.textPrimary,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  )
}

export function PrimaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: THEME.colors.primary,
        color: "white",
        border: "none",
        padding: "12px 16px",
        borderRadius: THEME.radius.button,
        fontWeight: 700,
        cursor: "pointer",
        width: "100%",
      }}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: THEME.colors.secondary,
        color: "#000",
        border: "none",
        padding: "12px 16px",
        borderRadius: THEME.radius.button,
        fontWeight: 700,
        cursor: "pointer",
        width: "100%",
      }}
    >
      {children}
    </button>
  )
}
