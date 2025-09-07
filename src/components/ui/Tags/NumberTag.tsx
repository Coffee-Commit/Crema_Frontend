'use client'

import clsx from 'clsx'

interface NumberTagProps {
  value: number
  max?: number
  className?: string
}

export default function NumberTag({
  value,
  max = 99,
  className,
}: NumberTagProps) {
  // max를 넘어가면 "99+" 같은 식으로 표기
  const displayValue = value > max ? `${max}+` : value

  return (
    <span
      className={clsx(
        'bg-fill-primary text-label-white font-label4-semibold inline-flex h-6 w-fit min-w-[24px] items-center justify-center rounded-full px-2',
        className,
      )}
    >
      {displayValue}
    </span>
  )
}
