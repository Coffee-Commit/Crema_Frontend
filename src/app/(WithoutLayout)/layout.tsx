import type { ReactNode } from 'react'

import '@/styles/globals.css'
import ModalProvider from '@/components/common/ModalProvider'
import { pretendard } from '@/components/fonts'

export default function WithoutLayoutRoot({
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
        <main className="h-dvh overflow-hidden">{children}</main>
        <ModalProvider />
      </body>
    </html>
  )
}