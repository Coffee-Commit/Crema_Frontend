'use client'

import clsx from 'clsx'
import { ThumbsUp } from 'lucide-react'

interface DashboardHelpfulCardProps {
  label?: string
  count: number
  className?: string
}

export default function DashboardHelpfulCard({
  label = '도움 됐어요',
  count,
  className,
}: DashboardHelpfulCardProps) {
  return (
    <div
      className={clsx(
        'bg-fill-white p-spacing-2xs shadow-emphasize flex w-full flex-col justify-center rounded-sm',
        className,
      )}
    >
      {/* 상단 라벨 */}
      <span className="font-title4 mb-spacing-xs text-label-primary px-spacing-4xs py-spacing-5xs border-border-primary w-fit rounded-full border text-center">
        {label}
      </span>

      {/* 카운트 + 아이콘 */}
      <div className="flex w-full items-center justify-between">
        <span className="font-title2-medium text-label-default">
          {count} 번
        </span>
        <ThumbsUp className="fill-label-primary text-label-primary h-[27] w-7" />
      </div>
    </div>
  )
}
