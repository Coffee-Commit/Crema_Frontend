'use client'

import { useAuthStore } from '@/store/useAuthStore'

export default function Header() {
  const { isLoggedIn, login, logout } = useAuthStore()

  return (
    <header className="border-b border-[var(--color-border-light)] bg-[var(--color-bg-default)]">
      <div className="container flex h-14 items-center justify-between">
        {/* 로고 + 가이드 */}
        <div className="gap-spacing-16 flex items-center">
          <span className="text-label-primary font-title3">
            Crema
          </span>
          <span className="font-body2 hidden text-[var(--color-label-default)] md:inline">
            가이드 찾기
          </span>
        </div>

        {/* 로그인 여부에 따라 다르게 */}
        {isLoggedIn ? (
          <div className="gap-spacing-16 flex items-center">
            <button className="text-[var(--color-label-subtle)]">
              <span className="i-lucide-bell h-5 w-5" />
            </button>
            <div className="rounded-radius-full h-6 w-6 bg-[var(--color-border-medium)]" />
            <button className="rounded-radius-12 px-spacing-12 bg-green-400 py-[2px] text-xs text-white">
              루키
            </button>
            <button
              onClick={logout}
              className="ml-spacing-12 text-xs text-[var(--color-label-subtle)] underline"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div className="gap-spacing-16 flex items-center">
            <span className="rounded-radius-24 px-spacing-16 font-caption1 bg-[var(--color-label-primary)] py-[4px] text-white">
              nnn명의 루키가 당신의 경험을 기다리고 있어요!
            </span>
            <button
              onClick={login}
              className="rounded-radius-8 px-spacing-12 border border-[var(--color-border-light)] bg-white py-[4px] text-sm"
            >
              로그인
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
