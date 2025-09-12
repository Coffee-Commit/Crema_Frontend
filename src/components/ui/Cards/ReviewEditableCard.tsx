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
    <div className="bg-fill-white border-border-subtler rounded-sm border">
      {/* 상단 영역 */}
      <div className="p-spacing-3xs border-border-subtler flex items-center justify-between border-b">
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
          <div className="gap-spacing-xl flex flex-row items-center">
            <span className="font-label4-semibold text-label-subtle min-w-[100px]">
              {nickname}
            </span>
            <div className="gap-spacing-7xl font-caption text-label-default flex min-w-[430px] items-center">
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
          variant={isEditing ? 'tertiary' : 'primary'}
          size="sm"
          onClick={() =>
            isEditing ? handleSave() : setIsEditing(true)
          }
        >
          {isEditing ? '편집' : '작성'}
        </SquareButton>
      </div>

      {/* 본문 영역 */}
      {isEditing && (
        <div className="p-spacing-sm gap-spacing-sm bg-fill-footer-gray flex flex-col">
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
            className="bg-transparent"
          />
        </div>
      )}
    </div>
  )
}
