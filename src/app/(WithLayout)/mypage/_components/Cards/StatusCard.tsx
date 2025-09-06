'use client'

import clsx from 'clsx'

interface StatusCardProps {
  label: string
  count: number
  active?: boolean
}

export default function StatusCard({
  label,
  count,
  active,
}: StatusCardProps) {
  return (
    <div
      className={clsx(
        'shadow-card p-spacing-md gap-spacing-xs flex w-[240px] flex-col rounded-md border',
        active
          ? 'bg-fill-selected-orange border-fill-primary'
          : 'bg-fill-white border-border-subtle',
      )}
    >
      <p
        className={clsx(
          'font-label4-semibold',
          active
            ? 'text-label-white bg-fill-primary px-spacing-2xs w-fit rounded-sm py-[2px]'
            : 'text-label-strong',
        )}
      >
        {label}
      </p>
      <span className="font-title1-bold text-label-deep">
        {count}건
      </span>
    </div>
  )
}
