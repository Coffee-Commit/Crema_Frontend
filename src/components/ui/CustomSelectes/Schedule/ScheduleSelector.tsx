'use client'

import { useState } from 'react'

export type Schedule = {
  days: string[]
  startTime: string
  endTime: string
}

interface ScheduleSelectorProps {
  schedule: Schedule
  onChange?: (updated: Schedule) => void
  readOnly?: boolean
}

const DAYS = ['월', '화', '수', '목', '금', '토', '일']
const TIMES = Array.from({ length: 48 }, (_, i) => {
  const hour = String(Math.floor(i / 2)).padStart(2, '0')
  const minute = i % 2 === 0 ? '00' : '30'
  return `${hour}:${minute}`
})

export default function ScheduleSelector({
  schedule,
  onChange,
  readOnly = false,
}: ScheduleSelectorProps) {
  const [local, setLocal] = useState<Schedule>(schedule)

  const toggleDay = (day: string) => {
    if (readOnly) return
    const updatedDays = local.days.includes(day)
      ? local.days.filter((d) => d !== day)
      : [...local.days, day]
    const updated = { ...local, days: updatedDays }
    setLocal(updated)
    onChange?.(updated)
  }

  const handleTimeChange = (
    type: 'startTime' | 'endTime',
    value: string,
  ) => {
    if (readOnly) return
    const updated = { ...local, [type]: value }
    setLocal(updated)
    onChange?.(updated)
  }

  return (
    <div className="flex items-center gap-4">
      {/* 요일 */}
      <div className="flex gap-2">
        {DAYS.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => toggleDay(day)}
            className={`rounded-md border px-3 py-1 text-sm transition-all ${
              local.days.includes(day)
                ? 'border-semantic-accent text-semantic-accent bg-semantic-accent-subtle'
                : 'border-border-subtle text-label-secondary bg-fill-white'
            } ${readOnly ? 'cursor-default' : 'hover:border-semantic-accent'}`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* 시간 */}
      <div className="flex items-center gap-2">
        <select
          disabled={readOnly}
          value={local.startTime}
          onChange={(e) =>
            handleTimeChange('startTime', e.target.value)
          }
          className="border-border-subtle text-label-default rounded-md border px-2 py-1 text-sm"
        >
          <option value="">선택</option>
          {TIMES.map((t) => (
            <option
              key={t}
              value={t}
            >
              {t}
            </option>
          ))}
        </select>
        <span>~</span>
        <select
          disabled={readOnly}
          value={local.endTime}
          onChange={(e) =>
            handleTimeChange('endTime', e.target.value)
          }
          className="border-border-subtle text-label-default rounded-md border px-2 py-1 text-sm"
        >
          <option value="">선택</option>
          {TIMES.map((t) => (
            <option
              key={t}
              value={t}
            >
              {t}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
