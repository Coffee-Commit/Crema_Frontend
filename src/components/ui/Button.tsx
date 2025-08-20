import { ButtonHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

type Variant = 'solid' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
}

const sizeMap: Record<Size, string> = {
  sm: 'px-2unit py-1 text-sm',
  md: 'px-2.5unit py-1.5 text-sm',
  lg: 'px-3unit py-2 text-base',
}

const variantMap: Record<Variant, string> = {
  solid: 'bg-brand text-white hover:bg-brand-700',
  outline:
    'border border-gray-300 text-text-primary hover:bg-brand-50',
  ghost: 'text-text-primary hover:bg-brand-50',
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  function Button(
    {
      className,
      variant = 'solid',
      size = 'md',
      isLoading,
      disabled,
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center rounded-[var(--radius-xl)] transition-colors',
          sizeMap[size],
          variantMap[variant],
          (isLoading || disabled) && 'cursor-not-allowed opacity-60',
          className,
        )}
        aria-busy={isLoading || undefined}
        disabled={isLoading || disabled}
        {...rest}
      >
        {isLoading ? '로딩 중...' : children}
      </button>
    )
  },
)
