import clsx from 'clsx'
import { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'disabled'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  className?: string
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: `
    bg-[var(--color-label-primary)] 
    text-[var(--color-fill-white)] 
    border-none
    hover:brightness-110
    active:brightness-90
  `,
  secondary: `
    bg-[var(--color-fill-white)] 
    text-[var(--color-label-primary)] 
    border border-[var(--color-border-primary)]
    hover:brightness-110
    active:brightness-90
  `,
  tertiary: `
    bg-[var(--color-fill-white)] 
    text-[var(--color-label-default)] 
    border border-[var(--color-border-subtle)]
    hover:bg-[var(--color-label-primary)] 
    hover:text-[var(--color-fill-white)] 
    active:bg-[var(--color-label-primary)] 
    active:text-[var(--color-fill-white)] 
  `,
  disabled: `
    bg-[var(--color-fill-disabled)] 
    text-[var(--color-label-subtle)] 
    border-none
    cursor-not-allowed
  `,
}

const SIZE_STYLES: Record<ButtonSize, string> = {
  xs: 'h-[32px] px-[var(--spacing-spacing-4xs)] font-label4-medium',
  sm: 'h-[36px] px-[var(--spacing-spacing-3xs)] font-label4-medium',
  md: 'h-[40px] px-[var(--spacing-spacing-2xs)] font-label4-medium',
  lg: 'h-[44px] px-[var(--spacing-spacing-2xs)] font-label3-semibold',
  xl: 'h-[48px] px-[var(--spacing-spacing-2xs)] font-label1-semibold',
}

export default function SquareButton({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = variant === 'disabled'

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={clsx(
        'inline-flex w-fit cursor-pointer items-center justify-center transition-all duration-150',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        size === 'xl'
          ? 'rounded-[var(--radius-xs)]'
          : 'rounded-[var(--radius-2xs)]',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
