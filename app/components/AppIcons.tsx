"use client"

type IconProps = {
  size?: number
  stroke?: number
  color?: string
}

function iconProps(size = 22, color = "currentColor") {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    style: { display: "block", color },
  }
}

export function HomeIcon({
  size = 22,
  color = "currentColor",
  stroke = 2,
}: IconProps) {
  return (
    <svg {...iconProps(size, color)}>
      <path d="M3 10.5L12 3l9 7.5" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5V20h14V9.5" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 20v-6h5v6" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CalendarIcon({
  size = 22,
  color = "currentColor",
  stroke = 2,
}: IconProps) {
  return (
    <svg {...iconProps(size, color)}>
      <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth={stroke} />
      <path d="M8 3v4M16 3v4M3 9h18" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function FootballIcon({
  size = 22,
  color = "currentColor",
  stroke = 2,
}: IconProps) {
  return (
    <svg {...iconProps(size, color)}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={stroke} />
      <path d="M12 8.2l2.4 1.7-.9 2.8h-3l-.9-2.8L12 8.2z" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 12.7L7 14.6m10-1.9l-2.5 1.9M9 8.8L6.8 7m8.2 1.8L17.2 7M10.2 16.8L9.3 19m5.5-2.2l.9 2.2" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function UsersIcon({
  size = 22,
  color = "currentColor",
  stroke = 2,
}: IconProps) {
  return (
    <svg {...iconProps(size, color)}>
      <path d="M16.5 19a4.5 4.5 0 00-9 0" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth={stroke} />
      <path d="M20 19a3.5 3.5 0 00-2.8-3.4M4 19a3.5 3.5 0 012.8-3.4" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ChartIcon({
  size = 22,
  color = "currentColor",
  stroke = 2,
}: IconProps) {
  return (
    <svg {...iconProps(size, color)}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CapIcon({
  size = 22,
  color = "currentColor",
  stroke = 2,
}: IconProps) {
  return (
    <svg {...iconProps(size, color)}>
      <path d="M4 12c2.5-3.8 13.5-3.8 16 0-2.5 1.9-13.5 1.9-16 0z" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 12.2V15c0 1.2-2.7 2.5-6 2.5S6 16.2 6 15v-2.8" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 12.2v3.3" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
