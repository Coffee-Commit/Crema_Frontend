'use client'

import { useRouter } from 'next/navigation'
import { Suspense, useEffect } from 'react'

import Loading from '@/components/common/LoadingState'
import { useAuthStore } from '@/store/useAuthStore'
import { useModalStore } from '@/store/useModalStore'

import MentorPage from './_components/MentorPage'

export default function SearchGuidePage() {
  const { user, isHydrated } = useAuthStore()
  const { openModal, closeModal } = useModalStore()
  const router = useRouter()

  useEffect(() => {
    if (!isHydrated) return
    if (!user) {
      openModal({
        title: '로그인이 필요합니다',
        message: '로그인 후 이용할 수 있는 서비스입니다.',
        confirmText: '로그인하기',
        onConfirm: () => {
          closeModal()
          router.push('/login') // ✅ 로그인 페이지로 리다이렉트
        },
      })
    }
  }, [user, openModal, closeModal, router, isHydrated])

  return (
    <Suspense fallback={<Loading />}>
      <MentorPage />
    </Suspense>
  )
}
