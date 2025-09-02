'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { useAuthStore } from '@/store/useAuthStore'

export default function AuthCallbackPage() {
  const init = useAuthStore((s) => s.init)
  const user = useAuthStore((s) => s.user) // ✅ 상태 확인용
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const status = searchParams.get('status')
    if (status === 'success') {
      init().then(() => {
        console.log('✅ Zustand user 상태:', user) // 👈 여기
        router.replace('/')
      })
    } else if (status === 'error') {
      const message = searchParams.get('message') || '로그인 실패'
      alert(`로그인 오류: ${message}`)
      router.replace('/login')
    }
  }, [init, router, searchParams, user])

  return <p>로그인 처리중입니다...</p>
}
