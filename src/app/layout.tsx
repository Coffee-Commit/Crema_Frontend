import type { ReactNode } from 'react'

import '@/styles/globals.css'
import CoffeechatReviewModalProvider from '@/components/common/CoffeechatReviewModalProvider'
import { pretendard } from '@/components/fonts'

export const metadata = {
  title: 'Crema',
  description: '내게 꼭 맞는 대화 한 잔',
  icons: {
    icon: [
      {
        url: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/favicon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
    apple: '/apple-touch-icon.png',
  },
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
        <CoffeechatReviewModalProvider />
      </body>
    </html>
  )
}
