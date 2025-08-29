import { ReactNode } from 'react'

interface InfoBadgeProps {
  children: ReactNode
  className?: string
}

export default function InfoBadge({
  children,
  className = '',
}: InfoBadgeProps) {
  return (
    <span
      className={`font-label4-semibold inline-flex items-center justify-center rounded-[var(--radius-circle)] bg-[var(--color-fill-light)] px-[var(--spacing-spacing-4xs)] py-[6px] text-[var(--color-label-white)] ${className}`}
    >
      {children}
    </span>
  )
}
