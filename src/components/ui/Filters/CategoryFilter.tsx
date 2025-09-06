'use client'

import { useState } from 'react'

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
      { label: '이력서', value: 'resume' },
      { label: '자소서', value: 'cover' },
      { label: '포트폴리오', value: 'portfolio' },
      { label: '면접', value: 'interview' },
    ],
  },
  {
    title: '회사 생활',
    options: [
      { label: '실무', value: 'work' },
      { label: '조직문화', value: 'culture' },
      { label: '인간관계', value: 'relation' },
      { label: '워라밸', value: 'balance' },
    ],
  },
  {
    title: '커리어',
    options: [
      { label: '합격 경험', value: 'success' },
      { label: '업계 트렌드', value: 'trend' },
      { label: '직무 전환', value: 'change' },
      { label: '이직', value: 'move' },
    ],
  },
]

export default function CategoryFilter() {
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value],
    )
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
