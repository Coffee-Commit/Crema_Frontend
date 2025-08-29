import type { ReactNode } from 'react'

import '@/styles/globals.css'

import { pretendard } from '@/components/fonts'

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html
      lang="ko"
      className={pretendard.variable}
    >
      <body>
        <main className="container h-full">{children}</main>
      </body>
    </html>
  )
}
