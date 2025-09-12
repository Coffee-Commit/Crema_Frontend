'use client'

import { X, ThumbsUp } from 'lucide-react'
import { useState } from 'react'

import SquareButton from '@/components/ui/Buttons/SquareButton'
import api from '@/lib/http/api'

interface CoffeechatReviewModalProps {
  isOpen: boolean
  onClose: () => void
  reservationId: number
  experiences: {
    experienceGroupId: number
    experienceTitle: string
  }[]
}

export default function CoffeechatReviewModal({
  isOpen,
  onClose,
  reservationId,
  experiences,
}: CoffeechatReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [selected, setSelected] = useState<Record<number, boolean>>(
    {},
  )
  const [review, setReview] = useState('')

  if (!isOpen) return null

  const toggleExperience = (id: number) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        reservationId,
        starReview: rating,
        comment: review,
        experienceEvaluations: experiences.map((exp) => ({
          experienceGroupId: exp.experienceGroupId,
          thumbsUp: !!selected[exp.experienceGroupId],
        })),
      }

      const res = await api.post('/api/reviews', payload)
      console.log('✅ 리뷰 등록 성공:', res.data)
      alert('리뷰가 성공적으로 등록되었습니다.')
      onClose()
    } catch (err) {
      console.error('❌ 리뷰 등록 실패:', err)
      alert('리뷰 등록에 실패했습니다.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-fill-white flex h-[800px] w-[640px] flex-col rounded-lg shadow-lg">
        {/* 헤더 */}
        <div className="border-border-subtler p-spacing-md flex items-center justify-between border-b">
          <h2 className="font-heading3 text-label-strong">
            커피챗 후기 작성
          </h2>
          <button onClick={onClose}>
            <X className="text-label-subtler h-5 w-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-spacing-lg gap-spacing-lg flex flex-1 flex-col overflow-y-auto">
          {/* 별점 */}
          <div className="text-center">
            <p className="mb-spacing-sm font-title3 text-label-deep">
              오늘 커피챗은 만족스러우셨나요?
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  onClick={() => setRating(i)}
                  className="text-label-subtler hover:text-fill-tooltip-orange text-3xl"
                >
                  {i <= rating ? '★' : '☆'}
                </button>
              ))}
            </div>
          </div>

          {/* 경험 평가 */}
          <div>
            <p className="mb-spacing-sm font-body1 text-label-strong">
              1. 이야기 나누었던 경험들을 선택해주세요.
            </p>
            <div className="gap-spacing-xs flex flex-col">
              {experiences.map((exp) => {
                const checked = !!selected[exp.experienceGroupId]
                return (
                  <div
                    key={exp.experienceGroupId}
                    onClick={() =>
                      toggleExperience(exp.experienceGroupId)
                    }
                    className={`p-spacing-xs flex cursor-pointer items-center justify-between rounded-sm border ${
                      checked
                        ? 'border-fill-tooltip-orange bg-fill-input-gray'
                        : 'border-border-subtle'
                    }`}
                  >
                    <span className="font-body2">
                      {exp.experienceTitle}
                    </span>
                    <ThumbsUp
                      className={`h-5 w-5 ${
                        checked
                          ? 'text-fill-tooltip-orange'
                          : 'text-label-subtler'
                      }`}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* 후기 작성 */}
          <div>
            <p className="mb-spacing-sm font-body1 text-label-strong">
              2. 커피챗에 대한 후기를 작성해주세요.
            </p>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="후기를 작성해주세요. (최소 10자 이상)"
              className="border-border-subtle p-spacing-sm font-body2 text-label-default h-32 w-full resize-none rounded-sm border"
              maxLength={500}
            />
            <div className="text-label-subtle mt-1 text-right text-sm">
              {review.length}/500
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="border-border-subtler p-spacing-md border-t">
          <SquareButton
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleSubmit}
          >
            작성완료
          </SquareButton>
        </div>
      </div>
    </div>
  )
}
