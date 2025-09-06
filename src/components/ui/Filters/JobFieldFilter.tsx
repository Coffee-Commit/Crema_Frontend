'use client'

import { useState } from 'react'

interface Option {
  label: string
  value: string
}

const JOB_FIELDS: Option[] = [
  { label: '디자인', value: 'design' },
  { label: '기획 / 전략', value: 'plan' },
  { label: '마케팅 / 홍보', value: 'marketing' },
  { label: '경영 / 지원', value: 'management' },
  { label: 'IT 개발 / 데이터', value: 'it' },
  { label: '연구 / R&D', value: 'rnd' },
]

export default function JobFieldFilter() {
  const [selected, setSelected] = useState<string[]>([
    'design',
    'plan',
  ])

  const toggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value],
    )
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
