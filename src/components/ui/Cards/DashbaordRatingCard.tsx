'use client'

import { Star } from 'lucide-react'

interface DashboardRatingCarddProps {
  label?: string
  score: number
  max?: number
}

export default function DashboardRatingCard({
  label = '별점',
  score,
  max = 5,
}: DashboardRatingCarddProps) {
  const fullStars = Math.floor(score)
  const hasHalfStar = score % 1 >= 0.5

  return (
    <div className="bg-fill-white p-spacing-2xs shadow-emphasize flex w-full flex-col justify-center rounded-sm">
      {/* 상단 라벨 */}
      <span className="font-title4 mb-spacing-xs text-label-primary px-spacing-4xs py-spacing-5xs border-border-primary w-fit rounded-full border text-center">
        {label}
      </span>

      {/* 점수 & 별점 */}
      <div className="flex w-full items-center justify-between">
        <span className="font-title2-medium text-label-default">
          {score.toFixed(1)} 점
        </span>
        <div className="flex items-center gap-2">
          {Array.from({ length: max }).map((_, i) => {
            if (i < fullStars) {
              return (
                <Star
                  key={i}
                  className="fill-label-primary text-label-primary h-5 w-5"
                />
              )
            }
            if (i === fullStars && hasHalfStar) {
              return (
                <Star
                  key={i}
                  className="text-label-primary h-5 w-5"
                  style={{
                    fill: 'url(#half)',
                  }}
                />
              )
            }
            return (
              <Star
                key={i}
                className="text-label-subtler h-5 w-5"
              />
            )
          })}
        </div>
      </div>

      {/* Half star fill 정의 */}
      <svg
        width="0"
        height="0"
      >
        <defs>
          <linearGradient id="half">
            <stop
              offset="50%"
              stopColor="var(--color-label-primary)"
            />
            <stop
              offset="50%"
              stopColor="transparent"
              stopOpacity="1"
            />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
