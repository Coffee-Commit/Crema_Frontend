import type { ReactNode } from 'react'
import '@/styles/globals.css'

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <main className="container h-full">{children}</main>
      </body>
    </html>
  )
}
