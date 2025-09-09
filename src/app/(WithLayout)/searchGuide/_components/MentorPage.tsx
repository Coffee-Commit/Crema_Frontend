'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import UploadCard from '@/components/ui/Cards/UploadCard'
import SelectedChips from '@/components/ui/Chips/SelectedChips'
import FilterGroup from '@/components/ui/Filters/FilterGroup'
import Pagination from '@/components/ui/Paginations/Pagination'
import SearchBarSub from '@/components/ui/SearchBar/SearchBarSub'

const mentorData = [
  {
    id: 1,
    title: `공대생이 디자이너가 되기까지`,
    subtitle: 'n년차 프로덕트 디자이너',
    tags: ['디자인', 'UXUI', '전과'],
    rating: 5.0,
    reviewCount: 203,
    mentorName: '홍길동',
    profileImage: null,
  },
  {
    id: 2,
    title: `공대생이 디자이너가 되기까지`,
    subtitle: 'n년차 프로덕트 디자이너',
    tags: ['디자인', 'UXUI', '전과'],
    rating: 5.0,
    reviewCount: 203,
    mentorName: '홍길동',
    profileImage: null,
  },
  {
    id: 3,
    title: `공대생이 개발자 되기까지`,
    subtitle: 'n년차 프로덕트 디자이너',
    tags: ['개발', 'UXUI', '전과'],
    rating: 5.0,
    reviewCount: 203,
    mentorName: '홍길동',
    profileImage: null,
  },
]

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

  useEffect(() => {
    if (queryFromURL) {
      setSearch(queryFromURL)
      router.replace('/searchGuide')
    }
  }, [queryFromURL, router])

  const perPage = 12

  const filtered = useMemo(() => {
    return mentorData.filter((item) => {
      const searchLower = search.toLowerCase()

      const matchSearch =
        !search ||
        item.title.toLowerCase().includes(searchLower) ||
        item.subtitle.toLowerCase().includes(searchLower) ||
        item.mentorName.toLowerCase().includes(searchLower) ||
        item.tags.some((tag) =>
          tag.toLowerCase().includes(searchLower),
        )

      const matchCategory =
        selectedCategories.length === 0 ||
        selectedCategories.some((cat) => item.tags.includes(cat))

      const matchKeyword =
        selectedKeywords.length === 0 ||
        selectedKeywords.some((kw) => item.tags.includes(kw))

      return matchSearch && matchCategory && matchKeyword
    })
  }, [search, selectedCategories, selectedKeywords])

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filtered.slice(start, start + perPage)
  }, [filtered, currentPage])

  const totalPages = Math.ceil(filtered.length / perPage)

  const handleRemoveChip = (value: string) => {
    setSelectedCategories((prev) => prev.filter((v) => v !== value))
    setSelectedKeywords((prev) => prev.filter((v) => v !== value))
  }

  return (
    <div className="gap-gutter container grid grid-cols-12 py-10">
      {/* Sidebar Filters */}
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

      {/* Main Content */}
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((item) => (
            <UploadCard
              key={item.id}
              menteeCount={0}
              {...item}
              onClick={() =>
                router.push(`/coffeechatDetail/${item.id}`)
              }
            />
          ))}
        </div>

        <Pagination
          total={totalPages}
          initialPage={currentPage}
          onChange={setCurrentPage}
        />
      </section>
    </div>
  )
}
