'use client'

import { Suspense } from 'react'

import OAuthRedirectInner from './oauthRedirectInner'

// CSR 전용 설정
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default function OAuthRedirectPage() {
  return (
    <Suspense fallback={<p>로그인 처리중입니다...</p>}>
      <OAuthRedirectInner />
    </Suspense>
  )
}
