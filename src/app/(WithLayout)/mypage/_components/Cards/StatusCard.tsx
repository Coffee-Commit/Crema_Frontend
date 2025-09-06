'use client'

import clsx from 'clsx'
import { EllipsisVertical } from 'lucide-react'

interface StatusCardProps {
  label: string
  count: number
  onClick?: () => void
}

export default function StatusCard({
  label,
  count,
  onClick,
}: StatusCardProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : -1}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className={clsx(
        'gap-spacing-xs p-spacing-2xs shadow-emphasize group relative',
        'flex cursor-pointer flex-col justify-center rounded-sm',
        'transition-colors duration-150',
        'hover:bg-fill-selected-orange w-full',
      )}
    >
      <EllipsisVertical
        className={clsx(
          'right-spacing-2xs top-spacing-2xs absolute',
          'opacity-0 transition-opacity duration-150',
          'group-hover:opacity-100',
          'text-label-default',
        )}
        size={24}
        strokeWidth={2}
        aria-hidden
      />

      <span className="font-label3-semibold text-label-deep">
        {label}
      </span>
      <span className="font-title2-bold text-label-strong">
        {count}건
      </span>
    </div>
  )
}
