'use client'

import ScheduleTable from '../../_components/Cards/ScheduleTable'
import StatusCard from '../../_components/Cards/StatusCard'

export default function DashboardPage() {
  const statusData = [
    { label: '대기 중인 커피챗', count: 5, active: true },
    { label: '예정된 커피챗', count: 0 },
    { label: '완료된 커피챗', count: 0 },
  ]

  const scheduleData = [
    {
      id: '1',
      nickname: '커피챗진행할후배이름',
      date: '25.08.26',
      time: '19:00~19:30',
      isActive: true,
    },
    {
      id: '2',
      nickname: '얼굴자닉네임까지가능',
      date: '25.08.30',
      time: '19:00~19:30',
      isActive: false,
    },
    {
      id: '3',
      nickname: '얼굴자닉네임까지가능',
      date: '25.08.20',
      time: '19:00~19:30',
      isActive: false,
    },
  ]

  return (
    <div className="gap-spacing-2xl flex flex-col">
      {/* 현황 */}
      <section>
        <h2 className="font-title3 mb-spacing-md text-label-deep">
          커피챗 현황
        </h2>
        <div className="gap-spacing-md flex">
          {statusData.map((s) => (
            <StatusCard
              key={s.label}
              label={s.label}
              count={s.count}
              active={s.active}
            />
          ))}
        </div>
      </section>

      {/* 일정 */}
      <section>
        <div className="mb-spacing-md flex items-center justify-between">
          <h2 className="font-title3 text-label-deep">커피챗 일정</h2>
          <select className="border-border-subtler font-body3 text-label-default px-spacing-3xs rounded-md border py-[2px]">
            <option value="all">전체</option>
            <option value="waiting">대기 중</option>
            <option value="done">완료</option>
          </select>
        </div>
        <ScheduleTable items={scheduleData} />
      </section>
    </div>
  )
}
