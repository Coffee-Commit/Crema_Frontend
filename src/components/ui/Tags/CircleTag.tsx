'use client'

import clsx from 'clsx'
import { ReactNode } from 'react'

type CircleTagVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'light'
  | 'disabled'

interface CircleTagProps {
  children: ReactNode
  variant?: CircleTagVariant
  className?: string
}

const VARIANT_STYLES: Record<CircleTagVariant, string> = {
  primary: 'bg-fill-primary text-label-white',
  secondary: 'bg-fill-tooltip-orange text-label-white',
  outline:
    'border border-fill-primary text-fill-primary bg-fill-white',
  light:
    'bg-fill-input-gray text-label-subtle border border-border-light',
  disabled: 'bg-fill-medium text-label-white',
}

export default function CircleTag({
  children,
  variant = 'primary',
  className,
}: CircleTagProps) {
  return (
    <span
      className={clsx(
        'px-spacing-4xs font-label4-semibold inline-flex w-fit items-center justify-center rounded-full py-[6px]',
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
