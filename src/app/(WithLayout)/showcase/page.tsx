'use client'

import Banner from '@/components/layout/Banner'
import InfoBadge from '@/components/ui/Badges/InfoBadge'
import RoleBadge from '@/components/ui/Badges/RoleBadge'
import CircleButton from '@/components/ui/Buttons/CircleButton'
import SquareButton from '@/components/ui/Buttons/SquareButton'
import DetailedExperienceCard from '@/components/ui/Cards/DetailedExperienceCard'
import ExperienceCard from '@/components/ui/Cards/ExperienceCard'
import OverallRatingCard from '@/components/ui/Cards/OverallRatingCard'
import OverviewCard from '@/components/ui/Cards/OverviewCard'
import ReviewCard from '@/components/ui/Cards/ReviewCard'
import FileUploadCard from '@/components/ui/FileUpload/FileUploadCard'
import CategoryFilter from '@/components/ui/Filters/CategoryFilter'
import JobFieldFilter from '@/components/ui/Filters/JobFieldFilter'
import TextAreaCounter from '@/components/ui/Inputs/TextAreaCounter'
import TextFieldCounter from '@/components/ui/Inputs/TextFieldCounter'
import Pagination from '@/components/ui/Paginations/Pagination'
import SearchBarMain from '@/components/ui/SearchBar/SearchBarMain'
import SearchBarSub from '@/components/ui/SearchBar/SearchBarSub'
import CircleTag from '@/components/ui/Tags/CircleTag'
import KeywordTag from '@/components/ui/Tags/KeywordTag'
import NumberTag from '@/components/ui/Tags/NumberTag'
import LabeledToggle from '@/components/ui/Toggle/LabledToggle'

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
        <KeywordTag>여덟글자까지가능</KeywordTag>
      </div>

      {/* Circle Tags */}
      <div className="col-span-12 flex flex-col flex-wrap gap-4 rounded-xl bg-yellow-200 p-4">
        <CircleTag variant="primary">대상</CircleTag>
        <CircleTag variant="secondary">대상</CircleTag>
        <CircleTag variant="outline">대상</CircleTag>
        <CircleTag variant="light">대상</CircleTag>
        <CircleTag variant="disabled">대상</CircleTag>
      </div>

      {/* Nuumber Tags */}
      <div className="col-span-12 flex flex-col flex-wrap gap-4 rounded-xl bg-yellow-200 p-4">
        <NumberTag value={12} />
        <NumberTag value={3} />
        <NumberTag
          value={120}
          max={99}
        />{' '}
        {/* 99+ 로 표시 */}
      </div>

      {/* Toggle Switch */}
      <div className="col-span-12 flex flex-col flex-wrap gap-4 rounded-xl bg-yellow-200 p-4">
        <LabeledToggle
          label="커피챗 공개 여부"
          checked={true}
          onChange={(val) => console.log('토글 상태:', val)}
        />
      </div>

      {/* Filter groups */}
      <div className="col-span-12 flex flex-col flex-wrap gap-4 rounded-xl bg-yellow-200 p-4">
        <JobFieldFilter />
        <CategoryFilter />
      </div>

      {/* TextArea */}
      <div className="col-span-12 flex flex-col flex-wrap gap-4 rounded-xl bg-yellow-200 p-4">
        <TextAreaCounter
          placeholder="사전 전달 내용을 작성해주세요. 자세할수록 선배가 참고하기에 용이합니다."
          maxLength={2000}
        />
        <TextAreaCounter
          placeholder="사전 전달 내용을 작성해주세요. 자세할수록 선배가 참고하기에 용이합니다."
          maxLength={60}
        />
      </div>

      {/* TextField */}
      <div className="col-span-12 flex flex-col flex-wrap gap-4 rounded-xl bg-yellow-200 p-4">
        {/* 기본 */}
        <TextFieldCounter
          placeholder="닉네임 입력값"
          maxLength={10}
          helperText="이미 사용 중인 닉네임입니다."
        />

        {/* 비활성 */}
        <TextFieldCounter
          placeholder="닉네임 입력값"
          maxLength={10}
          status="disabled"
          helperText="이미 사용 중인 닉네임입니다."
        />

        {/* 에러 */}
        <TextFieldCounter
          placeholder="닉네임 입력값"
          maxLength={10}
          status="error"
          helperText="이미 사용 중인 닉네임입니다."
        />
      </div>

      {/* Pagination */}
      <div className="col-span-12 flex flex-col flex-wrap gap-4 rounded-xl bg-yellow-200 p-4">
        <Pagination total={10} />
      </div>

      {/* Card - OvrallRatingCard */}
      <div className="col-span-12 flex flex-col flex-wrap gap-4 rounded-xl bg-yellow-200 p-4">
        <OverallRatingCard
          type="star"
          title="별점"
          rating={4.5}
          reviewCount={10}
        />
        <OverallRatingCard
          type="experience"
          title="가장 도움이 된 경험"
          label="오늘의집 최종 합격"
          progress={80}
          iconSize={18}
        />
      </div>

      {/* Card - ExperienceCard */}
      <div className="col-span-12 flex flex-col flex-wrap gap-4 rounded-xl bg-yellow-200 p-4">
        <ExperienceCard
          title="실내디자인에서 ‘실내’ 빼기"
          description="작은 프로젝트 경험을 설득력 있게 담는 것부터 시작해서 포트폴리오를 완성했어요"
          tag="직무 전환"
        />
      </div>

      {/* Card - OverviewCard */}
      <div className="col-span-12 flex flex-col flex-wrap gap-4 rounded-xl bg-yellow-200 p-4">
        <OverviewCard
          items={[
            {
              label: '대상',
              content: '전공과 다른 직무를 준비하는 취준생',
            },
            {
              label: '상황',
              content: '“내가 이 길을 가도 괜찮을까?” 고민될 때',
            },
            {
              label: '내용',
              content:
                '비전공자로서 겪은 현실적인 어려움과 성장 경험',
            },
          ]}
        />
      </div>

      {/* Card - DetailedExperienceCard */}
      <div className="col-span-12 flex flex-col flex-wrap gap-4 rounded-xl bg-yellow-200 p-4">
        <DetailedExperienceCard
          title="경험 별 도움된 비율"
          className="w-full max-w-[625px]"
          items={[
            { label: '실내디자인에서 ‘실내’ 빼기', progress: 60 },
            {
              label: '전공자 사이에서 살아남기 : 면접 편',
              progress: 60,
            },
            { label: '비전공자의 포트폴리오 완성기', progress: 60 },
            {
              label: '오늘의집 최종 합격',
              progress: 60,
              iconSrc: '/icons/awardIcon.svg',
            },
            {
              label: '서류부터 면접까지 탈락만 30회+@  ',
              progress: 60,
            },
            {
              label: '전공자 사이에서 살아남기 : 회사 편',
              progress: 60,
            },
          ]}
        />
      </div>

      {/* Card - ReviewCard */}
      <div className="col-span-12 flex flex-col flex-wrap gap-4 rounded-xl bg-yellow-200 p-4">
        <ReviewCard
          rating={4.5}
          text="리뷰내용 스포일러 방지하기 위해 최대 100자로 제한 리뷰내용 스포일러 방지하기 위해 최대 100자로 제한 리뷰내용 스포일러 방지하기 위해 최대 100자로 제한 리뷰내용 스포일러 방지하기 위해 최대 100자로 제한 리뷰내용 스포일러 방지하기 위해 최대 100자로 제한"
          nickname="익명**"
          date="2025.08.23"
          className="w-[840px]"
        />
      </div>

      {/* Card - FileUploadCard.tsx */}
      <div className="col-span-12 flex flex-col flex-wrap gap-4 rounded-xl bg-yellow-200 p-4">
        <FileUploadCard className="w-[756px]" />
      </div>

      {/* Banner.tsx */}
      <div className="col-span-12 flex flex-col flex-wrap gap-4 rounded-xl bg-yellow-200 p-4">
        <Banner
          categories={[
            '디자인',
            '직무 전환',
            '포트폴리오',
            '자소서',
            '면접',
            '합격 경험',
            '실무',
          ]}
          title="실내디자인이나 프로덕트 디자인이나 같은 디자인 아닌가요?"
          rating={4.5}
          reviewCount={10}
          keywords={[
            '당연히아님',
            '비전공자',
            '서류광탈',
            '편한분위기',
            '인테리어전문불가',
          ]}
        />
      </div>
    </section>
  )
}
