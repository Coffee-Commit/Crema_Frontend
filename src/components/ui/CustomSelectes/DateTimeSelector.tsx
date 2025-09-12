// 'use client'

// // import { Calendar, Clock } from 'lucide-react'
// import { useState } from 'react'

// const TIMES = Array.from({ length: 48 }, (_, i) => {
//   const hour = String(Math.floor(i / 2)).padStart(2, '0')
//   const minute = i % 2 === 0 ? '00' : '30'
//   return `${hour}:${minute}`
// })

// export default function DateTimeSelector() {
//   const [selectedDate, setSelectedDate] = useState('')
//   const [selectedTime, setSelectedTime] = useState('')

//   return (
//     <div className="gap-spacing-3xs flex">
//       {/* 날짜 선택 */}
//       <label className="font-caption2-medium border-border-subtle text-label-default rounded-2xs p-spacing-4xs flex h-[42px] w-[168px] items-center border">
//         {/* <Calendar className="stroke-label-default h-4 w-4" /> */}
//         <input
//           type="date"
//           value={selectedDate}
//           onChange={(e) => setSelectedDate(e.target.value)}
//           className="font-caption2-medium text-label-default w-full bg-transparent"
//         />
//       </label>

//       {/* 시간 선택 */}
//       <label className="font-caption2-medium border-border-subtle text-label-default rounded-2xs p-spacing-4xs flex h-[42px] w-[168px] items-center border">
//         {/* <Clock className="stroke-label-secondary h-4 w-4" /> */}
//         <select
//           value={selectedTime}
//           onChange={(e) => setSelectedTime(e.target.value)}
//           className="text-label-secondary w-full bg-transparent text-sm"
//         >
//           <option value="">시간 선택</option>
//           {TIMES.map((t) => (
//             <option
//               key={t}
//               value={t}
//             >
//               {t}
//             </option>
//           ))}
//         </select>
//       </label>
//     </div>
//   )
// }

'use client'

import { Dispatch, SetStateAction } from 'react'

const TIMES = Array.from({ length: 48 }, (_, i) => {
  const hour = String(Math.floor(i / 2)).padStart(2, '0')
  const minute = i % 2 === 0 ? '00' : '30'
  return `${hour}:${minute}`
})

interface DateTimeSelectorProps {
  selectedDate: string
  setSelectedDate: Dispatch<SetStateAction<string>>
  selectedTime: string
  setSelectedTime: Dispatch<SetStateAction<string>>
}

export default function DateTimeSelector({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
}: DateTimeSelectorProps) {
  return (
    <div className="gap-spacing-3xs flex">
      {/* 날짜 선택 */}
      <label className="font-caption2-medium border-border-subtle text-label-default rounded-2xs p-spacing-4xs flex h-[42px] w-[168px] items-center border">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="font-caption2-medium text-label-default w-full bg-transparent"
        />
      </label>

      {/* 시간 선택 */}
      <label className="font-caption2-medium border-border-subtle text-label-default rounded-2xs p-spacing-4xs flex h-[42px] w-[168px] items-center border">
        <select
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="text-label-secondary w-full bg-transparent text-sm"
        >
          <option value="">시간 선택</option>
          {TIMES.map((t) => (
            <option
              key={t}
              value={t}
            >
              {t}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
