'use client'

import clsx from 'clsx'

import StarRating from '../Ratings/StarRating'

interface ReviewCardProps {
  rating: number
  text: string
  nickname: string
  date: string
  className?: string
}

export default function ReviewCard({
  rating,
  text,
  nickname,
  date,
  className,
}: ReviewCardProps) {
  return (
    <div
      className={clsx(
        'p-spacing-sm shadow-card bg-fill-white gap-spacing-xs flex flex-col rounded-md',
        className,
      )}
    >
      <StarRating rating={rating} />
      <p className="font-body1 text-label-deep line-clamp-2">
        {text}
      </p>
      <div className="text-label-subtle font-caption2-medium flex items-center gap-2">
        <span>{nickname}</span>
        <span>|</span>
        <span>{date}</span>
      </div>
    </div>
  )
}
