'use client'

interface Option {
  label: string
  value: string // API ENUM 값
}

interface Group {
  title: string
  options: Option[]
}

const GROUPS: Group[] = [
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
      { label: '인간관계', value: 'RELATIONSHIP' },
      { label: '워라밸', value: 'WORK_LIFE_BALANCE' },
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

interface CategoryFilterProps {
  selected: string | null // 단일 값
  onChange: (value: string | null) => void
}

export default function CategoryFilter({
  selected,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="border-border-subtler bg-fill-white p-spacing-md rounded-2xs border">
      <div className="gap-spacing-lg grid grid-cols-1 md:grid-cols-3">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <p className="mb-spacing-2xs font-label4-semibold text-label-strong">
              {group.title}
            </p>
            <div className="gap-spacing-2xs flex flex-col">
              {group.options.map((opt) => (
                <label
                  key={opt.value}
                  className="font-label4-medium flex cursor-pointer items-center gap-2"
                >
                  <input
                    type="radio"
                    checked={selected === opt.value}
                    onChange={() =>
                      onChange(
                        selected === opt.value ? null : opt.value,
                      )
                    }
                    className="h-4 w-4 cursor-pointer accent-[var(--color-fill-primary)]"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
