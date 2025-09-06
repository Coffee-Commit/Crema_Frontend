'use client'

import { useMemo, useState } from 'react'

import ModalRespondedStatus from '@/components/common/ModalRespondedStatus' // ✅ 오타 주의!
import ScheduleTable from '../../_components/Cards/ScheduleTable'
import StatusCard from '../../_components/Cards/StatusCard'

type ChatStatus = 'pending' | 'accepted' | 'rejected'
type Chat = {
  id: string
  nickname: string
  appliedAt: string
  preferredDate: string // 예: '25.09.26 (화)'
  preferredTime: string // 예: '19:00~19:30'
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
  /** ✅ 단일 소스 데이터 (디자인/마크업 안 바꿈) */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const chats: Chat[] = [
    {
      id: '1',
      nickname: '차듬박이',
      appliedAt: '25.09.15 오후 20:01',
      preferredDate: '25.09.26 (화)',
      preferredTime: '19:00~19:30',
      status: 'accepted',
    },
    {
      id: '2',
      nickname: '아메리카노',
      appliedAt: '25.09.16 오후 18:00',
      preferredDate: '25.09.28 (목)',
      preferredTime: '20:00~20:30',
      status: 'rejected',
    },
    {
      id: '3',
      nickname: '나루토마키',
      appliedAt: '25.09.06 오후 18:00',
      preferredDate: '25.09.06 (목)',
      preferredTime: '23:00~23:30',
      status: 'pending',
    },
    {
      id: '4',
      nickname: '카푸치노',
      appliedAt: '25.08.20 오후 13:40',
      preferredDate: '25.08.30 (토)',
      preferredTime: '18:30~19:00',
      status: 'accepted',
    },
    {
      id: '5',
      nickname: '스타벅스',
      appliedAt: '25.08.20 오후 13:40',
      preferredDate: '25.09.06 (토)',
      preferredTime: '15:52~19:00',
      status: 'accepted',
    },
  ]

  const now = new Date()

  /** 그룹 분류 (요구사항 그대로)
   * - 대기: pending, rejected
   * - 예정: accepted & (끝시각 > now)
   * - 완료: accepted & (끝시각 <= now)
   */
  const group = useMemo(() => {
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
  }, [chats, now])

  /** 현황 카드 (디자인/클래스 변경 없음) */
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

  /** 일정 섹션: select = 전체/예정/완료 (디자인 유지) */
  const [scheduleFilter, setScheduleFilter] = useState<
    'all' | 'scheduled' | 'done'
  >('all')

  const scheduleData = useMemo(() => {
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
  }, [scheduleFilter, chats, now])

  /** ✅ 모달 상태 */
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalKey, setModalKey] = useState<
    'pending' | 'scheduled' | 'done'
  >('pending')

  /** 카드 클릭 → 모달 띄우기 (디자인/클래스는 그대로) */
  const openModal = (
    key: 'pending' | 'scheduled' | 'done',
    label: string,
  ) => {
    setModalKey(key)
    setModalTitle(label)
    setIsModalOpen(true)
  }

  /** 모달에 넘길 applicants: 모달은 “상태 텍스트만” 보여주는 버전 사용 */
  const applicants = useMemo(() => {
    const source =
      modalKey === 'pending'
        ? group.pending
        : modalKey === 'scheduled'
          ? group.scheduled
          : group.done

    return source.map((c, idx) => ({
      // key 중복 방지용으로 idx 가미 (실서버에선 id 고유 보장될 수도 있음)
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
      {/* 현황 (디자인 동일) */}
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
              onClick={() => openModal(s.key, s.label)} // ✅ 클릭 시 모달 오픈
            />
          ))}
        </div>
      </section>

      {/* 일정 (디자인 동일) */}
      <section>
        <div className="mb-spacing-3xl flex items-center justify-between">
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
        <ScheduleTable
          items={scheduleData}
          onEnter={(id) => {
            // TODO: 커피챗 방으로 이동 (디자인/마크업 손대지 않음)
            console.log('enter coffee chat:', id)
          }}
        />
      </section>

      {/* ✅ 상태 라벨만 보여주는 모달 (디자인 그대로) */}
      <ModalRespondedStatus
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        applicants={applicants}
        title={modalTitle}
      />
    </div>
  )
}
