'use client'

interface Option {
  label: string
  value: string
}

const JOB_FIELDS: Option[] = [
  { label: '디자인', value: '디자인' },
  { label: '기획 / 전략', value: '기획/전략' },
  { label: '마케팅 / 홍보', value: '마케팅/홍보' },
  { label: '경영 / 지원', value: '경영/지원' },
  { label: 'IT 개발 / 데이터', value: 'IT 개발/데이터' },
  { label: '연구 / R&D', value: '연구/R&D' },
]

interface JobFieldFilterProps {
  selected: string[]
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
    <div className="border-border-subtler bg-fill-white p-spacing-md rounded-md border">
      <div className="gap-spacing-sm grid grid-cols-3">
        {JOB_FIELDS.map((opt) => (
          <label
            key={opt.value}
            className="font-body3 flex cursor-pointer items-center gap-2"
          >
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => toggle(opt.value)}
              className="h-4 w-4 accent-[var(--color-fill-primary)]"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  )
}
