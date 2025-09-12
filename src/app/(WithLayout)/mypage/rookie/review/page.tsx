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
//               {reviews.map((review) => (
//                 <ReviewEditableCard
//                   key={review.reservationId}
//                   avatarUrl={review.guide.profileImageUrl}
//                   nickname={review.guide.nickname}
//                   date={new Date(
//                     review.reservation.matchingDateTime,
//                   ).toLocaleDateString()}
//                   time={new Date(
//                     review.reservation.matchingDateTime,
//                   ).toLocaleTimeString([], {
//                     hour: '2-digit',
//                     minute: '2-digit',
//                   })}
//                   duration={
//                     review.reservation.timeUnit === 'MINUTE_30'
//                       ? '30분'
//                       : '60분'
//                   }
//                   rating={review.review?.star ?? 0}
//                   review={review.review?.comment ?? ''}
//                 />
//               ))}
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

'use client'

import { useEffect, useState } from 'react'
import EmptyState from '@/components/common/EmptyState'
import Loading from '@/components/common/LoadingState'
import ReviewEditableCard from '@/components/ui/Cards/ReviewEditableCard'
import FilterDropdown from '@/components/ui/CustomSelectes/DropDown/FilterDropdown'
import Pagination from '@/components/ui/Paginations/Pagination'
import {
  fetchMyReviews,
  ReviewFilter,
  MyReview,
} from '@/lib/http/review'

export default function DashboardReview() {
  const [filter, setFilter] = useState<
    'all' | 'written' | 'unwritten'
  >('all')
  const [reviews, setReviews] = useState<MyReview[]>([])
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

  const loadReviews = async () => {
    setLoading(true)
    try {
      const filterMap: Record<typeof filter, ReviewFilter> = {
        all: 'ALL',
        written: 'WRITTEN',
        unwritten: 'NOT_WRITTEN',
      }

      const res = await fetchMyReviews({
        filter: filterMap[filter],
        page: page - 1,
        size: 5,
      })

      setReviews(res.data.content)
      setTotalPages(res.data.totalPages)
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
              {reviews.map((review) => (
                <ReviewEditableCard
                  key={review.reservationId}
                  reservationId={review.reservationId}
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
                  isInitiallyEditing={!review.review} // 리뷰 없으면 작성 모드
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
