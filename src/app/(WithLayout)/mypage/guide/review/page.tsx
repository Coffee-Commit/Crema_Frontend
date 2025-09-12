'use client'

import DashboardHelpfulCard from '@/components/ui/Cards/DashboardHelpfulCard'
import DashboardRatingCard from '@/components/ui/Cards/DashbaordRatingCard'
import DetailedExperienceCard from '@/components/ui/Cards/DetailedExperienceCard'

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

  return (
    <main className="gap-spacing-3xl flex flex-col">
      <h1>후기</h1>
      <section className="gap-spacing-xs flex flex-row">
        <div className="flex min-w-[300px] flex-col">
          <DashboardHelpfulCard
            label="도움 됐어요"
            count={helpfulCount}
            className="mb-spacing-xs"
          />
          <DashboardRatingCard
            label="평균"
            score={averageScore}
          />
        </div>
        <DetailedExperienceCard
          title="경험별 도움된 비율"
          items={skills}
        />
      </section>
    </main>
  )
}
