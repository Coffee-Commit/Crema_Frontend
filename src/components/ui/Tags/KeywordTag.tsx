import clsx from 'clsx'
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
      className={clsx(
        'rounded-2xs inline-flex w-fit items-center justify-center transition-colors duration-200',
        'bg-fill-input-gray text-label-default',
        'hover:bg-fill-primary hover:text-label-white',
        'px-spacing-5xs py-spacing-4xs font-label4-semibold',
        'md:px-spacing-5xs md:py-spacing-5xs md:font-label5-semibold',
        className,
      )}
    >
      {children}
    </span>
  )
}
