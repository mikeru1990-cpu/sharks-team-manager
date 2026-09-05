import type { InputHTMLAttributes } from "react"
import clsx from "clsx"

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
  error?: string
}

export default function Field({ label, hint, error, id, className, ...props }: FieldProps) {
  const fieldId = id ?? `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
  const messageId = `${fieldId}-message`

  return (
    <label className="fos-field" htmlFor={fieldId}>
      <span className="fos-field__label">{label}</span>
      <input
        id={fieldId}
        className={clsx("fos-input", error && "fos-input--error", className)}
        aria-invalid={Boolean(error)}
        aria-describedby={hint || error ? messageId : undefined}
        {...props}
      />
      {(error || hint) && (
        <span id={messageId} className={clsx("fos-field__message", error && "fos-field__message--error")}>
          {error ?? hint}
        </span>
      )}
    </label>
  )
}
