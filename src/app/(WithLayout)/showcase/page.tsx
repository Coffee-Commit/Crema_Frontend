'use client'

import InfoBadge from '@/components/ui/Badges/InfoBadge'
import RoleBadge from '@/components/ui/Badges/RoleBadge'
import CircleButton from '@/components/ui/Buttons/CircleButton'
import SquareButton from '@/components/ui/Buttons/SquareButton'
import SearchBarMain from '@/components/ui/SearchBar/SearchBarMain'
import SearchBarSub from '@/components/ui/SearchBar/SearchBarSub'
import KeywordTag from '@/components/ui/Tags/KeywordTag'

export default function Page() {
  const handleSearch = (value: string) => {
    console.log('검색어:', value)
  }

  const user1 = { role: null }
  const user2 = { role: 'GUIDE' as const }

  return (
    <section className="gap-gutter grid grid-cols-12 py-10">
      {/* Circle Buttons Group */}
      <div className="col-span-12 flex flex-wrap gap-4 rounded-xl bg-red-200 p-4">
        <div className="flex flex-col gap-2">
          <CircleButton
            variant="primary"
            size="sm"
          >
            primary-sm
          </CircleButton>
          <CircleButton
            variant="primary"
            size="md"
          >
            primary-md
          </CircleButton>
          <CircleButton
            variant="primary"
            size="lg"
          >
            primary-lg
          </CircleButton>
          <CircleButton
            variant="primary"
            size="xl"
          >
            primary-xl
          </CircleButton>
        </div>
        <div className="flex flex-col gap-2">
          <CircleButton
            variant="secondary"
            size="sm"
          >
            secondary-sm
          </CircleButton>
          <CircleButton
            variant="secondary"
            size="md"
          >
            secondary-md
          </CircleButton>
          <CircleButton
            variant="secondary"
            size="lg"
          >
            secondary-lg
          </CircleButton>
          <CircleButton
            variant="secondary"
            size="xl"
          >
            secondary-xl
          </CircleButton>
        </div>
        <div className="flex flex-col gap-2">
          <CircleButton
            variant="tertiary"
            size="sm"
          >
            tertiary-sm
          </CircleButton>
          <CircleButton
            variant="tertiary"
            size="md"
          >
            tertiary-md
          </CircleButton>
          <CircleButton
            variant="tertiary"
            size="lg"
          >
            tertiary-lg
          </CircleButton>
          <CircleButton
            variant="tertiary"
            size="xl"
          >
            tertiary-xl
          </CircleButton>
        </div>
        <div className="flex flex-col gap-2">
          <CircleButton
            variant="disabled"
            size="sm"
          >
            disabled-sm
          </CircleButton>
          <CircleButton
            variant="disabled"
            size="md"
          >
            disabled-md
          </CircleButton>
          <CircleButton
            variant="disabled"
            size="lg"
          >
            disabled-lg
          </CircleButton>
          <CircleButton
            variant="disabled"
            size="xl"
          >
            disabled-xl
          </CircleButton>
        </div>
      </div>

      {/* Square Buttons Group */}
      <div className="col-span-12 flex flex-wrap gap-4 rounded-xl bg-blue-200 p-4">
        <div className="flex flex-col gap-2">
          <SquareButton
            variant="primary"
            size="xs"
          >
            primary-xs
          </SquareButton>
          <SquareButton
            variant="primary"
            size="sm"
          >
            primary-sm
          </SquareButton>
          <SquareButton
            variant="primary"
            size="md"
          >
            primary-md
          </SquareButton>
          <SquareButton
            variant="primary"
            size="lg"
          >
            primary-lg
          </SquareButton>
          <SquareButton
            variant="primary"
            size="xl"
          >
            primary-xl
          </SquareButton>
        </div>
        <div className="flex flex-col gap-2">
          <SquareButton
            variant="secondary"
            size="sm"
          >
            secondary-sm
          </SquareButton>
          <SquareButton
            variant="secondary"
            size="md"
          >
            secondary-md
          </SquareButton>
          <SquareButton
            variant="secondary"
            size="lg"
          >
            secondary-lg
          </SquareButton>
        </div>
        <div className="flex flex-col gap-2">
          <SquareButton
            variant="tertiary"
            size="sm"
          >
            tertiary-sm
          </SquareButton>
          <SquareButton
            variant="tertiary"
            size="md"
          >
            tertiary-md
          </SquareButton>
          <SquareButton
            variant="tertiary"
            size="lg"
          >
            tertiary-lg
          </SquareButton>
        </div>
        <div className="flex flex-col gap-2">
          <SquareButton
            variant="disabled"
            size="sm"
          >
            disabled-sm
          </SquareButton>
          <SquareButton
            variant="disabled"
            size="md"
          >
            disabled-md
          </SquareButton>
          <SquareButton
            variant="disabled"
            size="lg"
          >
            disabled-lg
          </SquareButton>
        </div>
      </div>

      {/* SearchBars Group */}
      <div className="col-span-12 flex flex-col flex-wrap gap-4 rounded-xl bg-yellow-200 p-4">
        <SearchBarSub onSubmit={handleSearch} />
        <SearchBarSub
          width="250px"
          height="48px"
          onSubmit={handleSearch}
        />
        <div className="w-[300px]">
          <SearchBarSub onSubmit={handleSearch} />
        </div>
        <SearchBarMain onSubmit={handleSearch} />
        <SearchBarMain
          width="624px"
          height="56px"
          onSubmit={handleSearch}
        />
        <div className="w-[300px]">
          <SearchBarMain onSubmit={handleSearch} />
        </div>
      </div>

      {/* Badges */}
      <div className="col-span-12 flex flex-col flex-wrap gap-4 rounded-xl bg-yellow-200 p-4">
        <div className="flex gap-4">
          <RoleBadge role={user1.role} />
          <RoleBadge role={user2.role} />
          <InfoBadge>상세</InfoBadge>
        </div>
      </div>

      {/* Keyword Tags */}
      <div className="col-span-12 flex flex-col flex-wrap gap-4 rounded-xl bg-yellow-200 p-4">
        <div className="flex gap-4">
          <KeywordTag>여덟글자까지가능</KeywordTag>
          <KeywordTag className="text-[var(--color-label-white)] [background:var(--color-fill-primary)]">
            여덟글자까지가능
          </KeywordTag>
        </div>
        <div className="flex gap-4">
          <KeywordTag size="lg">여덟글자까지가능</KeywordTag>
          <KeywordTag
            size="lg"
            className="text-[var(--color-label-white)] [background:var(--color-fill-primary)]"
          >
            여덟글자까지가능
          </KeywordTag>
        </div>
      </div>
    </section>
  )
}
