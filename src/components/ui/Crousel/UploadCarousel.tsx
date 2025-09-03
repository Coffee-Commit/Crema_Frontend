'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

import UploadCard from '@/components/ui/Cards/UploadCard'

interface UploadCarouselProps {
  cards: {
    title: string
    subtitle: string
    tags: string[]
    rating: number
    reviewCount: number
    mentorName: string
    profileImage?: string | null
  }[]
}

export default function UploadCarousel({
  cards,
}: UploadCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleCount, setVisibleCount] = useState(4)

  // 반응형 카드 개수 조정
  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1) // 모바일
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2) // 태블릿
      } else {
        setVisibleCount(4) // 데스크탑
      }
    }
    updateVisibleCount()
    window.addEventListener('resize', updateVisibleCount)
    return () =>
      window.removeEventListener('resize', updateVisibleCount)
  }, [])

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  const handleNext = () => {
    setCurrentIndex((prev) =>
      Math.min(prev + 1, cards.length - visibleCount),
    )
  }

  return (
    <div className="relative w-full">
      {/* 좌 버튼 */}
      <button
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className="shadow-emphasize absolute left-0 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white p-1 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft size={24} />
      </button>

      {/* 우 버튼 */}
      <button
        onClick={handleNext}
        disabled={currentIndex >= cards.length - visibleCount}
        className="shadow-emphasize absolute right-0 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white p-1 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronRight size={24} />
      </button>

      {/* 카드 리스트 */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${(currentIndex * 100) / visibleCount}%)`,
          }}
        >
          {cards.map((card, i) => (
            <div
              key={i}
              className="flex-shrink-0 px-2 py-4"
              style={{ width: `${100 / visibleCount}%` }}
            >
              <UploadCard
                menteeCount={0}
                {...card}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
