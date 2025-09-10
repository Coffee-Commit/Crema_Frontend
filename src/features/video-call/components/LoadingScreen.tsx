'use client'

import React from 'react'

interface LoadingScreenProps {
  message?: string
}

export default function LoadingScreen({
  message = '연결 중...',
}: LoadingScreenProps) {
  return (
    <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-[var(--color-gray-900)]">
      <div className="text-center text-[var(--color-fill-white)]">
        <div className="mb-[var(--spacing-spacing-md)]">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-label-primary)]"></div>
        </div>
        <p className="font-label3-semibold">{message}</p>
      </div>
    </div>
  )
}
