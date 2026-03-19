import type { Metadata, Viewport } from "next"
import "../globals.css"

export const metadata: Metadata = {
  title: "Sharks Team Manager Pro",
  description: "Professional football team manager app",
  applicationName: "Sharks Team Manager Pro",
}

export const viewport: Viewport = {
  themeColor: "#06245c",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#f4f7fb",
          color: "#0f172a",
          overflowX: "hidden",
        }}
      >
        {children}
      </body>
    </html>
  )
}
