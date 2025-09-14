// 'use client'

// import { CalendarDays, Clock } from 'lucide-react'
// import Image from 'next/image'
// import { useState } from 'react'

// import SquareButton from '@/components/ui/Buttons/SquareButton'
// import TextAreaCounter from '@/components/ui/Inputs/TextAreaCounter'
// import StarRating from '@/components/ui/Ratings/StarRating'
// import api from '@/lib/http/api'

// interface ReviewEditableCardProps {
//   reservationId: number
//   avatarUrl?: string | null
//   nickname: string
//   date: string
//   time: string
//   duration: string
//   rating: number
//   review: string
//   onSaved?: () => void // 저장 후 새로고침 콜백
// }

// export default function ReviewEditableCard({
//   reservationId,
//   avatarUrl,
//   nickname,
//   date,
//   time,
//   duration,
//   rating,
//   review,
//   onSaved,
// }: ReviewEditableCardProps) {
//   const [isEditing, setIsEditing] = useState(false)
//   const [newRating, setNewRating] = useState(rating)
//   const [newReview, setNewReview] = useState(review)

//   const handleSave = async () => {
//     try {
//       const payload = {
//         reservationId,
//         starReview: newRating,
//         comment: newReview,
//         experienceEvaluations: [], // 👈 경험 평가가 있다면 여기에 push
//       }

//       console.log('📌 리뷰 저장 요청:', payload)

//       const res = await api.post('/api/reviews', payload)

//       console.log('✅ 리뷰 저장 성공:', res.data)
//       setIsEditing(false)
//       onSaved?.()
//     } catch (err) {
//       console.error('❌ 리뷰 저장 실패:', err)
//       alert('리뷰 저장에 실패했습니다.')
//     }
//   }

//   return (
//     <div className="bg-fill-white border-border-subtler rounded-sm border">
//       {/* 상단 영역 */}
//       <div className="p-spacing-3xs flex items-center justify-between">
//         <div className="gap-spacing-sm flex items-center">
//           {/* 프로필 */}
//           <Image
//             src={avatarUrl || '/images/default-profile.png'}
//             alt="profile"
//             width={48}
//             height={48}
//             className="rounded-full object-cover"
//           />

//           {/* 닉네임 + 날짜/시간 */}
//           <div className="gap-spacing-xl flex flex-row items-center">
//             <span className="font-label4-semibold text-label-subtle min-w-[100px]">
//               {nickname}
//             </span>
//             <div className="gap-spacing-7xl font-caption text-label-default flex min-w-[430px] items-center">
//               <div className="flex items-center gap-1">
//                 <CalendarDays className="h-3 w-3" />
//                 {date}
//               </div>
//               <div className="flex items-center gap-1">
//                 <Clock className="h-3 w-3" />
//                 {time} ({duration})
//               </div>
//             </div>
//           </div>
//         </div>
//         <SquareButton
//           variant={isEditing ? 'tertiary' : 'primary'}
//           size="sm"
//           onClick={() =>
//             isEditing ? handleSave() : setIsEditing(true)
//           }
//         >
//           {isEditing ? '저장' : review ? '편집' : '작성'}
//         </SquareButton>
//       </div>

//       {/* 본문 영역 */}
//       {isEditing && (
//         <div className="p-spacing-sm gap-spacing-sm bg-fill-footer-gray flex flex-col">
//           <StarRating
//             rating={newRating}
//             readOnly={false}
//             onChange={(val) => setNewRating(val)}
//           />
//           <TextAreaCounter
//             maxLength={500}
//             value={newReview}
//             onChange={(val) => setNewReview(val)}
//             placeholder="리뷰를 작성해주세요. (최소 10자 이상, 최대 500자)"
//             className="bg-transparent"
//           />
//         </div>
//       )}
//     </div>
//   )
// }

// 목업 버전
'use client'

import { CalendarDays, Clock } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import SquareButton from '@/components/ui/Buttons/SquareButton'
import TextAreaCounter from '@/components/ui/Inputs/TextAreaCounter'
import StarRating from '@/components/ui/Ratings/StarRating'
import api from '@/lib/http/api'

interface ReviewEditableCardProps {
  reservationId: number
  avatarUrl?: string | null
  nickname: string
  date: string
  time: string
  duration: string
  rating: number
  review: string
  onSaved?: () => void // 저장 후 새로고침 콜백
}

export default function ReviewEditableCard({
  reservationId,
  avatarUrl,
  nickname,
  date,
  time,
  duration,
  rating,
  review,
  onSaved,
}: ReviewEditableCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newRating, setNewRating] = useState(rating)
  const [newReview, setNewReview] = useState(review)

  const handleSave = async () => {
    try {
      const payload = {
        reservationId,
        starReview: newRating,
        comment: newReview,
        experienceEvaluations: [], // 👈 경험 평가가 있다면 여기에 push
      }

      console.log('📌 리뷰 저장 요청:', payload)

      const res = await api.post('/api/reviews', payload)

      console.log('✅ 리뷰 저장 성공:', res.data)
      setIsEditing(false)
      onSaved?.()
    } catch (err) {
      console.error('❌ 리뷰 저장 실패:', err)
      // alert('리뷰 저장에 실패했습니다.')
    }
  }

  return (
    <div className="bg-fill-white border-border-subtler rounded-sm border">
      {/* 상단 영역 */}
      <div className="p-spacing-3xs flex items-center justify-between">
        <div className="gap-spacing-sm flex items-center">
          {/* 프로필 */}
          <Image
            src={avatarUrl || '/images/profileMypage.png'}
            alt="profile"
            width={48}
            height={48}
            className="rounded-full object-cover"
          />

          {/* 닉네임 + 날짜/시간 */}
          <div className="gap-spacing-xl flex flex-row items-center">
            <span className="font-label4-semibold text-label-subtle min-w-[100px]">
              {nickname}
            </span>
            <div className="gap-spacing-7xl font-caption text-label-default flex min-w-[430px] items-center">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {date}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {time} ({duration})
              </div>
            </div>
          </div>
        </div>
        <SquareButton
          variant={isEditing ? 'tertiary' : 'primary'}
          size="sm"
          onClick={() =>
            isEditing ? handleSave() : setIsEditing(true)
          }
        >
          {isEditing ? '저장' : review ? '편집' : '작성'}
        </SquareButton>
      </div>

      {/* 본문 영역 */}
      {isEditing && (
        <div className="p-spacing-sm gap-spacing-sm bg-fill-footer-gray flex flex-col">
          <StarRating
            rating={newRating}
            readOnly={false}
            onChange={(val) => setNewRating(val)}
          />
          <TextAreaCounter
            maxLength={500}
            value={newReview}
            onChange={(val) => setNewReview(val)}
            placeholder="리뷰를 작성해주세요. (최소 10자 이상, 최대 500자)"
            className="bg-transparent"
          />
        </div>
      )}
    </div>
  )
}
