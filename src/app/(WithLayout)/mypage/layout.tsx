'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useAuthStore } from '@/store/useAuthStore'
import { useModalStore } from '@/store/useModalStore'

import MypageSidebarSkeleton from './_components/SideBars/MypageSidebarSkeleton'

// 클라 전용 사이드바
const MypageSidebarClient = dynamic(
  () => import('./_components/SideBars/MypageSidebar'),
  { ssr: false },
)

function SidebarPlaceholder() {
  return <MypageSidebarSkeleton />
}

export default function MypageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isLoggedIn } = useAuthStore()
  const { openModal } = useModalStore()

  // ⬇️ 서버/클라 첫 렌더 DOM을 동일하게 만들기 위한 마운트 게이트
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!isLoggedIn || !user) {
      if (location.pathname === '/login') return
      openModal({
        title: '로그인 필요',
        message: '마이페이지는 로그인 후 이용할 수 있습니다.',
        confirmText: '로그인 페이지로 이동',
        onConfirm: () => router.replace('/login'),
      })
    }
  }, [isLoggedIn, user, openModal, router])

  return (
    <>
      <section className="bg-fill-banner-yellow">
        <div className="container mx-auto h-[180px]" />
      </section>

      <section className="px-container-padding-sm py-spacing-6xl lg:px-container-padding-lg gap-spacing-xs container mx-auto flex">
        <div className="relative z-10 -mt-[130px] h-[1000px] w-[300px]">
          {/* 서버/클라 첫 렌더 모두 동일: placeholder 1개만 */}
          <SidebarPlaceholder />

          {/* 마운트 후 + user있을 때만 오버레이 추가 -> 첫 렌더 DOM 불일치 없음 */}
          {mounted && user && (
            <div className="absolute inset-0">
              <MypageSidebarClient user={user} />
            </div>
          )}
        </div>

        <div className="gap-spacing-6xl flex flex-1 flex-col">
          {children}
        </div>
      </section>
    </>
  )
}
