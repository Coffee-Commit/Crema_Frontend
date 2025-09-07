import type { ReactNode } from 'react'
import '@/styles/globals.css'

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-[#F6F6F6]">{children}</body>
    </html>
  )
}
