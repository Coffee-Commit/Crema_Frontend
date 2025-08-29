'use client'

import RoleBadge from '@/components/ui/Badges/RoleBadge'
import CircleButton from '@/components/ui/Buttons/CircleButton'
import SquareButton from '@/components/ui/Buttons/SquareButton'
import SearchBarSub from '@/components/ui/SearchBar/SearchBarSub'
import KeywordTag from '@/components/ui/Tags/KeywordTag'

export default function Page() {
  const handleSearch = (value: string) => {
    console.log('검색어:', value) // ✅ value 사용 처리
  }

  const user1 = { role: null } // 롤뱃지
  const user2 = { role: 'guide' as const } // 롤뱃지

  return (
    <>
      <section className="gap-gutter grid grid-cols-12">
        <div className="col-span-3 flex flex-col flex-wrap gap-4 bg-red-200">
          <CircleButton
            variant="primary"
            size="sm"
          >
            텍스트
          </CircleButton>
          <CircleButton
            variant="primary"
            size="md"
          >
            텍스트
          </CircleButton>
          <CircleButton
            variant="primary"
            size="lg"
          >
            텍스트
          </CircleButton>
        </div>
        <div className="col-span-3 flex flex-col flex-wrap gap-4 bg-blue-200">
          <CircleButton
            variant="secondary"
            size="sm"
          >
            텍스트
          </CircleButton>
          <CircleButton
            variant="secondary"
            size="md"
          >
            텍스트
          </CircleButton>
          <CircleButton
            variant="secondary"
            size="lg"
          >
            텍스트
          </CircleButton>
        </div>
        <div className="col-span-3 flex flex-col flex-wrap gap-4 bg-green-200">
          <CircleButton
            variant="tertiary"
            size="sm"
          >
            텍스트
          </CircleButton>
          <CircleButton
            variant="tertiary"
            size="md"
          >
            텍스트
          </CircleButton>
          <CircleButton
            variant="tertiary"
            size="lg"
          >
            텍스트
          </CircleButton>
        </div>
        <div className="col-span-3 flex flex-col flex-wrap gap-4 bg-yellow-200">
          <CircleButton
            variant="disabled"
            size="sm"
          >
            텍스트
          </CircleButton>
          <CircleButton
            variant="disabled"
            size="md"
          >
            텍스트
          </CircleButton>
          <CircleButton
            variant="disabled"
            size="lg"
          >
            텍스트
          </CircleButton>
        </div>
        <div className="col-span-3 flex flex-col flex-wrap gap-4 bg-red-200">
          <SquareButton
            variant="primary"
            size="sm"
          >
            텍스트
          </SquareButton>
          <SquareButton
            variant="primary"
            size="md"
          >
            텍스트
          </SquareButton>
          <SquareButton
            variant="primary"
            size="lg"
          >
            텍스트
          </SquareButton>
        </div>
        <div className="col-span-3 flex flex-col flex-wrap gap-4 bg-blue-200">
          <SquareButton
            variant="secondary"
            size="sm"
          >
            텍스트
          </SquareButton>
          <SquareButton
            variant="secondary"
            size="md"
          >
            텍스트
          </SquareButton>
          <SquareButton
            variant="secondary"
            size="lg"
          >
            텍스트
          </SquareButton>
        </div>
        <div className="col-span-3 flex flex-col flex-wrap gap-4 bg-green-200">
          <SquareButton
            variant="tertiary"
            size="sm"
          >
            텍스트
          </SquareButton>
          <SquareButton
            variant="tertiary"
            size="md"
          >
            텍스트
          </SquareButton>
          <SquareButton
            variant="tertiary"
            size="lg"
          >
            텍스트
          </SquareButton>
        </div>
        <div className="col-span-3 flex flex-col flex-wrap gap-4 bg-yellow-200">
          <SquareButton
            variant="disabled"
            size="sm"
          >
            텍스트
          </SquareButton>
          <SquareButton
            variant="disabled"
            size="md"
          >
            텍스트
          </SquareButton>
          <SquareButton
            variant="disabled"
            size="lg"
          >
            텍스트
          </SquareButton>
        </div>
        <div className="col-span-3 flex flex-col flex-wrap gap-4 bg-yellow-200">
          {/* 기본 사용 (전체 width) */}
          <SearchBarSub onSubmit={handleSearch} />

          {/* 고정된 사이즈 */}
          <SearchBarSub
            width="250px"
            height="48px"
            onSubmit={handleSearch}
          />

          {/* 반응형 - 부모 컨테이너에 맞춤 */}
          <div className="w-[300px]">
            <SearchBarSub onSubmit={handleSearch} />
          </div>
        </div>
        <div className="col-span-3 flex flex-col flex-wrap gap-4 bg-yellow-200">
          <div className="flex gap-4">
            <RoleBadge role={user1.role} /> {/* 후배 */}
            <RoleBadge role={user2.role} /> {/* 선배 */}
          </div>
        </div>
        <div className="col-span-3 flex flex-col flex-wrap gap-4 bg-yellow-200">
          <div className="flex gap-4">
            <KeywordTag>여덟글자까지가능</KeywordTag>
            <KeywordTag className="text-[var(--color-label-white)] [background:var(--color-fill-primary)]">
              여덟글자까지가능
            </KeywordTag>
          </div>
        </div>
      </section>
    </>
  )
}
