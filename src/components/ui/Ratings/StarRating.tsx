// 'use client'

// interface StarRatingProps {
//   rating: number
//   max?: number
//   size?: number
// }

// export default function StarRating({
//   rating,
//   max = 5,
//   size = 20,
// }: StarRatingProps) {
//   return (
//     <div className="flex items-center gap-1">
//       {Array.from({ length: max }, (_, i) => {
//         const diff = rating - i
//         const full = diff >= 1
//         const half = diff > 0 && diff < 1

//         return (
//           <div
//             key={i}
//             className="relative"
//             style={{ width: size, height: size }}
//           >
//             {/* 기본 빈 별 */}
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth={2}
//               className="text-label-subtler"
//               width={size}
//               height={size}
//             >
//               <path d="M11.48 3.499l2.125 5.111 5.518.442-4.204 3.602 1.285 5.385-4.725-2.885-4.725 2.885 1.285-5.385-4.204-3.602 5.518-.442z" />
//             </svg>

//             {/* 꽉 찬 별 */}
//             {full && (
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//                 fill="currentColor"
//                 className="text-label-primary absolute left-0 top-0"
//                 width={size}
//                 height={size}
//               >
//                 <path d="M11.48 3.499l2.125 5.111 5.518.442-4.204 3.602 1.285 5.385-4.725-2.885-4.725 2.885 1.285-5.385-4.204-3.602 5.518-.442z" />
//               </svg>
//             )}

//             {/* 반쪽 별 */}
//             {half && (
//               <div
//                 className="text-label-primary absolute left-0 top-0 overflow-hidden"
//                 style={{ width: size / 2, height: size }}
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   viewBox="0 0 24 24"
//                   fill="currentColor"
//                   width={size}
//                   height={size}
//                 >
//                   <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.497.04.698.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0l-4.725 2.885a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L2.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L10.48 3.5z" />
//                 </svg>
//               </div>
//             )}
//           </div>
//         )
//       })}
//       <span className="font-caption2-bold text-label-default ml-1">
//         {rating.toFixed(1)}
//       </span>
//     </div>
//   )
// }

'use client'

import { useState } from 'react'

interface StarRatingProps {
  rating: number
  max?: number
  size?: number
  readOnly?: boolean
  onChange?: (val: number) => void
}

export default function StarRating({
  rating,
  max = 5,
  size = 20,
  readOnly = true,
  onChange,
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  // ✅ rating이 없거나 0일 경우
  if ((!rating || rating <= 0) && readOnly) {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: max }, (_, i) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="text-label-subtler"
            width={size}
            height={size}
          >
            <path d="M11.48 3.499l2.125 5.111 5.518.442-4.204 3.602 1.285 5.385-4.725-2.885-4.725 2.885 1.285-5.385-4.204-3.602 5.518-.442z" />
          </svg>
        ))}
        <span className="font-caption2-bold text-label-subtle ml-1">
          0.0
        </span>
      </div>
    )
  }

  // 표시할 별 개수 → hover 중일 때는 hover 값 사용
  const displayRating = hovered !== null ? hovered : rating

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => {
        const index = i + 1
        const diff = displayRating - i
        const full = diff >= 1
        const half = diff > 0 && diff < 1

        return (
          <div
            key={i}
            className="relative cursor-pointer"
            style={{ width: size, height: size }}
            onMouseEnter={() => !readOnly && setHovered(index)}
            onMouseLeave={() => !readOnly && setHovered(null)}
            onClick={() => !readOnly && onChange?.(index)}
          >
            {/* 기본 빈 별 */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="text-label-primary"
              width={size}
              height={size}
            >
              <path d="M11.48 3.499l2.125 5.111 5.518.442-4.204 3.602 1.285 5.385-4.725-2.885-4.725 2.885 1.285-5.385-4.204-3.602 5.518-.442z" />
            </svg>

            {/* 꽉 찬 별 */}
            {full && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-label-primary absolute left-0 top-0"
                width={size}
                height={size}
              >
                <path d="M11.48 3.499l2.125 5.111 5.518.442-4.204 3.602 1.285 5.385-4.725-2.885-4.725 2.885 1.285-5.385-4.204-3.602 5.518-.442z" />
              </svg>
            )}

            {/* 반쪽 별 */}
            {half && (
              <div
                className="text-label-primary absolute left-0 top-0 overflow-hidden"
                style={{ width: size / 2, height: size }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width={size}
                  height={size}
                >
                  <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.497.04.698.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0l-4.725 2.885a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L2.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L10.48 3.5z" />
                </svg>
              </div>
            )}
          </div>
        )
      })}
      <span className="font-caption2-bold text-label-default ml-1">
        {displayRating.toFixed(1)}
      </span>
    </div>
  )
}
