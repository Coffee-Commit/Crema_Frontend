import clsx from 'clsx'
import { ReactNode } from 'react'

type KeywordTagSize = 'md' | 'lg'

interface KeywordTagProps {
  children: ReactNode
  className?: string
  size?: KeywordTagSize
}

const SIZE_STYLES: Record<KeywordTagSize, string> = {
  md: `
    h-fit
    px-[var(--spacing-spacing-5xs)] 
    py-[var(--spacing-spacing-5xs)] 
    font-label5-semibold
  `,
  lg: `
    h-fit
    px-[var(--spacing-spacing-5xs)] 
    py-[var(--spacing-spacing-4xs)] 
    font-label4-semibold
  `,
}

export default function KeywordTag({
  children,
  size = 'md',
  className = '',
}: KeywordTagProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center rounded-[var(--radius-2xs)]',
        'bg-[var(--color-label-white)] text-[var(--color-label-default)]',
        SIZE_STYLES[size],
        className,
      )}
    >
      {children}
    </span>
  )
}
