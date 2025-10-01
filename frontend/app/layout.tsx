import type React from "react"
import type { Metadata } from "next"
import "../src/App.css"

export const metadata: Metadata = {
  title: "Alerte Communautaire",
  description: "Application d'alerte communautaire",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
