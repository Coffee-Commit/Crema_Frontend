// 'use client'

// import clsx from 'clsx'
// import { EllipsisVertical } from 'lucide-react'

// interface StatusCardProps {
//   label: string
//   count: number
//   onClick?: () => void
// }

// export default function StatusCard({
//   label,
//   count,
//   onClick,
// }: StatusCardProps) {
//   return (
//     <div
//       role={onClick ? 'button' : undefined}
//       tabIndex={onClick ? 0 : -1}
//       onClick={onClick}
//       onKeyDown={(e) => {
//         if (!onClick) return
//         if (e.key === 'Enter' || e.key === ' ') {
//           e.preventDefault()
//           onClick()
//         }
//       }}
//       className={clsx(
//         'gap-spacing-xs p-spacing-2xs shadow-emphasize group relative',
//         'flex cursor-pointer flex-col justify-center rounded-sm',
//         'transition-colors duration-150',
//         'hover:bg-fill-selected-orange w-full',
//       )}
//     >
//       <EllipsisVertical
//         className={clsx(
//           'right-spacing-2xs top-spacing-2xs absolute',
//           'opacity-0 transition-opacity duration-150',
//           'group-hover:opacity-100',
//           'text-label-default',
//         )}
//         size={24}
//         strokeWidth={2}
//         aria-hidden
//       />

//       <span className="py-spacing-5xs px-spacing-4xs font-title4 text-fill-white bg-fill-primary flex w-fit rounded-full">
//         {label}
//       </span>
//       <span className="font-title2-bold text-label-strong">
//         {count}건
//       </span>
//     </div>
//   )
// }

'use client'

import clsx from 'clsx'
import { EllipsisVertical } from 'lucide-react'

interface StatusCardProps {
  label: string
  count: number
  onClick?: () => void
}

export default function StatusCard({
  label,
  count,
  onClick,
}: StatusCardProps) {
  // label별 상태 분기
  const isPending = label.includes('대기')
  const isScheduled = label.includes('예정')
  const isDone = label.includes('완료')

  // 클릭 가능 여부
  const isClickable = isPending

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : -1}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={(e) => {
        if (!isClickable || !onClick) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className={clsx(
        'gap-spacing-xs p-spacing-2xs shadow-emphasize relative',
        'bg-fill-selected-orange flex w-full flex-col justify-center rounded-sm transition-colors duration-150',
        isClickable
          ? 'hover:bg-fill-tooltip-orange cursor-pointer'
          : 'bg-fill-white cursor-default', // 클릭 불가 시 스타일
      )}
    >
      {/* 대기중일 때만 아이콘 항상 표시 */}
      {isPending && (
        <EllipsisVertical
          className="right-spacing-2xs top-spacing-2xs text-label-default absolute"
          size={24}
          strokeWidth={2}
          aria-hidden
        />
      )}

      {/* 라벨 */}
      <span
        className={clsx(
          'py-spacing-5xs px-spacing-4xs font-title4 flex w-fit rounded-full',
          isPending && 'bg-fill-primary text-fill-white',
          isScheduled && 'bg-fill-primary text-fill-white',
          isDone &&
            'bg-fill-white text-label-primary border-border-primary border',
        )}
      >
        {label}
      </span>

      {/* 카운트 */}
      <span className="font-title2-bold text-label-strong">
        {count}건
      </span>
    </div>
  )
}
