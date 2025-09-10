'use client'

import { useRef } from 'react'

import Banner from '@/components/layout/Banner'
import ExperienceCard from '@/components/ui/Cards/ExperienceCard'
import OverallRatingCard from '@/components/ui/Cards/OverallRatingCard'
import OverviewCard from '@/components/ui/Cards/OverviewCard'
import ReviewCard from '@/components/ui/Cards/ReviewCard'
import Pagination from '@/components/ui/Paginations/Pagination'

import ProfileSidebar from '../_components/ProfieSidebar'

export default function CoffeeChatDetailPage() {
  const summaryRef = useRef<HTMLDivElement | null>(null)
  const experienceRef = useRef<HTMLDivElement | null>(null)
  const reviewRef = useRef<HTMLDivElement | null>(null)

  const scrollToSection = (
    ref: React.RefObject<HTMLElement | null>,
  ) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const bannerData = {
    categories: ['디자인', '현직자 인터뷰', '포트폴리오'],
    title: '실내디자이너나 프로덕트 디자이너나 같은 디자인 아닌가요?',
    rating: 4.5,
    reviewCount: 100,
    keywords: [
      '실내디자인',
      '프로덕트디자인',
      '직무차이',
      '현직자경험',
    ],
  }

  const overviewItems = [
    {
      label: '대상',
      content: '전공과 다른 직무를 준비하는 취준생',
    },
    {
      label: '상황',
      content: '"내가 이길을 가도 괜찮을까?" 고민될 때',
    },
    {
      label: '내용',
      content: '비전공자로서 겪은 현실적인 어려움과 성장 경험',
    },
  ]

  const experienceData = [
    {
      title: '실내디자이너에서 “전과” 후기',
      description: '직무 전환을 위한 커리어 전환 경험을 공유해요',
      tag: '10분 요약',
    },
    {
      title: '비전공자로 포폴의 벽 넘기기',
      description:
        '비전공자도 할 수 있는 포트폴리오 전략을 알려드려요',
      tag: '10분 요약',
    },
    {
      title: '프로덕트 디자이너의 커리어 30분+',
      description:
        '현직 프로덕트 디자이너의 커리어 성장 경험을 나눠요',
    },
    {
      title: '오늘회의 최종 안건',
      description:
        '직무 전환 후 실제 실무 이야기와 고민들을 풀어드려요',
    },
    {
      title: '전공자 사이에서 살아남기 · 회사 편',
      description: '전공자 중심 환경에서의 생존기와 적응 팁을 나눠요',
      tag: '5분 요약',
    },
  ]

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const reviews = Array.from({ length: 5 }).map((_, i) => ({
    rating: 4.5,
    text: '리뷰내용 요약본 텍스트 100자내로 제한 리뷰내용 요약본 텍스트 100자내로 제한',
    nickname: '윰윰',
    date: '2025.08.23',
  }))

  return (
    <div className="relative flex flex-col">
      {/* 상단 배너 */}
      <Banner {...bannerData} />

      {/* 콘텐츠 영역 */}
      <section className="px-container-padding-sm py-spacing-xl gap-gutter container mx-auto flex">
        {/* 본문 */}
        <div className="gap-spacing-xl flex flex-1 flex-col">
          {/* Summary Section */}
          <div
            ref={summaryRef}
            className="scroll-mt-[200px]"
          >
            <OverviewCard items={overviewItems} />
          </div>

          {/* Experience Section */}
          <div
            ref={experienceRef}
            className="scroll-mt-[200px]"
          >
            <div className="gap-spacing-sm grid grid-cols-1">
              {experienceData.map((item, i) => (
                <ExperienceCard
                  key={i}
                  {...item}
                />
              ))}
            </div>
          </div>

          {/* Mentor Description Section */}
          <div className="p-spacing-md border-border-subtle bg-fill-white font-body1 text-label-deep whitespace-pre-wrap rounded-md border">
            안녕하세요, 실내디자이너로 시작해서 프로덕트 디자이너로
            일하고 있는 2년차 현직자입니다.\n\n저는 사내스타트업,
            프로덕트 팀을 경험하며 실내 공간 설계와 프로덕트 디자인의
            차이점과, 채용과정, 비전공자에게는 어떤 부분이 어려운지
            등을 경험했고 실제 면접에서 들었던 피드백과 포트폴리오의
            방향에 대한 고민도 나눌 수 있어요.\n\n저는 진로 고민이
            많은 전공자나 비전공자에게, 막연한 두려움을 극복할 수
            있도록 도와주고 싶습니다.\n\n지금도 수많은 디자인 포지션
            공고들이 올라오고 있지만, 각 직군이 요구하는 내용은 모두
            다르다는 점에서 기획부터 리서치까지의 흐름을 실제 사례를
            통해 알려드릴게요.\n\n과한 포장보다 현실적인 이야기를
            드리고 싶습니다. 전공자, 비전공자에게 실제로 도움을 줄 수
            있는 경험을 바탕으로 가장 유용한 정보만 드릴게요.
            포트폴리오 제작의 막막한 점부터 직무 전환의 벽까지 함께
            넘을 수 있도록 도와드릴게요.
          </div>

          {/* Review Section */}
          <div
            ref={reviewRef}
            className="gap-spacing-xl flex scroll-mt-[120px] flex-col"
          >
            <OverallRatingCard
              type="star"
              title="총 평점"
              rating={4.5}
              reviewCount={100}
            />
            <OverallRatingCard
              type="experience"
              title="가장 도움이 된 경험"
              label="실내디자이너에서 전과 후기"
              progress={64}
            />

            <div className="gap-spacing-sm grid grid-cols-1">
              {reviews.map((review, i) => (
                <ReviewCard
                  key={i}
                  {...review}
                />
              ))}
            </div>

            <div className="pt-spacing-lg mx-auto">
              <Pagination total={5} />
            </div>
          </div>
        </div>

        {/* 우측 사이드바 */}
        <ProfileSidebar
          scrollToSection={scrollToSection}
          summaryRef={summaryRef}
          experienceRef={experienceRef}
          reviewRef={reviewRef}
        />
      </section>
    </div>
  )
}
