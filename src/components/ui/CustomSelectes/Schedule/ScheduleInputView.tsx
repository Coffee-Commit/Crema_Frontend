'use client'

import ScheduleSelector, { Schedule } from './ScheduleSelector'

interface ScheduleInputViewProps {
  schedules: Schedule[]
}

export default function ScheduleInputView({
  schedules,
}: ScheduleInputViewProps) {
  if (!schedules || schedules.length === 0) {
    return (
      <div className="text-label-tertiary font-body3 py-6 text-center">
        등록된 일정이 없습니다.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {schedules.map((schedule, idx) => (
        <ScheduleSelector
          key={idx}
          schedule={schedule}
          readOnly
        />
      ))}
    </div>
  )
}
