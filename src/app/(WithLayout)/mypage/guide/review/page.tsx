'use client'

import { useState } from 'react'

import EmptyState from '@/components/common/EmptyState'
import DashboardRatingCard from '@/components/ui/Cards/DashbaordRatingCard'
import DashboardHelpfulCard from '@/components/ui/Cards/DashboardHelpfulCard'
import DetailedExperienceCard from '@/components/ui/Cards/DetailedExperienceCard'
import ReviewList from '@/components/ui/List/ReviewList'
import Pagination from '@/components/ui/Paginations/Pagination'

export default function DashboardReview() {
  const helpfulCount = 42
  const averageScore = 4.5
  const skills = [
    { label: '실내 디자인에서 프로덕트 디자인으로', progress: 80 },
    { label: '전공자 사이에서 살아남기 : 면접 편', progress: 70 },
    { label: '비전공자의 포트폴리오 박치기', progress: 90 },
    { label: '오늘의집 최종 합격', progress: 75 },
    { label: '서류부터 면접까지 탈락만 30회+@', progress: 75 },
    { label: '전공자 사이에서 살아남기: 회사편', progress: 75 },
  ]

  const mockReviews = [
    {
      rating: 4.5,
      text: '정말 유익한 커피챗이었어요!',
      nickname: '홍길동',
      date: '2025-09-12',
    },
    {
      rating: 5,
      text: '멘토님이 친절하게 설명해주셔서 많은 도움이 됐습니다.',
      nickname: '김영희',
      date: '2025-09-10',
    },
    {
      rating: 4,
      text: '알찬 시간이었습니다.',
      nickname: '이철수',
      date: '2025-09-09',
    },
    {
      rating: 5,
      text: '구체적인 피드백을 많이 얻었습니다.',
      nickname: '박민지',
      date: '2025-09-08',
    },
    {
      rating: 3.5,
      text: '유익했지만 시간이 조금 짧았어요.',
      nickname: '정우성',
      date: '2025-09-07',
    },
    {
      rating: 4.2,
      text: '좋은 경험이었습니다.',
      nickname: '김가영',
      date: '2025-09-06',
    },
  ]

  // ✅ 페이지네이션 상태
  const [page, setPage] = useState(1)
  const perPage = 5
  const totalPages = Math.ceil(mockReviews.length / perPage)

  // ✅ 현재 페이지에 맞는 리뷰만 slice
  const currentReviews = mockReviews.slice(
    (page - 1) * perPage,
    page * perPage,
  )

  return (
    <main className="gap-spacing-3xl flex flex-col">
      <h1 className="font-heading2 text-label-strong">후기</h1>
      <section className="gap-spacing-xs flex flex-row">
        <div className="flex min-w-[300px] flex-col">
          <DashboardHelpfulCard
            label="도움 됐어요"
            count={helpfulCount}
            className="mb-spacing-xs"
          />
          <DashboardRatingCard
            label="별점"
            score={averageScore}
          />
        </div>
        <DetailedExperienceCard
          title="경험별 도움된 비율"
          items={skills}
        />
      </section>

      {/* 리뷰 섹션 */}
      <section className="gap-spacing-4xs flex flex-col">
        {mockReviews.length === 0 ? (
          <div className="border-border-subtler pb-spacing-7xl rounded-sm border">
            <EmptyState />
          </div>
        ) : (
          <div className="gap-spacing-xl px-spacing-xs flex w-full flex-col">
            {currentReviews.map((review, idx) => (
              <ReviewList
                key={idx}
                rating={review.rating}
                text={review.text}
                nickname={review.nickname}
                date={review.date}
                isLast={idx === currentReviews.length - 1}
              />
            ))}

            {totalPages > 1 && (
              <div className="flex w-full justify-center">
                <Pagination
                  total={totalPages}
                  initialPage={page}
                  onChange={setPage}
                />
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  )
}
