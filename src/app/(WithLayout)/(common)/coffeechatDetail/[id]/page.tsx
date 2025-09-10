'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'

import Banner from '@/components/layout/Banner'
import ExperienceCard from '@/components/ui/Cards/ExperienceCard'
import OverallRatingCard from '@/components/ui/Cards/OverallRatingCard'
import OverviewCard from '@/components/ui/Cards/OverviewCard'
import ReviewCard from '@/components/ui/Cards/ReviewCard'
import Pagination from '@/components/ui/Paginations/Pagination'

import ProfileSidebar from '../_components/ProfieSidebar'

/* ================== 타입 ================== */
type GuideCoffeeChatResponse = {
  guide: {
    id: number
    nickname: string
    profileImageUrl: string | null
  }
  title: string
  description: string
  tags: { id: number; name: string }[]
  reviewScore: number
  reviewCount: number
  experiences: {
    groups: {
      id: number
      guideChatTopicId: number
      chatTopicName: string
      experienceTitle: string
      experienceContent: string
    }[]
  }
  experienceDetail: {
    id: number
    who: string
    solution: string
    how: string
  }
  createdAt: string
  updatedAt: string
}

type CoffeeChatStatsResponse = {
  totalCoffeeChats: number
  averageStar: number
  totalReviews: number
  thumbsUpCount: number
}

type GuideExperienceEvaluationResponse = {
  experienceId: number
  experienceTitle: string
  thumbsUpRate: string
}

type Review = {
  reviewId: number
  starReview: number
  comment: string
  writer: {
    memberId: number
    nickname: string
    profileImageUrl: string | null
  }
  createdAt: string
}

type GuideReviewResponse = { guideId: number; reviews: Review[] }

/* ================== 목데이터 ================== */
const mockData: GuideCoffeeChatResponse = {
  guide: { id: 1, nickname: '홍길동', profileImageUrl: null },
  title: '목데이터 제목 - 디자이너 취업 여정',
  description: 'API 실패 시 보여지는 목데이터 상세 설명입니다.',
  tags: [
    { id: 1, name: '포트폴리오' },
    { id: 2, name: '면접' },
  ],
  reviewScore: 4.5,
  reviewCount: 10,
  experiences: {
    groups: [
      {
        id: 101,
        guideChatTopicId: 11,
        chatTopicName: '포트폴리오',
        experienceTitle: '포트폴리오 준비',
        experienceContent:
          '작은 프로젝트로 시작해 포트폴리오를 완성했습니다.',
      },
    ],
  },
  experienceDetail: {
    id: 301,
    who: '취업 준비생',
    solution: '멘토링을 통한 방향 제시',
    how: '스터디와 포트폴리오 첨삭',
  },
  createdAt: '2025-09-01T10:00:00',
  updatedAt: '2025-09-02T08:30:00',
}

const mockStats: CoffeeChatStatsResponse = {
  totalCoffeeChats: 5,
  averageStar: 4.2,
  totalReviews: 3,
  thumbsUpCount: 8,
}

const mockExperienceEvaluations: GuideExperienceEvaluationResponse[] =
  [
    {
      experienceId: 101,
      experienceTitle: '경험 1',
      thumbsUpRate: '90%',
    },
    {
      experienceId: 102,
      experienceTitle: '경험 2',
      thumbsUpRate: '75%',
    },
    {
      experienceId: 103,
      experienceTitle: '경험 3',
      thumbsUpRate: '60%',
    },
  ]

const mockReviews: Review[] = [
  {
    reviewId: 1,
    starReview: 5,
    comment: '정말 유익한 시간이었어요!',
    writer: { memberId: 1, nickname: '루키1', profileImageUrl: null },
    createdAt: '2025-08-23T10:00:00',
  },
  {
    reviewId: 2,
    starReview: 4,
    comment: '포트폴리오 작성 꿀팁 얻었습니다.',
    writer: { memberId: 2, nickname: '루키2', profileImageUrl: null },
    createdAt: '2025-08-20T15:30:00',
  },
  {
    reviewId: 3,
    starReview: 4,
    comment: '포트폴리오 작성 꿀팁 얻었습니다.',
    writer: { memberId: 3, nickname: '루키4', profileImageUrl: null },
    createdAt: '2025-08-20T15:30:00',
  },
  {
    reviewId: 4,
    starReview: 4,
    comment: '포트폴리오 작성 꿀팁 얻었습니다.',
    writer: { memberId: 4, nickname: '루키4', profileImageUrl: null },
    createdAt: '2025-08-20T15:30:00',
  },
  {
    reviewId: 5,
    starReview: 4,
    comment: '포트폴리오 작성 꿀팁 얻었습니다.',
    writer: { memberId: 5, nickname: '루키5', profileImageUrl: null },
    createdAt: '2025-08-20T15:30:00',
  },
  {
    reviewId: 6,
    starReview: 4,
    comment: '포트폴리오 작성 꿀팁 얻었습니다.',
    writer: { memberId: 6, nickname: '루키6', profileImageUrl: null },
    createdAt: '2025-08-20T15:30:00',
  },
]

export default function CoffeeChatDetailPage() {
  const { id } = useParams()

  // ✅ 각 섹션 ref 정의
  const summaryRef = useRef<HTMLDivElement | null>(null)
  const experienceRef = useRef<HTMLDivElement | null>(null)
  const descriptionRef = useRef<HTMLDivElement | null>(null)
  const reviewRef = useRef<HTMLDivElement | null>(null)

  // ✅ 상태
  const [data, setData] = useState<GuideCoffeeChatResponse | null>(
    null,
  )
  const [stats, setStats] = useState<CoffeeChatStatsResponse | null>(
    null,
  )
  const [bestExperience, setBestExperience] =
    useState<GuideExperienceEvaluationResponse | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])

  const [currentPage, setCurrentPage] = useState(1)
  const reviewsPerPage = 5
  const [loading, setLoading] = useState(true)

  // ✅ 공통 스크롤 함수 (HOC로 ProfileSidebar에 내려줌)
  const scrollToSection = (
    ref: React.RefObject<HTMLElement | null>,
  ) => {
    if (ref.current)
      ref.current.scrollIntoView({ behavior: 'smooth' })
  }

  /* ================== CoffeeChat 기본 정보 ================== */
  useEffect(() => {
    const fetchCoffeeChat = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/guides/${id}/coffeechat`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          },
        )
        if (!res.ok) throw new Error('API 요청 실패')
        const result = await res.json()
        setData(result)
      } catch {
        console.warn('⚠️ API 실패 → 목데이터 사용')
        setData(mockData)
      }
    }
    if (id) fetchCoffeeChat()
  }, [id])

  /* ================== Stats ================== */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/guides/${id}/coffeechat-stats`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          },
        )
        if (!res.ok) throw new Error('API 요청 실패')
        const result = await res.json()
        setStats(result)
      } catch {
        console.warn('⚠️ Stats API 실패 → 목데이터 사용')
        setStats(mockStats)
      }
    }
    if (id) fetchStats()
  }, [id])

  /* ================== 경험평가 ================== */
  useEffect(() => {
    const fetchExperienceEval = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/guides/${id}/experience-evaluations`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          },
        )
        if (!res.ok) throw new Error('API 요청 실패')
        const result: GuideExperienceEvaluationResponse[] =
          await res.json()

        if (result.length > 0) {
          const best = result.reduce((prev, curr) => {
            const prevRate = parseInt(
              prev.thumbsUpRate.replace('%', ''),
              10,
            )
            const currRate = parseInt(
              curr.thumbsUpRate.replace('%', ''),
              10,
            )
            return currRate > prevRate ? curr : prev
          })
          setBestExperience(best)
        }
      } catch {
        console.warn('⚠️ 경험평가 API 실패 → 목데이터 사용')
        const best = mockExperienceEvaluations.reduce(
          (prev, curr) => {
            const prevRate = parseInt(
              prev.thumbsUpRate.replace('%', ''),
              10,
            )
            const currRate = parseInt(
              curr.thumbsUpRate.replace('%', ''),
              10,
            )
            return currRate > prevRate ? curr : prev
          },
        )
        setBestExperience(best)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchExperienceEval()
  }, [id])

  /* ================== 리뷰 ================== */
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/guides/${id}/reviews?page=0&size=100`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          },
        )
        if (!res.ok) throw new Error('API 요청 실패')
        const result: GuideReviewResponse = await res.json()
        setReviews(result.reviews)
      } catch {
        console.warn('⚠️ 리뷰 API 실패 → 목데이터 사용')
        setReviews(mockReviews)
      }
    }
    if (id) fetchReviews()
  }, [id])

  if (loading)
    return <div className="py-20 text-center">로딩 중...</div>
  if (!data)
    return <div className="py-20 text-center">데이터 없음</div>

  // ✅ 배너 데이터
  const bannerData = {
    categories: data.tags.map((tag) => tag.name),
    title: data.title,
    rating: data.reviewScore,
    reviewCount: data.reviewCount,
    keywords: data.tags.map((tag) => tag.name),
  }

  // ✅ 오버뷰 카드
  const overviewItems = [
    { label: '대상', content: data.experienceDetail.who },
    { label: '상황', content: data.experienceDetail.solution },
    { label: '내용', content: data.experienceDetail.how },
  ]

  // ✅ 리뷰 페이지네이션
  const indexOfLast = currentPage * reviewsPerPage
  const indexOfFirst = indexOfLast - reviewsPerPage
  const currentReviews = reviews.slice(indexOfFirst, indexOfLast)
  const totalPages = Math.ceil(reviews.length / reviewsPerPage)

  return (
    <div className="relative flex flex-col">
      <Banner {...bannerData} />

      <section className="px-container-padding-sm py-spacing-xl container mx-auto flex gap-[132px]">
        <div className="flex flex-1 flex-col gap-[120px]">
          {/* 요약 섹션 */}
          <div
            ref={summaryRef}
            className="gap-spacing-xl flex scroll-mt-[200px] flex-col"
          >
            <h1 className="font-heading2 text-label-strong">
              이런 분들께 도움이 될 수 있어요
            </h1>
            <OverviewCard items={overviewItems} />
          </div>

          {/* 경험 섹션 */}
          <div
            ref={experienceRef}
            className="gap-spacing-xl flex scroll-mt-[200px] flex-col"
          >
            <h1 className="font-heading2 text-label-strong">
              이런 경험을 했어요
            </h1>
            <div className="gap-spacing-sm grid grid-cols-1">
              {data.experiences.groups.map((exp) => (
                <ExperienceCard
                  key={exp.id}
                  title={exp.experienceTitle}
                  description={exp.experienceContent}
                  tag={exp.chatTopicName}
                />
              ))}
            </div>
          </div>

          {/*  상세 섹션 */}
          <div
            ref={descriptionRef}
            className="px-spacing-sm pt-spacing-xs pb-spacing-5xl gap-spacing-md bg-fill-footer-gray flex flex-col rounded-sm"
          >
            <div className="flex flex-row items-center justify-center">
              {data.guide.profileImageUrl ? (
                <Image
                  src={data.guide.profileImageUrl}
                  alt={`${data.guide.nickname} 프로필`}
                  width={64}
                  height={64}
                  className="border-border-medium rounded-full border object-cover"
                />
              ) : (
                <div className="bg-fill-disabled border-border-medium h-[64px] w-[64px] rounded-full border" />
              )}
              <div className="border-border-medium h-[1px] w-full border-b" />
            </div>
            <div className="font-body1 text-label-deep px-spacing-xs flex whitespace-pre-wrap">
              {data.description}
            </div>
          </div>

          {/* 후기 섹션 */}
          <div
            ref={reviewRef}
            className="gap-spacing-xl flex scroll-mt-[120px] flex-col"
          >
            <h1 className="font-heading2 text-label-strong">후기</h1>
            <div className="gap-spacing-xs flex w-full flex-row">
              {stats && (
                <OverallRatingCard
                  type="star"
                  title="별점 평균"
                  rating={stats.averageStar}
                  reviewCount={stats.totalReviews}
                />
              )}
              {bestExperience && (
                <OverallRatingCard
                  type="experience"
                  title="가장 도움이 된 경험"
                  label={bestExperience.experienceTitle}
                  progress={parseInt(
                    bestExperience.thumbsUpRate.replace('%', ''),
                    10,
                  )}
                />
              )}
            </div>

            {/* 리뷰 리스트 */}
            <div className="gap-spacing-sm grid grid-cols-1">
              {currentReviews.map((review) => (
                <ReviewCard
                  key={review.reviewId}
                  rating={review.starReview}
                  text={review.comment}
                  nickname={review.writer.nickname}
                  date={review.createdAt.split('T')[0]}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pt-spacing-lg mx-auto">
                <Pagination
                  total={totalPages}
                  initialPage={currentPage}
                  onChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>

        {/* ✅ HOC 사이드바 */}
        <ProfileSidebar
          scrollToSection={scrollToSection}
          summaryRef={summaryRef}
          experienceRef={experienceRef}
          descriptionRef={descriptionRef}
          reviewRef={reviewRef}
        />
      </section>
    </div>
  )
}
