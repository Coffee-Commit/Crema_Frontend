'use client'

import { Calendar, Clock } from 'lucide-react'
import { useState } from 'react'

const TIMES = Array.from({ length: 48 }, (_, i) => {
  const hour = String(Math.floor(i / 2)).padStart(2, '0')
  const minute = i % 2 === 0 ? '00' : '30'
  return `${hour}:${minute}`
})

export default function DateTimeSelector() {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  return (
    <div className="gap-spacing-md flex">
      {/* 날짜 선택 */}
      <label className="gap-spacing-3xs border-border-light bg-fill-button px-spacing-md py-spacing-xs text-label-secondary flex w-[168px] items-center rounded-md border">
        <Calendar className="stroke-label-secondary h-4 w-4" />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="text-label-secondary w-full bg-transparent text-sm outline-none"
        />
      </label>

      {/* 시간 선택 */}
      <label className="gap-spacing-3xs border-border-light bg-fill-button px-spacing-md py-spacing-xs text-label-secondary flex w-[168px] items-center rounded-md border">
        <Clock className="stroke-label-secondary h-4 w-4" />
        <select
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="text-label-secondary w-full bg-transparent text-sm outline-none"
        >
          <option value="">시간 선택</option>
          {TIMES.map((t) => (
            <option
              key={t}
              value={t}
            >
              {t}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
