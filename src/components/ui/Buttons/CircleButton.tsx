import { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'disabled'
type ButtonSize = 'sm' | 'md' | 'lg'

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
    hover:brightness-110
    active:brightness-90
  `,
  disabled: `
    bg-[var(--color-fill-disabled)] 
    text-[var(--color-label-subtle)] 
    border-none
    cursor-not-allowed
  `,
}

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'h-8 px-[var(--spacing-spacing-3xs)] text-label4-medium',
  md: 'h-10 px-[var(--spacing-spacing-2xs)] text-label4-medium',
  lg: 'h-12 px-[var(--spacing-spacing-2xs)] text-label3',
}

export default function CircleButton({
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
        'inline-flex w-fit cursor-pointer items-center justify-center rounded-[var(--radius-circle)] transition-all duration-150',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
