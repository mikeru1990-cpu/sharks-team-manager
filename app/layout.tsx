import type { Metadata, Viewport } from "next"
import ServiceWorkerRegister from "./components/ServiceWorkerRegister"
import "../globals.css"

export const metadata: Metadata = {
  title: "Sharks Team Manager",
  description: "Team manager app for players, events, attendance and match planning.",
  applicationName: "Sharks Team Manager",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sharks",
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: "#0f172a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  )
}
