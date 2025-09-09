'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import UploadCard from '@/components/ui/Cards/UploadCard'
import SelectedChips from '@/components/ui/Chips/SelectedChips'
import FilterGroup from '@/components/ui/Filters/FilterGroup'
import Pagination from '@/components/ui/Paginations/Pagination'
import SearchBarSub from '@/components/ui/SearchBar/SearchBarSub'
import EmptyState from '@/components/common/EmptyState'

type Guide = {
  guideId: number
  nickname: string
  profileImageUrl: string | null
  title: string
  workingPeriodYears: string
  jobField: {
    id: number
    jobName: string
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

const categoryOptions = [
  '디자인',
  '기획/전략',
  '마케팅/홍보',
  '경영/지원',
  'IT 개발/데이터',
  '연구/R&D',
]
const keywordOptions1 = ['이력서', '자소서', '포트폴리오', '면접']
const keywordOptions2 = ['실무', '조직문화', '인간관계', '워라밸']
const keywordOptions3 = [
  '합격 경험',
  '업계 트랜드',
  '직무 전환',
  '이직',
]

const mapCategoryToId = (category: string): number => {
  const map: Record<string, number> = {
    디자인: 1,
    '기획/전략': 2,
    '마케팅/홍보': 3,
    '경영/지원': 4,
    'IT 개발/데이터': 5,
    '연구/R&D': 6,
  }
  return map[category] || 0
}

const mapKeywordToId = (keyword: string): number => {
  const map: Record<string, number> = {
    이력서: 101,
    자소서: 102,
    포트폴리오: 103,
    면접: 104,
    실무: 201,
    조직문화: 202,
    인간관계: 203,
    워라밸: 204,
    '합격 경험': 301,
    '업계 트랜드': 302,
    '직무 전환': 303,
    이직: 304,
  }
  return map[keyword] || 0
}

export default function MentorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const queryFromURL = searchParams.get('query') || ''
  const [search, setSearch] = useState(queryFromURL)
  const [selectedCategories, setSelectedCategories] = useState<
    string[]
  >([])
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(
    [],
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [mentors, setMentors] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)

  const perPage = 12

  useEffect(() => {
    if (queryFromURL) {
      setSearch(queryFromURL)
      router.replace('/searchGuide')
    }
  }, [queryFromURL, router])

  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true)
      try {
        const jobFieldIds = selectedCategories
          .map(mapCategoryToId)
          .filter(Boolean)
        const chatTopicIds = selectedKeywords
          .map(mapKeywordToId)
          .filter(Boolean)

        const params = new URLSearchParams({
          page: String(currentPage - 1),
          size: String(perPage),
          sort: 'latest',
        })
        if (search) params.append('keyword', search)
        if (jobFieldIds.length)
          params.append('jobFieldIds', jobFieldIds.join(','))
        if (chatTopicIds.length)
          params.append('chatTopicIds', chatTopicIds.join(','))

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/guides?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          },
        )

        const data = await res.json()
        if (data.isSuccess && data.result?.guides) {
          setMentors(data.result.guides)
          setTotalPages(Math.ceil(data.result.totalCount / perPage))
        } else {
          setMentors([])
          setTotalPages(0)
        }
      } catch (e) {
        console.error('가이드 목록 불러오기 실패:', e)
        setMentors([])
        setTotalPages(0)
      } finally {
        setLoading(false)
      }
    }

    fetchGuides()
  }, [search, selectedCategories, selectedKeywords, currentPage])

  const handleRemoveChip = (value: string) => {
    setSelectedCategories((prev) => prev.filter((v) => v !== value))
    setSelectedKeywords((prev) => prev.filter((v) => v !== value))
  }

  return (
    <div className="gap-gutter container grid grid-cols-12 py-10">
      <aside className="col-span-3 flex flex-col gap-4">
        <FilterGroup
          title="커피챗 분야"
          options={categoryOptions}
          selected={selectedCategories}
          onChange={setSelectedCategories}
        />
        <FilterGroup
          title="서류 및 면접"
          options={keywordOptions1}
          selected={selectedKeywords}
          onChange={setSelectedKeywords}
        />
        <FilterGroup
          title="회사 생활"
          options={keywordOptions2}
          selected={selectedKeywords}
          onChange={setSelectedKeywords}
        />
        <FilterGroup
          title="커리어"
          options={keywordOptions3}
          selected={selectedKeywords}
          onChange={setSelectedKeywords}
        />
      </aside>

      <section className="col-span-9 flex flex-col gap-6">
        <SearchBarSub
          defaultValue={search}
          placeholder="관심 키워드로 검색해보세요!"
          onSubmit={(text) => {
            setSearch(text)
            setCurrentPage(1)
          }}
        />

        <SelectedChips
          selected={[...selectedCategories, ...selectedKeywords]}
          onRemove={handleRemoveChip}
        />

        {loading ? (
          <div className="text-label-default py-20 text-center">
            로딩 중...
          </div>
        ) : mentors.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mentors.map((item) => (
              <UploadCard
                key={item.guideId}
                id={item.guideId}
                title={item.title}
                subtitle={`${item.workingPeriodYears} ${item.jobField.jobName}`}
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
            <Pagination
              total={totalPages}
              initialPage={currentPage}
              onChange={setCurrentPage}
            />
          </div>
        )}
      </section>
    </div>
  )
}
