'use client'

import clsx from 'clsx'

interface DividerProps {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export default function Divider({
  orientation = 'horizontal',
  className,
}: DividerProps) {
  return (
    <div
      className={clsx(
        orientation === 'horizontal'
          ? 'border-fill-disabled w-full border-t'
          : 'border-fill-disabled h-full border-l',
        className,
      )}
    />
  )
}
