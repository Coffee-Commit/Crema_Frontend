'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import EmptyState from '@/components/common/EmptyState'
import UploadCard from '@/components/ui/Cards/UploadCard'
import SelectedChips from '@/components/ui/Chips/SelectedChips'
import Pagination from '@/components/ui/Paginations/Pagination'
import SearchBarSub from '@/components/ui/SearchBar/SearchBarSub'

import FilterSidebar from './FilterSidebar'

type Guide = {
  guideId: number
  nickname: string
  profileImageUrl: string | null
  title: string
  workingPeriodYears: string
  jobField: {
    id: number
    jobName: string
    jobNameDescription: string
  }
  hashTags: {
    id: number
    hashTagName: string
  }[]
  totalCoffeeChats: number
  averageStar: number
  totalReviews: number
  thumbsUpCount: number
}

/* ===================== 직무 분야 ===================== */
const jobFieldOptions = [
  { label: '디자인', value: 'DESIGN' },
  { label: '기획/전략', value: 'PLANNING_STRATEGY' },
  { label: '마케팅/홍보', value: 'MARKETING_PR' },
  { label: '경영/지원', value: 'MANAGEMENT_SUPPORT' },
  { label: 'IT 개발/데이터', value: 'IT_DEVELOPMENT_DATA' },
  { label: '연구/R&D', value: 'RESEARCH_RND' },
]

/* ===================== 커피챗 주제 ===================== */
const topicOptions = [
  { label: '이력서', value: 'RESUME' },
  { label: '자소서', value: 'COVER_LETTER' },
  { label: '포트폴리오', value: 'PORTFOLIO' },
  { label: '면접', value: 'INTERVIEW' },
  { label: '실무', value: 'PRACTICAL_WORK' },
  { label: '조직문화', value: 'ORGANIZATION_CULTURE' },
  { label: '워라밸', value: 'WORK_LIFE_BALANCE' },
  { label: '인간관계', value: 'RELATIONSHIP' },
  { label: '합격 경험', value: 'PASS_EXPERIENCE' },
  { label: '업계 트렌드', value: 'INDUSTRY_TREND' },
  { label: '직무 전환', value: 'CAREER_CHANGE' },
  { label: '이직', value: 'JOB_CHANGE' },
]

export default function MentorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const queryFromURL = searchParams.get('query') || ''
  const [search, setSearch] = useState(queryFromURL)
  const [selectedJobFields, setSelectedJobFields] = useState<
    string[]
  >([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [mentors, setMentors] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)

  const perPage = 12

  /* ===================== 데이터 fetch ===================== */
  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: String(currentPage - 1),
          size: String(perPage),
          sort: 'latest',
        })

        if (search) params.append('keyword', search)
        selectedJobFields.forEach((job) =>
          params.append('jobNames', job),
        )
        selectedTopics.forEach((topic) =>
          params.append('chatTopicNames', topic),
        )

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/guides?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
            credentials: 'include',
          },
        )

        if (!res.ok) throw new Error('가이드 목록 요청 실패')

        const data = await res.json()

        // ✅ 콘솔 디버깅 추가
        console.log('📦 API 요청 URL:', res.url)
        console.log('📥 API 응답 데이터:', data)

        if (data.guides) {
          setMentors(data.guides)
          setTotalPages(Math.ceil((data.totalCount || 0) / perPage))
        } else {
          setMentors([])
          setTotalPages(0)
        }
      } catch (e) {
        console.error('❌ 가이드 목록 불러오기 실패:', e)
        setMentors([])
        setTotalPages(0)
      } finally {
        setLoading(false)
      }
    }

    fetchGuides()
  }, [search, selectedJobFields, selectedTopics, currentPage])

  /* ===================== chip 제거 ===================== */
  const handleRemoveChip = (value: string) => {
    setSelectedJobFields((prev) => prev.filter((v) => v !== value))
    setSelectedTopics((prev) => prev.filter((v) => v !== value))
  }

  return (
    <>
      <section className="bg-fill-banner-yellow h-[180px] w-full" />
      <div className="gap-gutter container grid grid-cols-12 py-10">
        <aside className="relative z-10 col-span-3 -mt-[130px]">
          <FilterSidebar
            selectedJobFields={selectedJobFields}
            setSelectedJobFields={setSelectedJobFields}
            selectedTopics={selectedTopics}
            setSelectedTopics={setSelectedTopics}
          />
        </aside>

        {/* 목록 영역 */}
        <section className="col-span-9 flex flex-col gap-6">
          <SearchBarSub
            defaultValue={search}
            placeholder="관심 키워드로 검색해보세요!"
            onSubmit={(text) => {
              setSearch(text)
              setCurrentPage(1)
            }}
            className="h-[48px] w-[476px]"
          />

          <SelectedChips
            selected={[
              ...selectedJobFields.map(
                (v) =>
                  jobFieldOptions.find((o) => o.value === v)?.label ||
                  v,
              ),
              ...selectedTopics.map(
                (v) =>
                  topicOptions.find((o) => o.value === v)?.label || v,
              ),
            ]}
            onRemove={handleRemoveChip}
          />

          {loading ? (
            <div className="text-label-default py-20 text-center">
              로딩 중...
            </div>
          ) : mentors.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {mentors.map((item) => (
                  <UploadCard
                    key={item.guideId}
                    id={item.guideId}
                    title={item.title}
                    subtitle={`${item.workingPeriodYears} ${item.jobField.jobNameDescription}`}
                    tags={item.hashTags.map((tag) => tag.hashTagName)}
                    rating={item.averageStar}
                    reviewCount={item.totalReviews}
                    menteeCount={item.totalCoffeeChats}
                    mentorName={item.nickname}
                    profileImage={item.profileImageUrl}
                    onClick={() =>
                      router.push(`/coffeechatDetail/${item.guideId}`)
                    }
                  />
                ))}
              </div>
              <Pagination
                total={totalPages}
                initialPage={currentPage}
                onChange={setCurrentPage}
              />
            </>
          )}
        </section>
      </div>
    </>
  )
}
