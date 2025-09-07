'use client'

import clsx from 'clsx'
import { CalendarDays, Clock, Coffee, FileText } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import Pagination from '@/components/ui/Paginations/Pagination' // ✅ 네가 준 컴포넌트 경로

export type ScheduleItem = {
  id: string
  nickname: string
  date: string // 예: '25.08.26'
  time: string // 예: '19:00~19:30'
  isActive: boolean // 전체(all)일 때 과거는 false로 내려옴
  canJoin: boolean // 시작 5분 전 ~ 종료까지 true
  avatarUrl?: string // 없으면 기본 회색 원
}

export default function ScheduleTable({
  items,
  onEnter,
  onMaterials, // 사전자료
  pageSize = 5, // ✅ 기본 5개/페이지
}: {
  items: ScheduleItem[]
  onEnter?: (id: string) => void
  onMaterials?: (id: string) => void
  pageSize?: number
}) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const [page, setPage] = useState(1)

  // 아이템 개수가 줄어서 현재 페이지가 범위를 벗어났을 때 보정
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page, pageSize])

  return (
    <div className="w-full">
      <table className="w-full table-fixed border-collapse text-left">
        <colgroup>
          <col className="w-[40%]" />
          <col className="w-[20%]" />
          <col className="w-[20%]" />
          <col className="w-[20%]" />
        </colgroup>

        <thead className="bg-fill-default">
          <tr className="h-12">
            <th className="px-spacing-5xs font-label4-semibold text-label-strong">
              닉네임
            </th>
            <th className="px-spacing-5xs font-label4-semibold text-label-strong">
              날짜
            </th>
            <th className="px-spacing-5xs font-label4-semibold text-label-strong">
              시간
            </th>
            <th className="px-spacing-5xs font-label4-semibold text-label-strong text-right">
              액션
            </th>
          </tr>
        </thead>

        <tbody className="[&>tr]:border-border-subtler [&>tr]:border-t">
          {pagedItems.map((item) => {
            const disabledRow = !item.isActive
            const canJoin = item.canJoin && item.isActive

            return (
              <tr
                key={item.id}
                className={clsx(
                  'h-16 transition-colors',
                  disabledRow ? 'bg-fill-muted' : 'bg-bg',
                )}
              >
                {/* 닉네임 + 아바타 */}
                <td className="px-spacing-5xs">
                  <div className="gap-spacing-4xs flex items-center">
                    {/* 아바타 */}
                    <span
                      className={clsx(
                        'bg-fill-subtle inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                        canJoin &&
                          'ring-fill-selected-orange ring-offset-bg ring-2 ring-offset-2',
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
                        <span className="bg-fill-disabled h-8 w-8 rounded-full" />
                      )}
                    </span>

                    <span
                      className={clsx(
                        'font-body3',
                        disabledRow
                          ? 'text-label-subtle'
                          : 'text-label-default',
                      )}
                    >
                      {item.nickname}
                    </span>
                  </div>
                </td>

                {/* 날짜 */}
                <td className="px-spacing-5xs">
                  <div className="gap-spacing-5xs flex items-center">
                    <CalendarDays
                      className={clsx(
                        'h-4 w-4',
                        disabledRow
                          ? 'text-label-subtle'
                          : 'text-label-default',
                      )}
                    />
                    <span className="font-body3 text-label-default">
                      {item.date}
                    </span>
                  </div>
                </td>

                {/* 시간 */}
                <td className="px-spacing-5xs">
                  <div className="gap-spacing-5xs flex items-center">
                    <Clock
                      className={clsx(
                        'h-4 w-4',
                        disabledRow
                          ? 'text-label-subtle'
                          : 'text-label-default',
                      )}
                    />
                    <span className="font-body3 text-label-default">
                      {item.time}
                    </span>
                  </div>
                </td>

                {/* 액션 */}
                <td className="px-spacing-5xs">
                  <div className="gap-spacing-4xs flex items-center justify-end">
                    {/* 커피챗 입장하기 */}
                    <button
                      type="button"
                      disabled={!canJoin}
                      onClick={() => canJoin && onEnter?.(item.id)}
                      className={clsx(
                        'gap-spacing-6xs rounded-2xs px-spacing-2xs font-label4-semibold inline-flex items-center py-[10px]',
                        canJoin
                          ? 'bg-fill-selected-orange text-label-deep hover:brightness-95'
                          : 'bg-fill-disabled text-label-subtle cursor-not-allowed',
                      )}
                    >
                      <Coffee className="h-4 w-4" />
                      커피챗 입장하기
                    </button>

                    {/* 사전자료 (항상 활성) */}
                    <button
                      type="button"
                      onClick={() => onMaterials?.(item.id)}
                      className={clsx(
                        'gap-spacing-6xs rounded-2xs px-spacing-2xs font-label4-semibold inline-flex items-center border py-[10px]',
                        disabledRow
                          ? 'border-border-subtle text-label-subtle hover:bg-fill-muted/60'
                          : 'border-border-default text-label-default hover:bg-fill-muted',
                      )}
                    >
                      <FileText className="h-4 w-4" />
                      사전자료
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}

          {/* 데이터 없을 때 */}
          {pagedItems.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="py-spacing-md font-body3 text-label-subtle text-center"
              >
                표시할 일정이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="mt-spacing-md flex w-full">
          <Pagination
            key={`p-${totalPages}-${page}`} // ← 내부 current 동기화를 위해 리마운트
            total={totalPages} // 총 "페이지 수"
            initialPage={page} // 부모가 잡고 있는 현재 페이지
            onChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
