'use client'

import Accordion from './Accordion'

interface FilterSidebarProps {
  selectedJobFields: string[]
  setSelectedJobFields: React.Dispatch<React.SetStateAction<string[]>>
  selectedTopics: string[]
  setSelectedTopics: React.Dispatch<React.SetStateAction<string[]>>
}

const jobFieldOptions = [
  { label: '디자인', value: 'DESIGN' },
  { label: '기획/전략', value: 'PLANNING_STRATEGY' },
  { label: '마케팅/홍보', value: 'MARKETING_PR' },
  { label: '경영/지원', value: 'MANAGEMENT_SUPPORT' },
  { label: 'IT 개발/데이터', value: 'IT_DEVELOPMENT_DATA' },
  { label: '연구/R&D', value: 'RESEARCH_RND' },
]

const topicGroups = [
  {
    title: '서류 및 면접',
    options: [
      { label: '이력서', value: 'RESUME' },
      { label: '자소서', value: 'COVER_LETTER' },
      { label: '포트폴리오', value: 'PORTFOLIO' },
      { label: '면접', value: 'INTERVIEW' },
    ],
  },
  {
    title: '회사 생활',
    options: [
      { label: '실무', value: 'PRACTICAL_WORK' },
      { label: '조직문화', value: 'ORGANIZATION_CULTURE' },
      { label: '워라밸', value: 'WORK_LIFE_BALANCE' },
      { label: '인간관계', value: 'RELATIONSHIP' },
    ],
  },
  {
    title: '커리어',
    options: [
      { label: '합격 경험', value: 'PASS_EXPERIENCE' },
      { label: '업계 트렌드', value: 'INDUSTRY_TREND' },
      { label: '직무 전환', value: 'CAREER_CHANGE' },
      { label: '이직', value: 'JOB_CHANGE' },
    ],
  },
]

export default function FilterSidebar({
  selectedJobFields,
  setSelectedJobFields,
  selectedTopics,
  setSelectedTopics,
}: FilterSidebarProps) {
  const toggleArrayValue = (
    setFn: React.Dispatch<React.SetStateAction<string[]>>,
    value: string,
  ) => {
    setFn((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value],
    )
  }

  return (
    <div className="border-border-subtler bg-fill-white p-spacing-md flex h-[1000px] w-[300px] flex-col gap-2 overflow-y-auto rounded-md border">
      {/* 직무 분야 */}
      <Accordion title="커피챗 분야">
        {jobFieldOptions.map((opt) => (
          <span
            key={opt.value}
            onClick={() =>
              toggleArrayValue(setSelectedJobFields, opt.value)
            }
            className={`font-label4-medium cursor-pointer ${
              selectedJobFields.includes(opt.value)
                ? 'text-label-primary font-semibold'
                : 'text-label-default'
            }`}
          >
            {opt.label}
          </span>
        ))}
      </Accordion>

      <div className="border-fill-disabled my-spacing-md h-[1px] border-b" />

      {/* 주제 그룹 */}
      <span className="font-title4 text-label-deep mb-spacing-xs">
        커피챗 주제
      </span>
      {topicGroups.map((group) => (
        <Accordion
          key={group.title}
          title={group.title}
        >
          {group.options.map((opt) => (
            <span
              key={opt.value}
              onClick={() =>
                toggleArrayValue(setSelectedTopics, opt.value)
              }
              className={`font-label4-medium cursor-pointer ${
                selectedTopics.includes(opt.value)
                  ? 'text-label-primary font-semibold'
                  : 'text-label-default'
              }`}
            >
              {opt.label}
            </span>
          ))}
        </Accordion>
      ))}
    </div>
  )
}
