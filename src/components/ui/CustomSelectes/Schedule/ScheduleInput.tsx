'use client'

import ScheduleSelector, { Schedule } from './ScheduleSelector'

interface ScheduleInputProps {
  schedules: Schedule[]
  onChange: (schedules: Schedule[]) => void
}

export default function ScheduleInput({
  schedules,
  onChange,
}: ScheduleInputProps) {
  const handleAddSchedule = () => {
    onChange([...schedules, { days: [], startTime: '', endTime: '' }])
  }

  const handleChange = (index: number, updated: Schedule) => {
    const newSchedules = [...schedules]
    newSchedules[index] = updated
    onChange(newSchedules)
  }

  return (
    <div className="gap-spacing-4xs flex w-full flex-col">
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
        className="bg-fill-selected-orange rounded-xs py-spacing-4xs font-label3-medium text-label-primary w-full cursor-pointer text-center"
      >
        + 일정 추가
      </button>
    </div>
  )
}
