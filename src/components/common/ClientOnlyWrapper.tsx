/**
 * 클라이언트 전용 컴포넌트 래퍼
 * SSR 중에는 렌더링하지 않고, 브라우저에서만 렌더링
 */

'use client'

import { useEffect, useState } from 'react'

interface ClientOnlyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * 클라이언트에서만 렌더링되는 래퍼 컴포넌트
 */
export function ClientOnlyWrapper({
  children,
  fallback = null,
}: ClientOnlyWrapperProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // SSR 중에는 fallback 렌더링
  if (!hasMounted) {
    return <>{fallback}</>
  }

  // 클라이언트에서만 실제 children 렌더링
  return <>{children}</>
}

/**
 * 로딩 상태를 표시하는 기본 폴백 컴포넌트
 */
export function DefaultLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-gray-900)]">
      <div className="text-center text-[var(--color-fill-white)]">
        <div className="mb-[var(--spacing-spacing-md)]">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-label-primary)]"></div>
        </div>
        <p className="font-label3-semibold">초기화 중...</p>
      </div>
    </div>
  )
}

/**
 * 에러 상태를 표시하는 폴백 컴포넌트
 */
export function ErrorFallback({ error }: { error?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-gray-900)] p-[var(--spacing-spacing-xs)]">
      <div className="w-full max-w-md rounded-[var(--radius-lg)] bg-[var(--color-fill-white)] p-[var(--spacing-spacing-lg)] text-center">
        <div className="mb-[var(--spacing-spacing-md)] text-[var(--color-label-error)]">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="mx-auto"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
        <h2 className="font-title3 mb-[var(--spacing-spacing-6xs)] text-[var(--color-label-deep)]">
          초기화 실패
        </h2>
        <p className="font-body2 mb-[var(--spacing-spacing-md)] text-[var(--color-label-default)]">
          {error || '브라우저가 화상통화를 지원하지 않습니다.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="font-label4-medium rounded-[var(--radius-sm)] bg-[var(--color-fill-primary)] px-[var(--spacing-spacing-xs)] py-[var(--spacing-spacing-6xs)] text-[var(--color-fill-white)] transition-all hover:brightness-110"
        >
          페이지 새로고침
        </button>
      </div>
    </div>
  )
}
