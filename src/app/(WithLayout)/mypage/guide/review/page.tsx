// 'use client'

// import { useState, useEffect } from 'react'

// import EmptyState from '@/components/common/EmptyState'
// import DashboardRatingCard from '@/components/ui/Cards/DashbaordRatingCard'
// import DashboardHelpfulCard from '@/components/ui/Cards/DashboardHelpfulCard'
// import DetailedExperienceCard from '@/components/ui/Cards/DetailedExperienceCard'
// import ReviewList from '@/components/ui/List/ReviewList'
// import Pagination from '@/components/ui/Paginations/Pagination'
// import api from '@/lib/http/api'

// interface ReviewResponse {
//   message: string
//   data: {
//     totalElements: number
//     totalPages: number
//     size: number
//     number: number
//     content: {
//       review: {
//         reviewId: number
//         comment: string
//         star: number
//         createdAt: string
//       }
//       writer: {
//         nickname: string
//         profileImageUrl: string
//       }
//     }[]
//   }
// }

// interface ExperienceEvaluation {
//   experienceGroupId: number
//   experienceTitle: string
//   thumbsUpRate: string
// }

// export default function DashboardReview() {
//   const [reviews, setReviews] = useState<
//     ReviewResponse['data']['content']
//   >([])
//   const [page, setPage] = useState(1)
//   const perPage = 5
//   const [totalPages, setTotalPages] = useState(0)

//   const [averageScore, setAverageScore] = useState(0)
//   const [helpfulCount, setHelpfulCount] = useState(0)
//   const [experienceItems, setExperienceItems] = useState<
//     { label: string; progress: number }[]
//   >([])

//   // ✅ API 호출
//   useEffect(() => {
//     const fetchReviews = async () => {
//       try {
//         const res = await api.get<ReviewResponse>(
//           `/api/guides/me/reviews?page=${page - 1}&size=${perPage}&sort=createdAt,DESC`,
//         )

//         console.log('📌 리뷰 API 응답:', res.data)

//         const content = res.data.data.content
//         setReviews(content)
//         setTotalPages(res.data.data.totalPages)

//         // ✅ 평균 별점 계산
//         if (content.length > 0) {
//           const totalStars = content.reduce(
//             (sum, r) => sum + r.review.star,
//             0,
//           )
//           setAverageScore(totalStars / content.length)
//         } else {
//           setAverageScore(0)
//         }
//       } catch (err) {
//         console.error('❌ 리뷰 불러오기 실패:', err)
//       }
//     }

//     fetchReviews()
//   }, [page])

//   // ✅ 경험 평가 API 호출
//   useEffect(() => {
//     const fetchExperienceEvaluations = async () => {
//       try {
//         const res = await api.get<{
//           message: string
//           data: ExperienceEvaluation[]
//         }>(`/api/guides/me/experience-evaluations`)

//         console.log('📌 경험 평가 API 응답:', res.data)

//         const data = res.data.data || []

//         // 경험별 데이터 변환
//         setExperienceItems(
//           data.map((item) => ({
//             label: item.experienceTitle,
//             progress: isNaN(Number(item.thumbsUpRate))
//               ? 0
//               : Number(item.thumbsUpRate),
//           })),
//         )

//         setHelpfulCount(data.length || 0)
//       } catch (err) {
//         console.error('❌ 경험 평가 불러오기 실패:', err)
//       }
//     }

//     fetchExperienceEvaluations()
//   }, [])

//   return (
//     <main className="gap-spacing-3xl flex flex-col">
//       <h1 className="font-heading2 text-label-strong">후기</h1>
//       <section className="gap-spacing-xs flex flex-row">
//         <div className="flex min-w-[300px] flex-col">
//           <DashboardHelpfulCard
//             label="도움 됐어요"
//             count={helpfulCount}
//             className="mb-spacing-xs"
//           />
//           <DashboardRatingCard
//             label="별점"
//             score={averageScore}
//           />
//         </div>
//         <DetailedExperienceCard
//           title="경험별 도움된 비율"
//           items={experienceItems}
//         />
//       </section>

//       {/* 리뷰 섹션 */}
//       <section className="gap-spacing-4xs flex flex-col">
//         {reviews.length === 0 ? (
//           <div className="border-border-subtler pb-spacing-7xl rounded-sm border">
//             <EmptyState />
//           </div>
//         ) : (
//           <div className="gap-spacing-xl px-spacing-xs flex w-full flex-col">
//             {reviews.map((review, idx) => (
//               <ReviewList
//                 key={review.review.reviewId}
//                 rating={review.review.star}
//                 text={review.review.comment}
//                 nickname={review.writer.nickname}
//                 date={new Date(
//                   review.review.createdAt,
//                 ).toLocaleDateString()}
//                 isLast={idx === reviews.length - 1}
//               />
//             ))}

//             {totalPages > 1 && (
//               <div className="flex w-full justify-center">
//                 <Pagination
//                   total={totalPages}
//                   initialPage={page}
//                   onChange={setPage}
//                 />
//               </div>
//             )}
//           </div>
//         )}
//       </section>
//     </main>
//   )
// }

// 목업 버전
'use client'

import { useState } from 'react'

import DashboardRatingCard from '@/components/ui/Cards/DashbaordRatingCard'
import DashboardHelpfulCard from '@/components/ui/Cards/DashboardHelpfulCard'
import DetailedExperienceCard from '@/components/ui/Cards/DetailedExperienceCard'
import ReviewList from '@/components/ui/List/ReviewList'
import Pagination from '@/components/ui/Paginations/Pagination'

// 목업 리뷰 데이터
const mockReviews = [
  {
    review: {
      reviewId: 1,
      comment: '정말 유익한 시간이었습니다!',
      star: 5,
      createdAt: new Date().toISOString(),
    },
    writer: { nickname: '김지훈', profileImageUrl: '' },
  },
  {
    review: {
      reviewId: 2,
      comment: '다시 참여하고 싶어요 👍',
      star: 4,
      createdAt: new Date().toISOString(),
    },
    writer: { nickname: '박서연', profileImageUrl: '' },
  },
  {
    review: {
      reviewId: 3,
      comment: '설명이 이해하기 쉽게 잘 되어 있었어요.',
      star: 5,
      createdAt: new Date().toISOString(),
    },
    writer: { nickname: '이도윤', profileImageUrl: '' },
  },
  {
    review: {
      reviewId: 4,
      comment: '시간이 너무 빨리 지나갔네요!',
      star: 4,
      createdAt: new Date().toISOString(),
    },
    writer: { nickname: '최민지', profileImageUrl: '' },
  },
  {
    review: {
      reviewId: 5,
      comment: '많은 도움을 받았습니다.',
      star: 5,
      createdAt: new Date().toISOString(),
    },
    writer: { nickname: '정우성', profileImageUrl: '' },
  },
  {
    review: {
      reviewId: 6,
      comment: '실질적인 조언이 최고였어요.',
      star: 5,
      createdAt: new Date().toISOString(),
    },
    writer: { nickname: '한예린', profileImageUrl: '' },
  },
]

// 목업 경험 평가 데이터
const mockExperienceItems = [
  { label: '직무 전환', progress: 90 },
  { label: '포트폴리오', progress: 80 },
  { label: '자소서', progress: 70 },
  { label: '면접', progress: 60 },
  { label: '합격 경험', progress: 75 },
  { label: '실무 경험', progress: 80 },
]

export default function DashboardReview() {
  const [page, setPage] = useState(1)
  const perPage = 5
  const totalPages = Math.ceil(mockReviews.length / perPage)

  // 현재 페이지에 맞는 리뷰 자르기
  const paginatedReviews = mockReviews.slice(
    (page - 1) * perPage,
    page * perPage,
  )

  // 평균 별점
  const averageScore =
    mockReviews.reduce((sum, r) => sum + r.review.star, 0) /
    mockReviews.length

  // 도움 됐어요 → 리뷰 개수 기준
  const helpfulCount = mockReviews.length

  return (
    <main className="gap-spacing-3xl flex flex-col">
      <h1 className="font-heading2 text-label-strong">후기</h1>

      {/* 통계 카드 */}
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
          items={mockExperienceItems}
        />
      </section>

      {/* 리뷰 섹션 */}
      <section className="gap-spacing-4xs flex flex-col">
        <div className="gap-spacing-xl px-spacing-xs flex w-full flex-col">
          {paginatedReviews.map((review, idx) => (
            <ReviewList
              key={review.review.reviewId}
              rating={review.review.star}
              text={review.review.comment}
              nickname={review.writer.nickname}
              date={new Date(
                review.review.createdAt,
              ).toLocaleDateString()}
              isLast={idx === paginatedReviews.length - 1}
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
      </section>
    </main>
  )
}
