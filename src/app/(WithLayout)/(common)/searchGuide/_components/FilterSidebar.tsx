'use client'

import Accordion from './Accordion'

interface FilterSidebarProps {
  selectedJobFields: string[]
  setSelectedJobFields: React.Dispatch<React.SetStateAction<string[]>>
  selectedTopics: string[]
  setSelectedTopics: React.Dispatch<React.SetStateAction<string[]>>
}

const jobFieldOptions = [
  { label: '디자인', value: '디자인' },
  { label: '기획/전략', value: '기획/전략' },
  { label: '마케팅/홍보', value: '마케팅/홍보' },
  { label: '경영/지원', value: '경영/지원' },
  { label: 'IT 개발/데이터', value: 'IT 개발/데이터' },
  { label: '연구/R&D', value: '연구/R&D' },
]

const topicGroups = [
  {
    title: '서류 및 면접',
    options: [
      { label: '이력서', value: '이력서' },
      { label: '자소서', value: '자소서' },
      { label: '포트폴리오', value: '포트폴리오' },
      { label: '면접', value: '면접' },
    ],
  },
  {
    title: '회사 생활',
    options: [
      { label: '실무', value: '실무' },
      { label: '조직문화', value: '조직문화' },
      { label: '워라밸', value: '워라밸' },
      { label: '인간관계', value: '인간관계' },
    ],
  },
  {
    title: '커리어',
    options: [
      { label: '합격 경험', value: '합격 경험' },
      { label: '업계 트렌드', value: '업계 트렌드' },
      { label: '직무 전환', value: '직무 전환' },
      { label: '이직', value: '이직' },
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
    setFn(
      (prev) =>
        prev.includes(value)
          ? prev.filter((v) => v !== value) // 이미 있으면 제거
          : [...prev, value], // 없으면 추가
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
