'use client'

import clsx from 'clsx'

interface ExperienceCardProps {
  title: string
  description: string
  tag?: string
  tagColor?: 'primary' | 'secondary'
  className?: string
}

export default function ExperienceCard({
  title,
  description,
  tag,
  tagColor = 'primary',
  className,
}: ExperienceCardProps) {
  return (
    <div
      className={clsx(
        'shadow-card relative flex flex-col rounded-sm bg-white',
        'border-l-fill-primary border-l-[12px]', // 왼쪽 보더 강조
        className,
      )}
    >
      <div className="px-spacing-3xl py-spacing-md gap-spacing-md flex flex-col">
        <div className="flex flex-row justify-between">
          <h3 className="font-title3 text-label-deep">{title}</h3>
          {/* 오른쪽 상단 태그 */}
          {tag && (
            <span
              className={clsx(
                'p-spacing-5xs rounded-2xs font-label5-semibold h-fit w-fit',
                tagColor === 'primary'
                  ? 'bg-fill-selected-orange text-fill-primary'
                  : 'bg-fill-medium text-label-white',
              )}
            >
              {tag}
            </span>
          )}
        </div>
        <p className="font-caption2-medium text-label-strong">
          {description}
        </p>
      </div>
    </div>
  )
}
