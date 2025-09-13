'use client'

import { useEffect, useState } from 'react'

import EmptyState from '@/components/common/EmptyState'
import Loading from '@/components/common/LoadingState'
import ReviewEditableCard from '@/components/ui/Cards/ReviewEditableCard'
import FilterDropdown from '@/components/ui/CustomSelectes/DropDown/FilterDropdown'
import Pagination from '@/components/ui/Paginations/Pagination'

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

  // 타입 정의
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
    }
  }

  // ✅ Mock 데이터
  const mockData: Review[] = [
    {
      reservationId: 1,
      guide: {
        profileImageUrl: null,
        nickname: '홍길동',
      },
      reservation: {
        matchingDateTime: new Date().toISOString(),
        timeUnit: 'MINUTE_30',
      },
      review: {
        star: 5,
        comment: '정말 유익한 시간이었습니다!',
      },
    },
    {
      reservationId: 2,
      guide: {
        profileImageUrl: null,
        nickname: '이순신',
      },
      reservation: {
        matchingDateTime: new Date().toISOString(),
        timeUnit: 'MINUTE_60',
      },
      review: {
        star: 4,
        comment: '좋은 대화였지만 시간이 좀 부족했어요.',
      },
    },
  ]

  // ✅ API 대신 mock 데이터 로드
  const loadReviews = async () => {
    setLoading(true)
    try {
      // 필터별 mock 분기
      let filtered = mockData
      if (filter === 'written') {
        filtered = mockData.filter((r) => r.review)
      } else if (filter === 'unwritten') {
        filtered = mockData.filter((r) => !r.review)
      }

      // 페이지네이션 흉내
      const pageSize = 5
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const paged = filtered.slice(start, end)

      setReviews(paged)
      setTotalPages(Math.ceil(filtered.length / pageSize))
    } catch (err) {
      console.error('리뷰 불러오기 실패:', err)
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
            setPage(1) // 필터 바꾸면 페이지 초기화
          }}
        />
      </section>

      {/* 리뷰 섹션 */}
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
              {reviews.map((review) => (
                <ReviewEditableCard
                  key={review.reservationId}
                  avatarUrl={review.guide.profileImageUrl}
                  nickname={review.guide.nickname}
                  date={new Date(
                    review.reservation.matchingDateTime,
                  ).toLocaleDateString()}
                  time={new Date(
                    review.reservation.matchingDateTime,
                  ).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  duration={
                    review.reservation.timeUnit === 'MINUTE_30'
                      ? '30분'
                      : '60분'
                  }
                  rating={review.review?.star ?? 0}
                  review={review.review?.comment ?? ''}
                  reservationId={review.reservationId}
                />
              ))}
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

// api 연동
// 'use client'

// import { useEffect, useState } from 'react'

// import EmptyState from '@/components/common/EmptyState'
// import Loading from '@/components/common/LoadingState'
// import ReviewEditableCard from '@/components/ui/Cards/ReviewEditableCard'
// import FilterDropdown from '@/components/ui/CustomSelectes/DropDown/FilterDropdown'
// import Pagination from '@/components/ui/Paginations/Pagination'
// import {
//   fetchMyReviews,
//   ReviewFilter,
//   MyReview,
// } from '@/lib/http/review'

// export default function DashboardReview() {
//   const [filter, setFilter] = useState<
//     'all' | 'written' | 'unwritten'
//   >('all')
//   const [reviews, setReviews] = useState<MyReview[]>([])
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

//   // ✅ API 호출
//   const loadReviews = async () => {
//     setLoading(true)
//     try {
//       const filterMap: Record<typeof filter, ReviewFilter> = {
//         all: 'ALL',
//         written: 'WRITTEN',
//         unwritten: 'NOT_WRITTEN',
//       }

//       const res = await fetchMyReviews({
//         filter: filterMap[filter],
//         page: page - 1, // 서버는 0부터 시작
//         size: 5,
//       })

//       setReviews(res.data.content)
//       setTotalPages(res.data.totalPages)
//     } catch (err) {
//       console.error('리뷰 불러오기 실패:', err)
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
//             setPage(1) // 필터 바꾸면 페이지 초기화
//           }}
//         />
//       </section>

//       {/* 리뷰 섹션 */}
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
//                 const dateObj = new Date(
//                   review.reservation.matchingDateTime,
//                 )
//                 return (
//                   <ReviewEditableCard
//                     key={review.reservationId}
//                     reservationId={review.reservationId} // ✅ 추가
//                     avatarUrl={review.guide.profileImageUrl}
//                     nickname={review.guide.nickname}
//                     date={dateObj.toLocaleDateString()}
//                     time={dateObj.toLocaleTimeString([], {
//                       hour: '2-digit',
//                       minute: '2-digit',
//                     })}
//                     duration={
//                       review.reservation.timeUnit === 'MINUTE_30'
//                         ? '30분'
//                         : '60분'
//                     }
//                     rating={review.review?.star ?? 0} // ✅ 별점 반영
//                     review={review.review?.comment ?? ''} // ✅ 리뷰 코멘트 반영
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
