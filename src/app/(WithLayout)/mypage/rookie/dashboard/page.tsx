'use client'

import { useMemo, useRef, useState, useEffect } from 'react'

import ModalRespondedStatus from '@/components/common/ModalRespondedStatus'
import {
  getMemberCoffeeChats,
  MemberCoffeeChat,
} from '@/lib/http/coffeechat'

import ScheduleTable from '../../_components/Cards/ScheduleTable'
import StatusCard from '../../_components/Cards/StatusCard'

function parseStartEnd(date: string, timeRange: string) {
  try {
    const [sh, sm] = timeRange.split('~')[0].split(':').map(Number)
    const [eh, em] = timeRange.split('~')[1].split(':').map(Number)
    const [y, m, d] = date.split('-').map(Number)

    const start = new Date(y, m - 1, d, sh, sm, 0, 0)
    const end = new Date(y, m - 1, d, eh, em, 0, 0)
    if (isNaN(start.getTime()) || isNaN(end.getTime()))
      return { start: null, end: null }
    return { start, end }
  } catch {
    return { start: null, end: null }
  }
}

export default function DashboardPage() {
  const [chats, setChats] = useState<MemberCoffeeChat[]>([])
  const nowRef = useRef(new Date())

  /** ✅ API 호출 */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMemberCoffeeChats()
        setChats(data)
        console.log(data)
      } catch (err) {
        console.error('❌ 커피챗 조회 실패:', err)
      }
    }
    fetchData()
  }, [])

  /** 그룹 분류 */
  const group = useMemo(() => {
    const now = nowRef.current
    const pending = chats.filter((c) => c.status === 'PENDING')
    const confirmed = chats.filter((c) => c.status === 'CONFIRMED')

    const withEnd = confirmed.map((c) => ({
      c,
      end: parseStartEnd(c.preferredDateOnly, c.preferredTimeRange)
        .end,
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

  /** 드롭다운 필터 */
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

    // 🔥 PENDING + CONFIRMED 둘 다 표시
    const withEnd = chats
      .filter(
        (c) => c.status === 'PENDING' || c.status === 'CONFIRMED',
      )
      .map((c) => ({
        c,
        end: parseStartEnd(c.preferredDateOnly, c.preferredTimeRange)
          .end,
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

    return source.map((c) => {
      const { start, end } = parseStartEnd(
        c.preferredDateOnly,
        c.preferredTimeRange,
      )
      const openAt = start
        ? new Date(start.getTime() - 5 * 60 * 1000)
        : null
      const canJoin =
        c.status === 'CONFIRMED' && start && end
          ? now >= openAt! && now <= end
          : false

      return {
        id: String(c.reservationId),
        nickname: c.guide.nickname,
        avatarUrl: c.guide.profileImageUrl ?? '',
        date: `${c.preferredDateOnly} (${c.preferredDayOfWeek})`,
        time: c.preferredTimeRange,
        isActive: end ? end > now : false,
        canJoin,
      }
    })
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
      id: `${c.reservationId}-${idx}`,
      nickname: c.guide.nickname,
      appliedAt: c.createdAt,
      preferredDate: c.preferredDateOnly,
      preferredTime: c.preferredTimeRange,
      profileImageUrl: c.guide.profileImageUrl ?? '',
      status:
        c.status === 'PENDING'
          ? '대기중'
          : c.status === 'CONFIRMED'
            ? '확정됨'
            : c.status === 'COMPLETED'
              ? '완료됨'
              : '취소됨',
    }))
  }, [modalKey, group])

  return (
    <div className="flex w-full flex-col gap-[100px]">
      {/* 현황 */}
      <section>
        <h2 className="font-heading2 mb-spacing-3xl text-label-strong items-center">
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
        <div className="mb-spacing-3xl relative flex items-center justify-between">
          <div className="gap-spacing-2xs flex flex-row items-center">
            <h2 className="font-heading2 text-label-strong">
              커피챗 일정
            </h2>

            {/* ✅ 드롭다운 원래 UI 복원 */}
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
                        className={`gap-spacing-2xs rounded-2xs px-spacing-4xs py-spacing-5xs font-label4-medium text-label-deep mb-spacing-5xs hover:bg-fill-selected-orange flex w-full cursor-pointer items-center ${
                          isActive ? 'bg-fill-selected-orange' : ''
                        }`}
                      >
                        <span
                          className={`h-[6px] w-[6px] rounded-full ${isActive ? 'bg-fill-primary' : 'bg-fill-light'}`}
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
          items={scheduleData} // ✅ API 데이터 연동
          onEnter={(id) => {
            // 커피챗 입장
            window.location.href = `/coffeechat/${id}`
          }}
          onMaterials={(id) => {
            // 사전자료 보기 (예시)
            window.location.href = `/coffeechat/${id}/materials`
          }}
        />
      </section>

      {/* 상태 라벨 모달 */}
      <ModalRespondedStatus
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        applicants={applicants}
        title={modalTitle}
      />
    </div>
  )
}
