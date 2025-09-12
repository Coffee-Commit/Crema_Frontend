'use client'

import { CalendarDays, Clock } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import SquareButton from '@/components/ui/Buttons/SquareButton'
import TextAreaCounter from '@/components/ui/Inputs/TextAreaCounter'
import StarRating from '@/components/ui/Ratings/StarRating'

interface ReviewEditableCardProps {
  avatarUrl?: string | null
  nickname: string
  date: string
  time: string
  duration: string
  rating: number
  review: string
}

export default function ReviewEditableCard({
  avatarUrl,
  nickname,
  date,
  time,
  duration,
  rating,
  review,
}: ReviewEditableCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newRating, setNewRating] = useState(rating)
  const [newReview, setNewReview] = useState(review)

  const handleSave = () => {
    console.log('리뷰 저장:', newRating, newReview)
    setIsEditing(false)
  }

  return (
    <div className="bg-fill-white border-border-subtler rounded-md border">
      {/* 상단 영역 */}
      <div className="p-spacing-md border-border-subtler flex items-center justify-between border-b">
        <div className="gap-spacing-sm flex items-center">
          {/* 프로필 */}
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="profile"
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="bg-fill-disabled h-12 w-12 rounded-full" />
          )}
          {/* 닉네임 + 날짜/시간 */}
          <div className="flex flex-col">
            <span className="font-label3-semibold text-label-strong">
              {nickname}
            </span>
            <div className="gap-spacing-sm font-caption2 text-label-subtle flex items-center">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {date}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {time} ({duration})
              </div>
            </div>
          </div>
        </div>
        <SquareButton
          variant={isEditing ? 'primary' : 'tertiary'}
          size="sm"
          onClick={() =>
            isEditing ? handleSave() : setIsEditing(true)
          }
        >
          {isEditing ? '저장' : '작성'}
        </SquareButton>
      </div>

      {/* 본문 영역 */}
      <div className="p-spacing-md">
        {isEditing ? (
          <div className="gap-spacing-sm flex flex-col">
            <StarRating
              rating={newRating}
              readOnly={false}
              onChange={(val) => setNewRating(val)}
            />
            <TextAreaCounter
              maxLength={100}
              value={newReview}
              onChange={(val) => setNewReview(val)}
              placeholder="리뷰를 작성해주세요. (최대 100자)"
            />
          </div>
        ) : (
          <div className="gap-spacing-xs flex flex-col">
            <div className="flex items-center gap-2">
              <StarRating
                rating={rating}
                readOnly
              />
              <span className="font-label3-semibold">
                {rating.toFixed(1)}
              </span>
            </div>
            <p className="font-body2 text-label-deep">{review}</p>
          </div>
        )}
      </div>
    </div>
  )
}
