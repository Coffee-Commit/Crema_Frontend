'use client'

interface Option {
  label: string
  value: string // API ENUM 값
}

const JOB_FIELDS: Option[] = [
  { label: '디자인', value: 'DESIGN' },
  { label: '기획 / 전략', value: 'PLANNING_STRATEGY' },
  { label: '마케팅 / 홍보', value: 'MARKETING_PR' },
  { label: '경영 / 지원', value: 'MANAGEMENT_SUPPORT' },
  { label: 'IT 개발 / 데이터', value: 'IT_DEVELOPMENT_DATA' },
  { label: '연구 / R&D', value: 'RESEARCH_RND' },
]

interface JobFieldFilterProps {
  selected: string[] // ENUM 값 배열
  onChange: (values: string[]) => void
}

export default function JobFieldFilter({
  selected,
  onChange,
}: JobFieldFilterProps) {
  const toggle = (value: string) => {
    const newValues = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value]
    onChange(newValues)
  }

  return (
    <div className="border-border-subtler bg-fill-white p-spacing-md rounded-2xs border">
      <div className="gap-spacing-sm grid grid-cols-3">
        {JOB_FIELDS.map((opt) => (
          <label
            key={opt.value}
            className="label4-medium flex cursor-pointer items-center gap-2"
          >
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => toggle(opt.value)}
              className="h-4 w-4 cursor-pointer accent-[var(--color-fill-primary)]"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  )
}
