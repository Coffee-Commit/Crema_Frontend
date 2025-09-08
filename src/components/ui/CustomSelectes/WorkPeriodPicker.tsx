'use client'

import { useState } from 'react'

interface WorkPeriodPickerProps {
  value?: {
    startYear: string
    startMonth: string
    endYear: string
    endMonth: string
    isCurrent: boolean
  }
  onChange?: (val: {
    startYear: string
    startMonth: string
    endYear: string
    endMonth: string
    isCurrent: boolean
  }) => void
}

export default function WorkPeriodPicker({
  value,
  onChange,
}: WorkPeriodPickerProps) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) =>
    String(currentYear - i),
  )
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1))

  const [internal, setInternal] = useState({
    startYear: '',
    startMonth: '',
    endYear: '',
    endMonth: '',
    isCurrent: false,
  })

  const state = value ?? internal

  const update = (patch: Partial<typeof internal>) => {
    const updated = { ...state, ...patch }
    if (!value) setInternal(updated)
    onChange?.(updated)
  }

  return (
    <div className="gap-spacing-2xs flex flex-col">
      {/* 상단 라벨 + 체크박스 */}
      <div className="flex items-center justify-between">
        <label className="font-title4 text-label-strong">
          근무기간
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={state.isCurrent}
            onChange={(e) => update({ isCurrent: e.target.checked })}
            className="border-border-subtle accent-fill-primary h-4 w-4 cursor-pointer rounded"
          />
          <span className="font-caption2-medium text-label-deep">
            재직중
          </span>
        </label>
      </div>

      {/* 드롭다운 */}
      <div className="gap-spacing-2xs flex items-center">
        <select
          value={state.startYear}
          onChange={(e) => update({ startYear: e.target.value })}
          className="border-border-subtle bg-fill-white text-label-subtle focus:ring-label-primary rounded-2xs h-[40px] w-[90px] border px-2 focus:outline-none focus:ring-1"
        >
          <option value="">년도</option>
          {years.map((y) => (
            <option
              key={y}
              value={y}
            >
              {y}
            </option>
          ))}
        </select>

        <select
          value={state.startMonth}
          onChange={(e) => update({ startMonth: e.target.value })}
          className="border-border-subtle bg-fill-white text-label-subtle focus:ring-label-primary rounded-2xs h-[40px] w-[90px] border px-2 focus:outline-none focus:ring-1"
        >
          <option value="">월</option>
          {months.map((m) => (
            <option
              key={m}
              value={m}
            >
              {m.padStart(2, '0')}
            </option>
          ))}
        </select>

        <span>~</span>

        <select
          value={state.endYear}
          onChange={(e) => update({ endYear: e.target.value })}
          disabled={state.isCurrent}
          className="border-border-subtle bg-fill-white text-label-subtle focus:ring-label-primary disabled:bg-fill-disabled rounded-2xs h-[40px] w-[90px] border px-2 focus:outline-none focus:ring-1"
        >
          <option value="">{state.isCurrent ? '-' : '년도'}</option>
          {years.map((y) => (
            <option
              key={y}
              value={y}
            >
              {y}
            </option>
          ))}
        </select>

        <select
          value={state.endMonth}
          onChange={(e) => update({ endMonth: e.target.value })}
          disabled={state.isCurrent}
          className="border-border-subtle bg-fill-white text-label-subtle focus:ring-label-primary disabled:bg-fill-disabled rounded-2xs h-[40px] w-[90px] border px-2 focus:outline-none focus:ring-1"
        >
          <option value="">{state.isCurrent ? '-' : '월'}</option>
          {months.map((m) => (
            <option
              key={m}
              value={m}
            >
              {m.padStart(2, '0')}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
