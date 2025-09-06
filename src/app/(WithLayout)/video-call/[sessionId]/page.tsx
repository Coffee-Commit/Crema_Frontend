'use client'

import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function VideoCallPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  useEffect(() => {
    // 구식 URL 형식이므로 사용자에게 안내 후 홈으로 리다이렉트
    router.replace('/video-call/create')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-gray-900)]">
      <div className="text-center text-[var(--color-fill-white)]">
        <h2 className="font-title3 mb-[var(--spacing-spacing-6xs)]">
          페이지 이동 중
        </h2>
        <p className="font-body2 text-[var(--color-label-subtle)]">
          새로운 방식으로 이동합니다...
        </p>
      </div>
    </div>
  )
}
