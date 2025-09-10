'use client'

import { Star } from 'lucide-react'
import Image from 'next/image'

type OverallRatingCardProps =
  | {
      type: 'experience'
      title: string
      label: string
      progress: number // 0~100
      iconSize?: number
    }
  | {
      type: 'star'
      title: string
      rating: number
      reviewCount: number
    }

export default function OverallRatingCard(
  props: OverallRatingCardProps,
) {
  return (
    <div className="p-spacing-xs shadow-card bg-fill-white w-full rounded-sm">
      {/* 카드 제목 */}
      <h3 className="font-title4 mb-spacing-md text-label-deep">
        {props.title}
      </h3>

      <div className="bg-fill-input-gray px-spacing-3xs py-spacing-md rounded-xs flex flex-col items-center justify-center">
        {props.type === 'experience' && (
          <>
            {/* 경험 아이콘 + 라벨 */}
            <div className="mb-spacing-5xs flex w-full items-center gap-[8px]">
              <Image
                src="/icons/awardIcon.svg"
                alt="award icon"
                width={props.iconSize ?? 18}
                height={props.iconSize ?? 18}
              />
              <span className="font-caption3 text-label-strong">
                {props.label}
              </span>
            </div>

            {/* 프로그레스바 */}
            <div className="gap-spacing-5xs flex w-full items-center">
              <div className="bg-fill-disabled rounded-2xs h-2 w-full overflow-hidden">
                <div
                  className="bg-fill-tooltip-orange rounded-2xs h-full"
                  style={{ width: `${props.progress}%` }}
                />
              </div>
              <span className="font-caption3 text-label-subtler">
                {props.progress}%
              </span>
            </div>
          </>
        )}

        {props.type === 'star' && (
          <div className="flex flex-col items-center">
            <div className="gap-spacing-5xs flex items-center">
              <Star
                className="text-fill-primary"
                size={24}
                fill="currentColor"
              />
              <span className="font-title2-bold text-label-default">
                {props.rating.toFixed(1)}
              </span>
            </div>
            <p className="font-caption3 text-label-subtle mt-spacing-4xs">
              {props.reviewCount}개의 후기가 있어요
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
