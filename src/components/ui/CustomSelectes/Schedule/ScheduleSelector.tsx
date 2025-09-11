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
    const updated = { ...local, days: [day] } // ✅ 하나만 선택
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
            className={`rounded-2xs px-spacing-4xs font-label3-medium cursor-pointer border py-[10px] transition-all ${
              local.days.includes(day)
                ? 'border-border-secondary text-label-primary bg-fill-selected-orange'
                : 'border-border-subtler text-label-subtler bg-fill-input-gray'
            } ${readOnly ? 'cursor-default' : 'hover:border-border-secondary'}`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* 시간 */}
      <div className="flex items-center gap-[9px]">
        {readOnly ? (
          <div className="px-spacing-4xs py-spacing-5xs border-border-subtler rounded-2xs bg-fill-input-gray flex items-center border">
            <span className="font-label4-medium text-label-subtle">
              {local.startTime || '--:--'}
            </span>
            <span>~</span>
            <span className="font-label4-medium text-label-subtle">
              {local.endTime || '--:--'}
            </span>
          </div>
        ) : (
          <>
            <select
              value={local.startTime}
              onChange={(e) =>
                handleTimeChange('startTime', e.target.value)
              }
              className="border-border-subtle text-label-strong rounded-2xs px-spacing-4xs py-spacing-5xs font-label4-medium cursor-pointer border"
            >
              <option
                className="cursor-pointer"
                value=""
              >
                선택
              </option>
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
              value={local.endTime}
              onChange={(e) =>
                handleTimeChange('endTime', e.target.value)
              }
              className="border-border-subtle text-label-strong rounded-2xs px-spacing-4xs py-spacing-5xs font-label4-medium cursor-pointer border"
            >
              <option
                className="cursor-pointer"
                value=""
              >
                선택
              </option>
              {TIMES.map((t) => (
                <option
                  key={t}
                  value={t}
                >
                  {t}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
    </div>
  )
}
