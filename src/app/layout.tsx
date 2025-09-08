import type { ReactNode } from 'react'

import '@/styles/globals.css'
import { pretendard } from '@/components/fonts'

export const metadata = {
  title: 'Crema',
  description: '내게 꼭 맞는 대화 한 잔',
}
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
        <main>{children}</main>
      </body>
    </html>
  )
}
