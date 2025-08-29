import { ReactNode } from 'react'

interface KeywordTagProps {
  children: ReactNode
  className?: string
}

export default function KeywordTag({
  children,
  className = '',
}: KeywordTagProps) {
  return (
    <span
      className={`font-label5-medium md:font-label4-medium inline-flex h-[28px] items-center justify-center rounded-[var(--radius-2xs)] bg-[var(--color-label-white)] px-[var(--spacing-spacing-4xs)] py-[var(--spacing-spacing-7xs)] text-[var(--color-label-default)] md:h-[22px] md:px-[var(--spacing-spacing-5xs)] md:py-[var(--spacing-spacing-7xs)] ${className} `}
    >
      {children}
    </span>
  )
}
