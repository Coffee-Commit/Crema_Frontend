'use client'

import { useMemo, useRef, useState, useEffect } from 'react'

import ModalStandbyStatus, {
  Applicant,
} from '@/components/common/ModalStandbyStatus'
import api from '@/lib/http/api'

import GuideVisibilityToggle from './_components/CoffeeChatVisibleToggle'
import ScheduleTable from '../../_components/Cards/ScheduleTable'
import StatusCard from '../../_components/Cards/StatusCard'

type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'

type Reservation = {
  reservationId: number
  member: {
    nickname: string
    profileImageUrl: string | null
  }
  createdAt: string
  preferredDateOnly: string
  preferredTimeRange: string
  status: ReservationStatus
}

function parseStartEnd(date: string, timeRange: string) {
  try {
    const [sh, sm] = timeRange.split('~')[0].split(':').map(Number)
    const [eh, em] = timeRange.split('~')[1].split(':').map(Number)
    const [y, m, d] = date.split('-').map(Number) // ✅ YYYY-MM-DD 대응

    const start = new Date(y, m - 1, d, sh, sm, 0, 0)
    const end = new Date(y, m - 1, d, eh, em, 0, 0)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { start: null, end: null }
    }
    return { start, end }
  } catch {
    return { start: null, end: null }
  }
}

export default function DashboardPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const nowRef = useRef(new Date())

  /** ✅ API 호출 */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<{
          message: string
          data: { content: Reservation[] }
        }>(
          '/api/guides/me/reservations/all?page=0&size=20&sortBy=createdAt&direction=DESC',
        )
        setReservations(res.data.data.content)
        console.log('📌 가이드 예약 데이터:', res.data.data.content)
      } catch (err) {
        console.error('❌ 예약 데이터 불러오기 실패:', err)
      }
    }

    fetchData()
  }, [])

  /** 그룹 분류 */
  const group = useMemo(() => {
    const now = nowRef.current
    const pending = reservations.filter((r) => r.status === 'PENDING')

    const confirmedOrCompleted = reservations.filter(
      (r) => r.status === 'CONFIRMED' || r.status === 'COMPLETED',
    )

    const withEnd = confirmedOrCompleted.map((r) => ({
      r,
      end: parseStartEnd(r.preferredDateOnly, r.preferredTimeRange)
        .end,
    }))

    const scheduled = withEnd
      .filter(({ end }) => end && end > now)
      .map(({ r }) => r)

    const done = withEnd
      .filter(({ end }) => end && end <= now)
      .map(({ r }) => ({
        ...r,
        status: r.status === 'CONFIRMED' ? 'COMPLETED' : r.status,
      }))

    return { pending, scheduled, done }
  }, [reservations])

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

  /** 일정 필터 */
  const [scheduleFilter, setScheduleFilter] = useState<
    'all' | 'scheduled' | 'done'
  >('all')
  const labelMap = {
    all: '전체',
    scheduled: '예정',
    done: '완료',
  } as const

  const scheduleData = useMemo(() => {
    const now = nowRef.current

    // ✅ 모든 상태(PENDING, CONFIRMED, COMPLETED)를 포함
    const withEnd = reservations
      .filter(
        (r) =>
          r.status === 'PENDING' ||
          r.status === 'CONFIRMED' ||
          r.status === 'COMPLETED',
      )
      .map((r) => ({
        r,
        parsed: parseStartEnd(
          r.preferredDateOnly,
          r.preferredTimeRange,
        ),
      }))

    const future = withEnd
      .filter(({ parsed }) => parsed.end && parsed.end > now)
      .map(({ r }) => r)
    const past = withEnd
      .filter(({ parsed }) => parsed.end && parsed.end <= now)
      .map(({ r }) => r)

    const source =
      scheduleFilter === 'all'
        ? [...future, ...past]
        : scheduleFilter === 'scheduled'
          ? future
          : past

    return source.map((r) => {
      const { start, end } = parseStartEnd(
        r.preferredDateOnly,
        r.preferredTimeRange,
      )
      const openAt = start
        ? new Date(start.getTime() - 5 * 60 * 1000)
        : null
      const canJoin =
        r.status === 'CONFIRMED' && start && end
          ? now >= openAt! && now <= end
          : false

      return {
        id: String(r.reservationId),
        nickname: r.member.nickname,
        date: r.preferredDateOnly,
        time: r.preferredTimeRange,
        isActive: end ? end > now : false,
        canJoin,
        avatarUrl: r.member.profileImageUrl ?? undefined,
      }
    })
  }, [scheduleFilter, reservations])

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
  const applicants: Applicant[] = useMemo(() => {
    const source =
      modalKey === 'pending'
        ? group.pending
        : modalKey === 'scheduled'
          ? group.scheduled
          : group.done

    return source.map((r, idx) => ({
      id: String(r.reservationId ?? idx),
      nickname: r.member.nickname,
      appliedAt: r.createdAt,
      preferredDate: r.preferredDateOnly,
      preferredTime: r.preferredTimeRange,
      profileImageUrl: r.member.profileImageUrl ?? '',
      status: r.status,
    }))
  }, [modalKey, group])

  return (
    <div className="flex w-full flex-col gap-[100px]">
      {/* 현황 */}
      <section>
        <div className="flex w-full flex-row items-center justify-between">
          <h2 className="font-heading2 mb-spacing-3xl text-label-strong">
            커피챗 현황
          </h2>
          <GuideVisibilityToggle />
        </div>
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
        <div className="mb-spacing-3xl relative flex items-center justify-between">
          <div className="gap-spacing-2xs flex flex-row items-center">
            <h2 className="font-heading2 text-label-strong">
              커피챗 일정
            </h2>
            {/* 드롭다운 */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  const el = e.currentTarget
                    .nextSibling as HTMLElement
                  el?.classList.toggle('hidden')
                }}
                className="gap-spacing-4xs rounded-2xs px-spacing-4xs py-spacing-5xs font-label4-medium text-label-strong border-border-subtler bg-fill-white hover:bg-fill-muted inline-flex cursor-pointer items-center border"
              >
                <span
                  className={`h-[6px] w-[6px] rounded-full ${
                    scheduleFilter === 'scheduled'
                      ? 'bg-fill-primary'
                      : scheduleFilter === 'done'
                        ? 'bg-fill-light'
                        : 'bg-fill-light'
                  }`}
                />
                {labelMap[scheduleFilter]}
                <svg
                  className="ml-spacing-6xs text-label-default h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="mt-spacing-3xs rounded-2xs border-border-subtler bg-fill-white px-spacing-4xs py-spacing-5xs absolute left-0 z-20 hidden w-fit border">
                {(['all', 'scheduled', 'done'] as const).map(
                  (key) => {
                    const isActive = scheduleFilter === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={(e) => {
                          setScheduleFilter(key)
                          ;(
                            e.currentTarget
                              .parentElement as HTMLElement
                          )?.classList.add('hidden')
                        }}
                        className={`gap-spacing-2xs rounded-2xs px-spacing-4xs py-spacing-5xs font-label4-medium text-label-deep mb-spacing-5xs hover:bg-fill-selected-orange flex w-full cursor-pointer items-center ${isActive ? 'bg-fill-selected-orange' : ''} `}
                      >
                        <span
                          className={`h-[6px] w-[6px] rounded-full ${
                            isActive
                              ? 'bg-fill-primary'
                              : 'bg-fill-light'
                          }`}
                        />
                        <span>
                          {key === 'all'
                            ? '전체'
                            : key === 'scheduled'
                              ? '예정'
                              : '완료'}
                        </span>
                      </button>
                    )
                  },
                )}
              </div>
            </div>
          </div>
          <div className="group inline-flex items-center">
            <span className="mr-spacing-6xs inline-flex h-[6px] w-[6px] rounded-full bg-[#C9C9C9]" />
            <span className="font-label4-medium text-label-subtle cursor-pointer select-none">
              커피챗 진행 안내
            </span>

            {/* tooltip */}
            <div
              className="px-spacing-4xs py-spacing-5xs font-label4-semibold rounded-xs bg-fill-tooltip-orange text-label-strong pointer-events-none absolute bottom-[calc(100%+8px)] right-0 top-auto z-20 hidden w-fit text-left group-hover:block"
              role="tooltip"
            >
              <div className="gap-spacing-6xs flex flex-col">
                <span>
                  커피챗이 진행되는 당일에 해당 커피챗이 활성화
                  됩니다.
                </span>
                <span>
                  커피챗 시작 5분 전부터 버튼을 눌러 입장할 수
                  있습니다.
                </span>
              </div>

              <span
                className="absolute -bottom-[5px] right-4 h-0 w-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#E8A083]/80"
                aria-hidden
              />
            </div>
          </div>
        </div>

        <ScheduleTable
          items={scheduleData}
          onEnter={(id) => {
            window.location.href = `/VideoCoffeeChat/${id}`
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
