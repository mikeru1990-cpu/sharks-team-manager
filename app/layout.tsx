export const metadata = {
  title: "Sharks Team Manager",
  description: "Team management for players, attendance and live match tracking",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sharks Manager",
  },
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
          padding: 0,
          background: "#ffffff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  )
}
