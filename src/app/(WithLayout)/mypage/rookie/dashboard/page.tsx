'use client'

import { useState } from 'react'

import ModalStandbyStatus from '@/components/common/ModalStandbyStatus'

import ScheduleTable from '../../_components/Cards/ScheduleTable'
import StatusCard from '../../_components/Cards/StatusCard'

export default function DashboardPage() {
  const statusData = [
    { label: '대기 중인 커피챗', count: 5 },
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

  // 대기 목록 원본
  const standbyData = [
    {
      id: '1',
      nickname: '차듬박이',
      applyDate: '25.08.15 오후 20:01',
      hopeDate: '25.08.26 (화)',
      hopeTime: '19:00~19:30',
    },
    {
      id: '2',
      nickname: '아메리카노',
      applyDate: '25.08.16 오후 18:00',
      hopeDate: '25.08.28 (목)',
      hopeTime: '20:00~20:30',
    },
  ]

  // 모달에 맞게 변환
  const applicants = standbyData.map((item) => ({
    id: item.id,
    nickname: item.nickname,
    appliedAt: item.applyDate,
    preferredDate: item.hopeDate,
    preferredTime: item.hopeTime,
    // profileImageUrl: '' // 있으면 추가
  }))

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')

  const openStandbyModal = (label: string) => {
    setModalTitle(label)
    setIsModalOpen(true)
  }

  return (
    <div className="flex w-full flex-col gap-[100px]">
      {/* 현황 */}
      <section>
        <h2 className="font-heading2 mb-spacing-3xl text-label-strong">
          커피챗 현황
        </h2>
        <div className="gap-spacing-xs flex">
          {statusData.map((s) => (
            <StatusCard
              key={s.label}
              label={s.label}
              count={s.count}
              onClick={
                s.label === '대기 중인 커피챗'
                  ? () => openStandbyModal(s.label)
                  : undefined
              }
            />
          ))}
        </div>
      </section>

      {/* 일정 */}
      <section>
        <div className="mb-spacing-3xl flex items-center justify-between">
          <h2 className="font-heading2 text-label-strong">
            커피챗 일정
          </h2>
          <select className="border-border-subtler font-body3 text-label-default px-spacing-3xs rounded-md border py-[2px]">
            <option value="all">전체</option>
            <option value="waiting">대기 중</option>
            <option value="done">완료</option>
          </select>
        </div>
        <ScheduleTable items={scheduleData} />
      </section>

      {/* 대기중 모달 */}
      <ModalStandbyStatus
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        applicants={applicants}
        title={modalTitle}
      />
    </div>
  )
}
