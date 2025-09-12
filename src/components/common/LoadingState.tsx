'use client'

import clsx from 'clsx'

interface FullPageLoadingProps {
  message?: string
  variant?: 'spinner' | 'dots'
  className?: string
}

export default function FullPageLoading({
  message = '로딩 중입니다...',
  variant = 'spinner',
  className,
}: FullPageLoadingProps) {
  return (
    <div
      className={clsx(
        'bg-fill-white/80 fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm',
        className,
      )}
    >
      {variant === 'spinner' ? (
        <div className="border-fill-primary mb-6 h-14 w-14 animate-spin rounded-full border-4 border-t-transparent" />
      ) : (
        <div className="mb-6 flex space-x-3">
          <span className="bg-fill-primary h-4 w-4 animate-bounce rounded-full [animation-delay:-0.3s]" />
          <span className="bg-fill-primary h-4 w-4 animate-bounce rounded-full [animation-delay:-0.15s]" />
          <span className="bg-fill-primary h-4 w-4 animate-bounce rounded-full" />
        </div>
      )}
      <p className="font-label3-semibold text-label-strong">
        {message}
      </p>
    </div>
  )
}
