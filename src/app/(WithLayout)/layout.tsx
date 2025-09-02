import type { ReactNode } from 'react'

import '@/styles/globals.css'

import { pretendard } from '@/components/fonts'
import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'

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
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
