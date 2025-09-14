import clsx from 'clsx'
import { ReactNode } from 'react'

type KeywordTagVariant = 'default' | 'primary' | 'secondary'

interface KeywordTagProps {
  children: ReactNode
  className?: string
  variant?: KeywordTagVariant
  disableHover?: boolean // ✅ hover 제어 prop 추가
}

const VARIANT_STYLES: Record<KeywordTagVariant, string> = {
  default:
    'bg-fill-white text-label-default hover:bg-fill-primary hover:text-label-white',
  primary: 'bg-fill-primary text-label-white hover:brightness-110',
  secondary:
    'bg-fill-input-gray text-label-strong hover:brightness-90',
}

export default function KeywordTag({
  children,
  className = '',
  variant = 'default',
  disableHover = false, // 기본값: hover 가능
}: KeywordTagProps) {
  const variantStyle = disableHover
    ? VARIANT_STYLES[variant].replace(/hover:[^\s]+/g, '') // hover 부분 제거
    : VARIANT_STYLES[variant]

  return (
    <span
      className={clsx(
        'rounded-2xs inline-flex w-fit items-center justify-center transition-colors duration-200',
        'px-spacing-5xs py-spacing-4xs sm:font-label4-semibold',
        'md:px-spacing-5xs md:py-spacing-5xs font-label5-semibold',
        variantStyle,
        className,
      )}
    >
      {children}
    </span>
  )
}
