'use client'

import { useEffect, useState } from 'react'

import EmptyState from '@/components/common/EmptyState'
import Loading from '@/components/common/LoadingState'
import ReviewEditableCard from '@/components/ui/Cards/ReviewEditableCard'
import FilterDropdown from '@/components/ui/CustomSelectes/DropDown/FilterDropdown'
import Pagination from '@/components/ui/Paginations/Pagination'
import api from '@/lib/http/api'

type Review = {
  reservationId: number
  guide: {
    profileImageUrl: string | null
    nickname: string
  }
  reservation: {
    matchingDateTime: string
    timeUnit: 'MINUTE_30' | 'MINUTE_60'
  }
  review?: {
    star: number
    comment: string
    createdAt: string
  }
}

export default function DashboardReview() {
  const [filter, setFilter] = useState<
    'all' | 'written' | 'unwritten'
  >('all')
  const [reviews, setReviews] = useState<Review[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const options = [
    { key: 'all', label: '전체', colorClass: 'bg-fill-light' },
    { key: 'written', label: '작성', colorClass: 'bg-fill-primary' },
    {
      key: 'unwritten',
      label: '미작성',
      colorClass: 'bg-fill-disabled',
    },
  ]

  // ✅ 리뷰 불러오기
  const loadReviews = async () => {
    setLoading(true)
    try {
      const filterMap = {
        all: 'ALL',
        written: 'WRITTEN',
        unwritten: 'NOT_WRITTEN',
      }

      const res = await api.get('/api/reviews/me', {
        params: {
          filter: filterMap[filter],
          page: page - 1, // 서버는 0부터 시작
          size: 5,
        },
      })

      const reviewData = res.data?.data ?? {
        content: [],
        totalPages: 0,
      }
      console.log('📌 리뷰 응답:', reviewData)

      setReviews(reviewData.content ?? [])
      setTotalPages(reviewData.totalPages ?? 0)
    } catch (err) {
      console.error('❌ 리뷰 불러오기 실패:', err)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page])

  return (
    <main className="gap-spacing-3xl flex flex-col">
      <section className="gap-spacing-2xs flex w-full flex-row">
        <h1 className="font-heading2 text-label-strong">후기</h1>
        <FilterDropdown
          options={options}
          selected={filter}
          onSelect={(key) => {
            setFilter(key as typeof filter)
            setPage(1)
          }}
        />
      </section>

      <section className="gap-spacing-4xs flex flex-col">
        {loading ? (
          <Loading />
        ) : reviews.length === 0 ? (
          <div className="border-border-subtler pb-spacing-7xl rounded-sm border">
            <EmptyState />
          </div>
        ) : (
          <>
            <div className="gap-spacing-xs flex flex-col">
              {reviews.map((review) => {
                const start = new Date(
                  review.reservation.matchingDateTime,
                )
                const durationMinutes =
                  review.reservation.timeUnit === 'MINUTE_30'
                    ? 30
                    : 60
                const end = new Date(
                  start.getTime() + durationMinutes * 60 * 1000,
                )

                const formatTime = (d: Date) =>
                  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

                return (
                  <ReviewEditableCard
                    key={review.reservationId}
                    reservationId={review.reservationId}
                    avatarUrl={review.guide.profileImageUrl}
                    nickname={review.guide.nickname}
                    date={start.toLocaleDateString()}
                    time={`${formatTime(start)} ~ ${formatTime(end)}`}
                    duration={`${durationMinutes}분`}
                    rating={review.review?.star ?? 0}
                    review={review.review?.comment ?? ''}
                    onSaved={loadReviews} // ✅ 저장 후 새로고침
                  />
                )
              })}
            </div>

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
