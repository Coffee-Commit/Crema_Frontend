'use client'

import { X, ThumbsUp } from 'lucide-react'
import { useState } from 'react'

import SquareButton from '@/components/ui/Buttons/SquareButton'

interface CoffeechatReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    rating: number
    experiences: string[]
    review: string
  }) => void
}

export default function CoffeechatReviewModal({
  isOpen,
  onClose,
  onSubmit,
}: CoffeechatReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [selectedExperiences, setSelectedExperiences] = useState<
    string[]
  >([])
  const [review, setReview] = useState('')

  if (!isOpen) return null

  const experiences = [
    '경험1 타이틀 문장입니다',
    '경험2 타이틀 문장입니다',
    '경험3 타이틀 문장입니다',
    '경험4 타이틀 문장입니다',
    '경험5 타이틀 문장입니다',
    '경험6 타이틀 문장입니다',
  ]

  const toggleExperience = (exp: string) => {
    setSelectedExperiences((prev) =>
      prev.includes(exp)
        ? prev.filter((e) => e !== exp)
        : [...prev, exp],
    )
  }

  const handleSubmit = () => {
    onSubmit({ rating, experiences: selectedExperiences, review })
    onClose()
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

        {/* 본문 (스크롤 가능) */}
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
              1. 이야기 나누었던 경험들을 모두 선택해주시고, 각각에
              대한 만족도를 평가해주세요.
            </p>
            <div className="gap-spacing-xs flex flex-col">
              {experiences.map((exp) => {
                const isSelected = selectedExperiences.includes(exp)
                return (
                  <div
                    key={exp}
                    onClick={() => toggleExperience(exp)}
                    className={`p-spacing-xs flex cursor-pointer items-center justify-between rounded-sm border ${
                      isSelected
                        ? 'border-fill-tooltip-orange bg-fill-input-gray'
                        : 'border-border-subtle'
                    }`}
                  >
                    <span className="font-body2">{exp}</span>
                    <ThumbsUp
                      className={`h-5 w-5 ${
                        isSelected
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
              2. 선배와의 커피챗에 대한 후기를 들려주세요.
            </p>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="후기를 작성해주세요. (최소 10자 이상)"
              className="border-border-subtle p-spacing-sm font-body2 text-label-default h-32 w-full resize-none rounded-sm border"
              maxLength={100}
            />
            <div className="text-label-subtle mt-1 text-right text-sm">
              {review.length}/100
            </div>
          </div>
        </div>

        {/* 푸터 (고정) */}
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
