'use client'

import { useMemo, useRef, useState } from 'react'

import ModalStandbyStatus from '@/components/common/ModalStandbyStatus'

import ScheduleTable from '../../_components/Cards/ScheduleTable'
import StatusCard from '../../_components/Cards/StatusCard'

type ChatStatus = 'pending' | 'accepted' | 'rejected'
type Chat = {
  id: string
  nickname: string
  appliedAt: string
  preferredDate: string
  preferredTime: string
  profileImageUrl?: string | null
  status: ChatStatus
}

function parseStartEnd(
  preferredDate: string,
  preferredTime: string,
): { start: Date | null; end: Date | null } {
  try {
    const datePart = preferredDate.replace(/\s*\(.+\)\s*$/, '').trim()
    const [yy, mm, dd] = datePart.split('.').map((s) => s.trim())
    const year = 2000 + Number(yy)
    const month = Number(mm) - 1
    const day = Number(dd)

    const [rawStart, rawEnd] = preferredTime
      .split('~')
      .map((s) => s.trim())
    const [sh, sm] = rawStart.split(':').map(Number)
    const [eh, em] = rawEnd.split(':').map(Number)

    const start = new Date(year, month, day, sh, sm, 0, 0)
    const end = new Date(year, month, day, eh, em, 0, 0)
    if (isNaN(start.getTime()) || isNaN(end.getTime()))
      return { start: null, end: null }
    return { start, end }
  } catch {
    return { start: null, end: null }
  }
}

export default function DashboardPage() {
  /** ✅ 단일 소스 데이터 */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const chats: Chat[] = [
    {
      id: '1',
      nickname: '차듬박이',
      appliedAt: '25.09.15 오후 20:01',
      preferredDate: '25.09.26',
      preferredTime: '19:00~19:30',
      status: 'accepted',
    },
    {
      id: '2',
      nickname: '아메리카노',
      appliedAt: '25.09.16 오후 18:00',
      preferredDate: '25.09.28',
      preferredTime: '20:00~20:30',
      status: 'rejected',
    },
    {
      id: '3',
      nickname: '나루토마키',
      appliedAt: '25.09.06 오후 18:00',
      preferredDate: '25.09.06',
      preferredTime: '23:00~23:30',
      status: 'pending',
    },
    {
      id: '4',
      nickname: '카푸치노',
      appliedAt: '25.08.20 오후 13:40',
      preferredDate: '25.08.30',
      preferredTime: '18:30~19:00',
      status: 'accepted',
    },
    {
      id: '5',
      nickname: '스타벅스',
      appliedAt: '25.08.20 오후 13:40',
      preferredDate: '25.09.06',
      preferredTime: '15:52~19:00',
      status: 'accepted',
    },
    {
      id: '6',
      nickname: '스타벅스2',
      appliedAt: '25.08.20 오후 13:40',
      preferredDate: '25.09.06',
      preferredTime: '18:52~23:00',
      status: 'accepted',
    },
    {
      id: '7',
      nickname: '스타벅스3',
      appliedAt: '25.08.20 오후 13:40',
      preferredDate: '25.09.06',
      preferredTime: '20:52~23:30',
      status: 'accepted',
    },
    {
      id: '8',
      nickname: '스타벅스4',
      appliedAt: '25.08.20 오후 13:40',
      preferredDate: '25.09.06',
      preferredTime: '21:52~23:30',
      status: 'accepted',
    },
  ]

  /** 📌 now를 렌더 시점으로 고정 */
  const nowRef = useRef(new Date())

  /** 그룹 분류 */
  const group = useMemo(() => {
    const now = nowRef.current

    const pending = chats.filter(
      (c) => c.status === 'pending' || c.status === 'rejected',
    )

    const accepted = chats.filter((c) => c.status === 'accepted')
    const withEnd = accepted.map((c) => ({
      c,
      end: parseStartEnd(c.preferredDate, c.preferredTime).end,
    }))

    const scheduled = withEnd
      .filter(({ end }) => end && end > now)
      .map(({ c }) => c)
    const done = withEnd
      .filter(({ end }) => end && end <= now)
      .map(({ c }) => c)

    return { pending, scheduled, done }
  }, [chats])

  /** 현황 카드 */
  const statusData = [
    {
      key: 'pending',
      label: '대기 중인 커피챗',
      count: group.pending.length,
    },
    {
      key: 'scheduled',
      label: '예정된 커피챗',
      count: group.scheduled.length,
    },
    { key: 'done', label: '완료된 커피챗', count: group.done.length },
  ] as const

  /** 일정 섹션: select = 전체/예정/완료 */
  const [scheduleFilter, setScheduleFilter] = useState<
    'all' | 'scheduled' | 'done'
  >('all')

  const scheduleData = useMemo(() => {
    const now = nowRef.current

    const accepted = chats.filter((c) => c.status === 'accepted')
    const withEnd = accepted.map((c) => ({
      c,
      end: parseStartEnd(c.preferredDate, c.preferredTime).end,
    }))

    const future = withEnd
      .filter(({ end }) => end && end > now)
      .map(({ c }) => c)
    const past = withEnd
      .filter(({ end }) => end && end <= now)
      .map(({ c }) => c)

    const source =
      scheduleFilter === 'all'
        ? [...future, ...past]
        : scheduleFilter === 'scheduled'
          ? future
          : past

    return source.map((c) => ({
      id: c.id,
      nickname: c.nickname,
      date: c.preferredDate.replace(/\s*\(.+\)\s*$/, ''),
      time: c.preferredTime,
      // 전체: 과거는 disabled, 예정/완료 필터에서는 고정값
      isActive:
        scheduleFilter === 'all'
          ? (parseStartEnd(c.preferredDate, c.preferredTime).end ??
              now) > now
          : scheduleFilter === 'scheduled'
            ? true
            : false,
      // 입장 버튼 활성: 시작 5분 전 ~ 종료까지
      canJoin: (() => {
        const { start, end } = parseStartEnd(
          c.preferredDate,
          c.preferredTime,
        )
        if (!start || !end) return false
        const openAt = new Date(start.getTime() - 5 * 60 * 1000)
        return now >= openAt && now <= end
      })(),
    }))
  }, [scheduleFilter, chats])

  /** 모달 상태 */
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalKey, setModalKey] = useState<
    'pending' | 'scheduled' | 'done'
  >('pending')

  const openModal = (
    key: 'pending' | 'scheduled' | 'done',
    label: string,
  ) => {
    setModalKey(key)
    setModalTitle(label)
    setIsModalOpen(true)
  }

  /** 모달 applicants */
  const applicants = useMemo(() => {
    const source =
      modalKey === 'pending'
        ? group.pending
        : modalKey === 'scheduled'
          ? group.scheduled
          : group.done

    return source.map((c, idx) => ({
      id: `${c.id}-${idx}`,
      nickname: c.nickname,
      appliedAt: c.appliedAt,
      preferredDate: c.preferredDate,
      preferredTime: c.preferredTime,
      profileImageUrl: c.profileImageUrl ?? '',
      status: c.status as 'pending' | 'accepted' | 'rejected',
    }))
  }, [modalKey, group])

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
              key={s.key}
              label={s.label}
              count={s.count}
              onClick={() => openModal(s.key, s.label)}
            />
          ))}
        </div>
      </section>

      {/* 일정 */}
      <section>
        <div className="mb-spacing-3xl flex items-center justify-between">
          <div className="gap-spacing-2xs">
            <h2 className="font-heading2 text-label-strong">
              커피챗 일정
            </h2>
            <select
              value={scheduleFilter}
              onChange={(e) =>
                setScheduleFilter(
                  e.target.value as 'all' | 'scheduled' | 'done',
                )
              }
              className="border-border-subtler font-body3 text-label-default px-spacing-3xs rounded-md border py-[2px]"
            >
              <option value="all">전체</option>
              <option value="scheduled">예정</option>
              <option value="done">완료</option>
            </select>
          </div>
          <div>커피챗 진행</div>
        </div>
        <ScheduleTable
          items={scheduleData}
          onEnter={(id) => {
            // 옵션 A: 페이지가 입장 후 Quick-Join 수행
            window.location.href = `/coffeechat/${id}`
          }}
        />
      </section>

      {/* 상태 라벨 모달 */}
      <ModalStandbyStatus
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        applicants={applicants}
        title={modalTitle}
      />
    </div>
  )
}
