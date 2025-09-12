'use client'

import { useState } from 'react'

import EmptyState from '@/components/common/EmptyState'
import ReviewEditableCard from '@/components/ui/Cards/ReviewEditableCard'
import FilterDropdown from '@/components/ui/CustomSelectes/DropDown/FilterDropdown'
import Pagination from '@/components/ui/Paginations/Pagination'

export default function DashboardReview() {
  const [scheduleFilter, setScheduleFilter] = useState<
    'all' | 'scheduled' | 'done'
  >('all')

  const options = [
    { key: 'all', label: '전체', colorClass: 'bg-fill-light' },
    {
      key: 'scheduled',
      label: '예정',
      colorClass: 'bg-fill-primary',
    },
    { key: 'done', label: '완료', colorClass: 'bg-fill-light' },
  ]

  const mockReviews = [
    {
      avatarUrl: null,
      nickname: '홍길동',
      date: '2025-09-12',
      time: '15:00',
      duration: '30분',
      rating: 4.5,
      review: '정말 유익한 커피챗이었어요!',
    },
    {
      avatarUrl: null,
      nickname: '김영희',
      date: '2025-09-10',
      time: '13:00',
      duration: '60분',
      rating: 5,
      review: '멘토님이 친절하게 설명해주셔서 많은 도움이 됐습니다.',
    },
    {
      avatarUrl: null,
      nickname: '이철수',
      date: '2025-09-09',
      time: '18:00',
      duration: '30분',
      rating: 4,
      review: '알찬 시간이었습니다.',
    },
    {
      avatarUrl: null,
      nickname: '박민지',
      date: '2025-09-08',
      time: '14:00',
      duration: '60분',
      rating: 5,
      review: '구체적인 피드백을 많이 얻었습니다.',
    },
    {
      avatarUrl: null,
      nickname: '정우성',
      date: '2025-09-07',
      time: '16:00',
      duration: '30분',
      rating: 3.5,
      review: '유익했지만 시간이 조금 짧았어요.',
    },
    {
      avatarUrl: null,
      nickname: '김가영',
      date: '2025-09-06',
      time: '19:00',
      duration: '60분',
      rating: 4.2,
      review: '좋은 경험이었습니다.',
    },
  ]

  // ✅ 페이지네이션 상태
  const [page, setPage] = useState(1)
  const perPage = 5
  const totalPages = Math.ceil(mockReviews.length / perPage)

  const currentReviews = mockReviews.slice(
    (page - 1) * perPage,
    page * perPage,
  )

  return (
    <main className="gap-spacing-3xl flex flex-col">
      <section className="gap-spacing-2xs flex w-full flex-row">
        <h1 className="font-heading2 text-label-strong">후기</h1>
        <FilterDropdown
          options={options}
          selected={scheduleFilter}
          onSelect={(key) =>
            setScheduleFilter(key as 'all' | 'scheduled' | 'done')
          }
        />
      </section>

      {/* 리뷰 섹션 */}
      <section className="gap-spacing-4xs flex flex-col">
        {mockReviews.length === 0 ? (
          <div className="border-border-subtler pb-spacing-7xl rounded-sm border">
            <EmptyState />
          </div>
        ) : (
          <>
            {currentReviews.map((review, idx) => (
              <ReviewEditableCard
                key={idx}
                avatarUrl={review.avatarUrl}
                nickname={review.nickname}
                date={review.date}
                time={review.time}
                duration={review.duration}
                rating={review.rating}
                review={review.review}
              />
            ))}

            {totalPages > 1 && (
              <div className="mt-spacing-md flex w-full justify-center">
                <Pagination
                  total={totalPages}
                  initialPage={page}
                  onChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}
