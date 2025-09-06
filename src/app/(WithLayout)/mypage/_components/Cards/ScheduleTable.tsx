'use client'

import clsx from 'clsx'

export type ScheduleItem = {
  id: string
  nickname: string
  date: string
  time: string
  isActive: boolean // 전체(all)일 때 과거는 false로 내려옴
  canJoin: boolean // 시작 5분 전 ~ 종료까지 true
}

export default function ScheduleTable({
  items,
  onEnter,
}: {
  items: ScheduleItem[]
  onEnter?: (id: string) => void
}) {
  return (
    <table className="w-full table-fixed border-collapse text-left">
      <colgroup>
        <col className="w-[30%]" />
        <col className="w-[25%]" />
        <col className="w-[25%]" />
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
        {items.map((item) => {
          const disabledRow = !item.isActive
          const canJoin = item.canJoin && item.isActive

          return (
            <tr
              key={item.id}
              className={clsx('h-14', disabledRow && 'opacity-50')}
            >
              <td className="px-spacing-5xs">
                <span className="font-body3 text-label-default">
                  {item.nickname}
                </span>
              </td>
              <td className="px-spacing-5xs">
                <span className="font-body3 text-label-default">
                  {item.date}
                </span>
              </td>
              <td className="px-spacing-5xs">
                <span className="font-body3 text-label-default">
                  {item.time}
                </span>
              </td>
              <td className="px-spacing-5xs text-right">
                <button
                  type="button"
                  disabled={!canJoin}
                  onClick={() => canJoin && onEnter?.(item.id)}
                  className={clsx(
                    'rounded-2xs px-spacing-3xs font-label4-semibold py-[6px]',
                    canJoin
                      ? 'bg-fill-selected-orange text-label-deep hover:brightness-95'
                      : 'bg-fill-disabled text-label-subtle cursor-not-allowed',
                  )}
                >
                  커피챗 입장하기
                </button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
