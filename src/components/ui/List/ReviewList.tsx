'use client'

import clsx from 'clsx'

import StarRating from '../Ratings/StarRating'

interface ReviewListProps {
  rating: number
  text: string
  nickname: string
  date: string
  className?: string
  isLast?: boolean // 마지막 요소 여부
}

export default function ReviewList({
  rating,
  text,
  nickname,
  date,
  className,
  isLast = false,
}: ReviewListProps) {
  return (
    <div
      className={clsx(
        'pb-spacing-md gap-spacing-xs flex w-full flex-col items-start',
        !isLast && 'border-border-subtler border-b', // divider 역할
        className,
      )}
    >
      {/* 별점 */}
      <div className="shrink-0">
        <StarRating rating={rating} />
      </div>

      {/* 본문 + 작성자 */}
      <div className="gap-spacing-3xs flex flex-1 flex-col">
        <p className="font-body1 text-label-deep">{text}</p>
        <div className="text-label-subtle font-caption2-medium flex items-center gap-2">
          <span>{nickname}</span>
          <span>|</span>
          <span>{date}</span>
        </div>
      </div>
    </div>
  )
}
