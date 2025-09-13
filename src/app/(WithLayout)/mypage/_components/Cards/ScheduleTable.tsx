'use client'

import clsx from 'clsx'
import { CalendarDays, Clock, Coffee } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

import Pagination from '@/components/ui/Paginations/Pagination'

export type ScheduleItem = {
  id: string
  nickname: string
  date: string
  time: string
  isActive: boolean
  canJoin: boolean
  avatarUrl?: string
}

export default function ScheduleTable({
  items,
  onEnter,
  onMaterials,
  pageSize = 5,
}: {
  items: ScheduleItem[]
  onEnter?: (id: string) => void
  onMaterials?: (id: string) => void
  pageSize?: number
}) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page, pageSize])

  return (
    <div className="w-full">
      <div
        role="list"
        className="gap-spacing-2xs flex flex-col"
      >
        {pagedItems.length === 0 && (
          <div className="py-spacing-md flex flex-col items-center justify-center gap-4">
            <Image
              src="/images/emptyState.png"
              alt="일정 없음"
              width={248}
              height={248}
              className="object-contain"
            />
            <span className="font-body3 text-label-subtle text-center">
              표시할 일정이 없습니다.
            </span>
          </div>
        )}

        {pagedItems.map((item) => {
          const disabledRow = !item.isActive
          const canJoin = item.canJoin && item.isActive

          return (
            <div
              role="listitem"
              key={item.id}
              className={clsx(
                'h-18 w-full items-center',
                'gap-spacing-md',
                'flex',
                'flex-row',
                'px-spacing-3xs',
                'py-spacing-5xs',
                'rounded-sm border',
                disabledRow
                  ? 'bg-fill-input-gray border-border-subtler'
                  : 'bg-fill-white border-border-subtler',
              )}
            >
              {/* 프로필/닉네임 */}
              <div className="gap-spacing-xs flex w-[30%] min-w-0 items-center">
                <span
                  className={clsx(
                    'bg-fill-subtle inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
                    canJoin &&
                      'ring-fill-primary ring-offset-bg ring-2 ring-offset-2',
                  )}
                >
                  {item.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.avatarUrl}
                      alt=""
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="bg-fill-disabled h-12 w-12 rounded-full" />
                  )}
                </span>
                <span
                  className={clsx(
                    'font-label4-semibold truncate',
                    disabledRow
                      ? 'text-label-subtler'
                      : 'text-label-subtle',
                  )}
                >
                  {item.nickname}
                </span>
              </div>

              {/* 날짜 */}
              <div className="gap-spacing-5xs flex w-[20%] items-center">
                <CalendarDays
                  className={clsx(
                    'h-3 w-3',
                    disabledRow
                      ? 'text-label-subtle'
                      : 'text-label-default',
                  )}
                />
                <span className="font-caption3 text-label-default">
                  {item.date}
                </span>
              </div>

              {/* 시간 */}
              <div className="gap-spacing-5xs flex w-[15%] items-center">
                <Clock
                  className={clsx(
                    'h-3 w-3',
                    disabledRow
                      ? 'text-label-subtle'
                      : 'text-label-default',
                  )}
                />
                <span className="font-caption3 text-label-default">
                  {item.time}
                </span>
              </div>

              {/* 액션 */}
              <div className="gap-spacing-2xs flex w-[40%] items-center justify-end">
                <button
                  type="button"
                  disabled={!canJoin}
                  onClick={() => canJoin && onEnter?.(item.id)}
                  className={clsx(
                    'gap-spacing-6xs rounded-2xs px-spacing-2xs font-label4-semibold inline-flex items-center py-[13px]',
                    canJoin
                      ? 'bg-fill-primary text-fill-white cursor-pointer hover:brightness-95'
                      : 'bg-fill-disabled text-label-subtle cursor-not-allowed',
                  )}
                >
                  커피챗 입장하기
                  <Coffee className="h-4.5 w-4.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onMaterials?.(item.id)}
                  className={clsx(
                    'rounded-2xs px-spacing-2xs font-label4-semibold inline-flex items-center py-[13px]',
                    disabledRow
                      ? 'bg-fill-disabled text-label-subtle cursor-not-allowed'
                      : 'border-border-primary text-label-primary hover:bg-fill-primary hover:text-label-white cursor-pointer border',
                  )}
                >
                  사전자료
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-spacing-md flex w-full">
          <Pagination
            key={`p-${totalPages}-${page}`}
            total={totalPages}
            initialPage={page}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
