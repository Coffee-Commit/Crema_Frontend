'use client'

import { useState } from 'react'

import ScheduleSelector, { Schedule } from './ScheduleSelector'

export default function ScheduleInput() {
  const [schedules, setSchedules] = useState<Schedule[]>([])

  const handleAddSchedule = () => {
    setSchedules([
      ...schedules,
      { days: [], startTime: '', endTime: '' },
    ])
  }

  const handleChange = (index: number, updated: Schedule) => {
    const newSchedules = [...schedules]
    newSchedules[index] = updated
    setSchedules(newSchedules)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 입력용 스케줄 */}
      {schedules.map((schedule, index) => (
        <ScheduleSelector
          key={index}
          schedule={schedule}
          onChange={(updated) => handleChange(index, updated)}
        />
      ))}

      <button
        onClick={handleAddSchedule}
        className="bg-background-accent-subtle text-semantic-accent text-body4-bold w-full rounded-xl py-2 text-center"
      >
        + 일정 추가
      </button>

      {/* 결과 뷰 */}
      <div className="flex flex-col gap-4">
        {schedules
          .filter(
            (s) => s.days.length > 0 && s.startTime && s.endTime,
          )
          .map((s, idx) => (
            <ScheduleSelector
              key={`${s.days.join('-')}-${idx}`}
              schedule={s}
              readOnly
            />
          ))}
      </div>
    </div>
  )
}
