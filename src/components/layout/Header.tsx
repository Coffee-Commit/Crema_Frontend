'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'

import SquareButton from '@/components/ui/Buttons/SquareButton'
import UserDropdownMenu from '@/components/ui/Menus/UserDropdownMenu'
import { useAuthStore } from '@/store/useAuthStore'

export default function Header() {
  const router = useRouter()
  const { user, isLoggedIn } = useAuthStore()

  // 👇 하이드레이션 미스매치 방지: 마운트 전에는 항상 동일한 UI(스켈레톤)만 렌더
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <header className="flex h-[68px] w-full items-center justify-between">
      <div className="container flex h-14 items-center justify-between">
        {/* 로고 + 가이드 */}
        <div className="gap-spacing-xs flex items-center">
          <span
            className="text-label-deep font-title3 cursor-pointer"
            onClick={() => router.push('/')}
          >
            Crema
          </span>
          <span className="font-body2 text-label-default hidden md:inline">
            선배 찾기
          </span>
          <span className="font-label4-semibold text-label-strong bg-fill-tooltip-orange rounded-xs px-spacing-4xs py-spacing-6xs relative">
            궁금할 땐 선배에게! 경험을 나누는 대화, 지금 시작해요.
            <span className="border-r-fill-tooltip-orange absolute left-0 top-1/2 h-0 w-0 -translate-x-[95%] -translate-y-1/2 border-y-[4px] border-r-[5px] border-y-transparent"></span>
          </span>
        </div>

        {/* 우측: 마운트 전에는 항상 동일한 스켈레톤으로 SSR/CSR 첫 렌더를 일치시킨다 */}
        {!mounted ? (
          <div className="gap-spacing-xs flex items-center">
            <div
              className="bg-fill-disabled h-[26px] w-[26px] rounded-sm"
              aria-hidden
            />
            <div
              className="bg-fill-disabled h-9 w-[120px] rounded-sm"
              aria-hidden
            />
          </div>
        ) : isLoggedIn && user ? (
          <div className="gap-spacing-xs flex items-center">
            <Bell
              className="text-label-strong h-[26px] w-[26px]"
              aria-hidden
            />
            <UserDropdownMenu />
          </div>
        ) : (
          <div className="gap-spacing-xs flex items-center">
            <SquareButton
              onClick={() => router.push('/login')}
              variant="tertiary"
              size="md"
            >
              로그인
            </SquareButton>
          </div>
        )}
      </div>
    </header>
  )
}
