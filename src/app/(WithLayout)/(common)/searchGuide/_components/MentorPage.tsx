'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'

import EmptyState from '@/components/common/EmptyState'
import Loading from '@/components/common/LoadingState'
import UploadCard from '@/components/ui/Cards/UploadCard'
import SelectedChips from '@/components/ui/Chips/SelectedChips'
import Pagination from '@/components/ui/Paginations/Pagination'
import SearchBarSub from '@/components/ui/SearchBar/SearchBarSub'
import api from '@/lib/http/api'

import FilterSidebar from './FilterSidebar'

/* ===================== 타입 ===================== */
type Guide = {
  guideId: number
  nickname: string
  profileImageUrl: string | null
  title: string
  workingPeriod: string
  jobField: {
    guideId: number
    jobName: string
    jobNameDescription: string
  }
  hashTags: { id: number; guideId: number; hashTagName: string }[]
  stats: {
    totalCoffeeChats: number
    averageStar: number
    totalReviews: number
    thumbsUpCount: number
  }
}

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

  const perPage = 12

  /* ===================== 최초 데이터 fetch (API 1번만) ===================== */
  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true)
      try {
        const res = await api.get('/api/guides', {
          params: { page: 0, size: 100, sort: 'latest' }, // 넉넉히 가져오기
        })
        console.log('📦 API 응답:', res.data)

        const guides: Guide[] = res.data.data?.content ?? []
        setMentors(guides)
      } catch (e) {
        console.error('❌ 가이드 목록 불러오기 실패:', e)
        setMentors([])
      } finally {
        setLoading(false)
      }
    }

    fetchGuides()
  }, [])

  /* ===================== 프론트 필터링 ===================== */
  const filteredMentors = useMemo(() => {
    return mentors.filter((m) => {
      const jobMatch =
        selectedJobFields.length === 0 ||
        selectedJobFields.includes(m.jobField.jobNameDescription)

      const topicMatch =
        selectedTopics.length === 0 ||
        selectedTopics.some((t) =>
          m.hashTags.some((tag) => tag.hashTagName === t),
        )

      const searchMatch =
        !search ||
        m.title.includes(search) ||
        m.nickname.includes(search) ||
        m.jobField.jobNameDescription.includes(search) ||
        m.hashTags.some((tag) => tag.hashTagName.includes(search))

      return jobMatch && topicMatch && searchMatch
    })
  }, [mentors, selectedJobFields, selectedTopics, search])

  /* ===================== 페이지네이션 (프론트 기준) ===================== */
  const totalPages = Math.ceil(filteredMentors.length / perPage)
  const paginatedMentors = filteredMentors.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  )

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
        <section className="gap-spacing-7xl col-span-9 flex flex-col">
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
            selected={[...selectedJobFields, ...selectedTopics]}
            onRemove={handleRemoveChip}
          />

          {loading ? (
            <Loading />
          ) : paginatedMentors.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedMentors.map((item) => (
                  <UploadCard
                    key={item.guideId}
                    id={item.guideId}
                    title={item.title}
                    subtitle={`${item.jobField.jobNameDescription}`}
                    tags={item.hashTags.map((tag) => tag.hashTagName)}
                    rating={item.stats.averageStar}
                    reviewCount={item.stats.totalReviews}
                    menteeCount={item.stats.totalCoffeeChats}
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
