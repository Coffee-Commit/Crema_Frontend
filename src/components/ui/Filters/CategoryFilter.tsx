'use client'

interface Option {
  label: string
  value: string
}

interface Group {
  title: string
  options: Option[]
}

const GROUPS: Group[] = [
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
      { label: '인간관계', value: '인간관계' },
      { label: '워라밸', value: '워라밸' },
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

interface CategoryFilterProps {
  selected: string[]
  onChange: (values: string[]) => void
}

export default function CategoryFilter({
  selected,
  onChange,
}: CategoryFilterProps) {
  const toggle = (value: string) => {
    const newValues = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value]
    onChange(newValues)
  }

  return (
    <div className="border-border-subtler bg-fill-white p-spacing-md rounded-md border">
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
        ))}
      </div>
    </div>
  )
}
