// 'use client'

// import clsx from 'clsx'
// import Image from 'next/image'

// import ProgressBar from '../Ratings/ProgressBar'

// interface ExperienceItem {
//   label: string
//   progress: number
//   iconSrc?: string
// }

// interface DetailedExperienceCardProps {
//   title: string
//   items: ExperienceItem[]
//   className?: string
// }

// export default function DetailedExperienceCard({
//   title,
//   items,
//   className,
// }: DetailedExperienceCardProps) {
//   return (
//     <div
//       className={clsx(
//         'p-spacing-xs gap-spacing-xs shadow-card bg-fill-white flex flex-col rounded-sm',
//         className,
//       )}
//     >
//       <h3 className="font-title4 text-label-primary px-spacing-4xs py-spacing-5xs w-fit rounded-full border">
//         {title}
//       </h3>

//       {/* 리스트 박스 */}
//       <div className="bg-fill-input-gray p-spacing-2xs gap-spacing-2xs grid grid-cols-1 rounded-md md:grid-cols-2">
//         {items.map((item, i) => (
//           <div
//             key={i}
//             className="gap-spacing-sm flex items-center"
//           >
//             {/* 아이콘 + 라벨 */}
//             <div className="flex-1">
//               <div className="mb-spacing-5xs flex items-center gap-2">
//                 {item.iconSrc && (
//                   <Image
//                     src={item.iconSrc}
//                     alt="icon"
//                     width={16}
//                     height={16}
//                   />
//                 )}
//                 <span className="font-body3 text-label-strong">
//                   {item.label}
//                 </span>
//               </div>

//               {/* 프로그레스바 + 퍼센트 */}
//               <div className="flex items-center gap-2">
//                 <ProgressBar progress={item.progress} />
//                 <span className="font-caption3 text-label-subtler">
//                   {item.progress}%
//                 </span>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

'use client'

import clsx from 'clsx'

import ProgressBar from '../Ratings/ProgressBar'

interface ExperienceItem {
  label: string
  progress: number
  iconSrc?: string
}

interface DetailedExperienceCardProps {
  title: string
  items: ExperienceItem[]
  className?: string
  emptyMessage?: string
}

export default function DetailedExperienceCard({
  title,
  items,
  className,
  emptyMessage = '첫 커피챗을 기다리고 있어요',
}: DetailedExperienceCardProps) {
  return (
    <div
      className={clsx(
        'p-spacing-xs gap-spacing-xs shadow-emphasize bg-fill-white flex w-full flex-col rounded-sm',
        className,
      )}
    >
      <h3 className="font-title4 text-label-primary px-spacing-4xs py-spacing-5xs w-fit rounded-full border">
        {title}
      </h3>

      {/* 리스트 박스 */}
      <div className="bg-fill-input-gray p-spacing-4xs gap-spacing-2xs rounded-xs grid grid-cols-1 md:grid-cols-2">
        {items.length === 0 ? (
          <div className="py-spacing-md col-span-2 flex h-[160px] items-center justify-center">
            <span className="font-caption2-medium text-label-default">
              {emptyMessage}
            </span>
          </div>
        ) : (
          items.map((item, i) => (
            <div
              key={i}
              className="gap-spacing-sm flex items-center"
            >
              {/* 아이콘 + 라벨 */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-caption3 text-label-default">
                    {item.label}
                  </span>
                </div>

                {/* 프로그레스바 + 퍼센트 */}
                <div className="flex items-center gap-2">
                  <ProgressBar progress={item.progress} />
                  <span className="font-caption3 text-label-subtler">
                    {item.progress}%
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
