'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { useAuthStore } from '@/store/useAuthStore'

export default function OAuthRedirectInner() {
  const init = useAuthStore((s) => s.init)
  const user = useAuthStore((s) => s.user)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const router = useRouter()
  const searchParams = useSearchParams()

  // 1) 최초 콜백 처리
  useEffect(() => {
    const status = searchParams.get('status')
    if (status === 'success') {
      init().then(() => {
        console.log('init 실행 완료')
        router.replace('/')
      })
    } else if (status === 'error') {
      const message = searchParams.get('message') || '로그인 실패'
      alert(`로그인 오류: ${message}`)
      router.replace('/login')
    }
  }, [init, router, searchParams])

  // 2) 상태 변화 감시
  useEffect(() => {
    console.log('로그인 여부:', isLoggedIn)
    if (user) {
      console.log('로그인된 유저 정보:', user)
    } else {
      console.log('user가 아직 없음')
    }
  }, [user, isLoggedIn])

  return <p>로그인 처리중입니다...</p>
}
