'use client'

import { useAuthStore } from '@/store/useAuthStore'

export default function Header() {
  const { isLoggedIn, login, logout } = useAuthStore()

  return (
    <header className="border-border-light bg-bg-default border-b">
      <div className="container flex h-14 items-center justify-between">
        {/* 로고 + 가이드 */}
        <div className="gap-spacing-3xs flex items-center">
          <span className="text-label-primary font-title3">
            Crema
          </span>
          <span className="font-body2 text-label-default hidden md:inline">
            가이드 찾기
          </span>
        </div>

        {/* 로그인 여부에 따라 다르게 */}
        {isLoggedIn ? (
          <div className="gap-spacing-3xs flex items-center">
            <button className="text-label-subtle">
              <span className="i-lucide-bell h-5 w-5" />
            </button>
            <div className="rounded-circle bg-border-medium h-6 w-6" />
            <button className="px-spacing-4xs rounded-sm bg-green-400 py-0.5 text-xs text-white">
              루키
            </button>
            <button
              onClick={logout}
              className="ml-spacing-4xs text-label-subtle text-xs underline"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div className="gap-spacing-3xs flex items-center">
            <span className="px-spacing-3xs font-caption1 bg-label-primary rounded-xl py-1 text-white">
              nnn명의 루키가 당신의 경험을 기다리고 있어요!
            </span>
            <button
              onClick={login}
              className="rounded-xs px-spacing-xs border-border-light border bg-white py-1 text-sm"
            >
              로그인
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
