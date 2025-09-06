'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useAuthStore } from '@/store/useAuthStore'
import { useModalStore } from '@/store/useModalStore'

import MypageSidebar from './_components/SideBars/MypageSidebar'

export default function MypageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isLoggedIn } = useAuthStore()
  const { openModal } = useModalStore()

  // 로그인 안 된 경우 모달 띄우기
  useEffect(() => {
    if (!isLoggedIn || !user) {
      openModal({
        title: '로그인 필요',
        message: '마이페이지는 로그인 후 이용할 수 있습니다.',
        confirmText: '로그인 페이지로 이동',
        onConfirm: () => router.push('/login'),
      })
    }
  }, [isLoggedIn, user, openModal, router])

  // 로그인 안 된 상태일 때는 children 안 보이게
  if (!isLoggedIn || !user) {
    return (
      <div className="bg-fill-disabled flex h-screen items-center justify-center" />
    )
  }

  return (
    <>
      <section className="bg-fill-banner-yellow">
        <div className="container mx-auto h-[180px]" />
      </section>
      <section className="px-container-padding-sm py-spacing-6xl lg:px-container-padding-lg container mx-auto flex gap-[108px]">
        <div className="relative z-10 -mt-[130px]">
          <MypageSidebar user={user!} />
        </div>
        <div className="gap-spacing-6xl mr-[84px] flex flex-1 flex-col">
          {children}
        </div>
      </section>
    </>
  )
}
