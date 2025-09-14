// 'use client'

// import { useEffect, useState } from 'react'

// import EmptyState from '@/components/common/EmptyState'
// import Loading from '@/components/common/LoadingState'
// import ReviewEditableCard from '@/components/ui/Cards/ReviewEditableCard'
// import FilterDropdown from '@/components/ui/CustomSelectes/DropDown/FilterDropdown'
// import Pagination from '@/components/ui/Paginations/Pagination'
// import api from '@/lib/http/api'

// type Review = {
//   reservationId: number
//   guide: {
//     profileImageUrl: string | null
//     nickname: string
//   }
//   reservation: {
//     matchingDateTime: string
//     timeUnit: 'MINUTE_30' | 'MINUTE_60'
//   }
//   review?: {
//     star: number
//     comment: string
//     createdAt: string
//   }
// }

// export default function DashboardReview() {
//   const [filter, setFilter] = useState<
//     'all' | 'written' | 'unwritten'
//   >('all')
//   const [reviews, setReviews] = useState<Review[]>([])
//   const [totalPages, setTotalPages] = useState(0)
//   const [page, setPage] = useState(1)
//   const [loading, setLoading] = useState(false)

//   const options = [
//     { key: 'all', label: '전체', colorClass: 'bg-fill-light' },
//     { key: 'written', label: '작성', colorClass: 'bg-fill-primary' },
//     {
//       key: 'unwritten',
//       label: '미작성',
//       colorClass: 'bg-fill-disabled',
//     },
//   ]

//   // ✅ 리뷰 불러오기
//   const loadReviews = async () => {
//     setLoading(true)
//     try {
//       const filterMap = {
//         all: 'ALL',
//         written: 'WRITTEN',
//         unwritten: 'NOT_WRITTEN',
//       }

//       const res = await api.get('/api/reviews/me', {
//         params: {
//           filter: filterMap[filter],
//           page: page - 1, // 서버는 0부터 시작
//           size: 5,
//         },
//       })

//       const reviewData = res.data?.data ?? {
//         content: [],
//         totalPages: 0,
//       }
//       console.log('📌 리뷰 응답:', reviewData)

//       setReviews(reviewData.content ?? [])
//       setTotalPages(reviewData.totalPages ?? 0)
//     } catch (err) {
//       console.error('❌ 리뷰 불러오기 실패:', err)
//       setReviews([])
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     loadReviews()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filter, page])

//   return (
//     <main className="gap-spacing-3xl flex flex-col">
//       <section className="gap-spacing-2xs flex w-full flex-row">
//         <h1 className="font-heading2 text-label-strong">후기</h1>
//         <FilterDropdown
//           options={options}
//           selected={filter}
//           onSelect={(key) => {
//             setFilter(key as typeof filter)
//             setPage(1)
//           }}
//         />
//       </section>

//       <section className="gap-spacing-4xs flex flex-col">
//         {loading ? (
//           <Loading />
//         ) : reviews.length === 0 ? (
//           <div className="border-border-subtler pb-spacing-7xl rounded-sm border">
//             <EmptyState />
//           </div>
//         ) : (
//           <>
//             <div className="gap-spacing-xs flex flex-col">
//               {reviews.map((review) => {
//                 const start = new Date(
//                   review.reservation.matchingDateTime,
//                 )
//                 const durationMinutes =
//                   review.reservation.timeUnit === 'MINUTE_30'
//                     ? 30
//                     : 60
//                 const end = new Date(
//                   start.getTime() + durationMinutes * 60 * 1000,
//                 )

//                 const formatTime = (d: Date) =>
//                   `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

//                 return (
//                   <ReviewEditableCard
//                     key={review.reservationId}
//                     reservationId={review.reservationId}
//                     avatarUrl={review.guide.profileImageUrl}
//                     nickname={review.guide.nickname}
//                     date={start.toLocaleDateString()}
//                     time={`${formatTime(start)} ~ ${formatTime(end)}`}
//                     duration={`${durationMinutes}분`}
//                     rating={review.review?.star ?? 0}
//                     review={review.review?.comment ?? ''}
//                     onSaved={loadReviews} // ✅ 저장 후 새로고침
//                   />
//                 )
//               })}
//             </div>

//             {totalPages > 1 && (
//               <div className="mt-spacing-md flex w-full justify-center">
//                 <Pagination
//                   total={totalPages}
//                   initialPage={page}
//                   onChange={setPage}
//                 />
//               </div>
//             )}
//           </>
//         )}
//       </section>
//     </main>
//   )
// }

// 목업버전
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
  const size = 5 // 페이지당 5개씩

  const options = [
    { key: 'all', label: '전체', colorClass: 'bg-fill-light' },
    { key: 'written', label: '작성', colorClass: 'bg-fill-primary' },
    {
      key: 'unwritten',
      label: '미작성',
      colorClass: 'bg-fill-disabled',
    },
  ]

  // ✅ 목업 데이터
  const mockReviews: Review[] = Array.from({ length: 6 }).map(
    (_, i) => ({
      reservationId: i + 1,
      guide: {
        profileImageUrl: '/images/profileMypage.png',
        nickname: [
          '김민준',
          '이지은',
          '박지훈',
          '최유진',
          '정현우',
          '한서연',
        ][i],
      },
      reservation: {
        matchingDateTime: new Date(
          2025,
          8,
          10 + i,
          14,
          0,
        ).toISOString(),
        timeUnit: i % 2 === 0 ? 'MINUTE_30' : 'MINUTE_60',
      },
      review: {
        star: [5, 4, 3, 5, 2, 4][i],
        comment: [
          '정말 유익한 시간이었어요!',
          '편안한 분위기에서 대화할 수 있었어요.',
          '보통이었지만 도움이 되었습니다.',
          '최고의 경험이었습니다.',
          '조금 아쉬운 점도 있었어요.',
          '좋은 조언을 많이 얻었습니다.',
        ][i],
        createdAt: new Date(2025, 8, 10 + i).toISOString(),
      },
    }),
  )

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
          size,
        },
      })

      const reviewData = res.data?.data ?? {
        content: [],
        totalPages: 0,
      }

      if (!reviewData.content || reviewData.content.length === 0) {
        // ✅ 실제 데이터 없으면 목업 사용
        setReviews(mockReviews.slice((page - 1) * size, page * size))
        setTotalPages(Math.ceil(mockReviews.length / size))
      } else {
        setReviews(reviewData.content ?? [])
        setTotalPages(reviewData.totalPages ?? 0)
      }
    } catch (err) {
      console.error('❌ 리뷰 불러오기 실패, 목업 사용:', err)
      setReviews(mockReviews.slice((page - 1) * size, page * size))
      setTotalPages(Math.ceil(mockReviews.length / size))
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
                  `${String(d.getHours()).padStart(2, '0')}:${String(
                    d.getMinutes(),
                  ).padStart(2, '0')}`

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
