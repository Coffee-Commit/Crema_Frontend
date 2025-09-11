// 'use client'

// import { useState } from 'react'

// import SquareButton from '@/components/ui/Buttons/SquareButton'
// import SelectedChips from '@/components/ui/Chips/SelectedChips'
// import ScheduleInput from '@/components/ui/CustomSelectes/Schedule/ScheduleInput'
// import { Schedule } from '@/components/ui/CustomSelectes/Schedule/ScheduleSelector'
// import CategoryFilter from '@/components/ui/Filters/CategoryFilter'
// import JobFieldFilter from '@/components/ui/Filters/JobFieldFilter'

// // 경험 항목 타입
// interface Experience {
//   title: string
//   content: string
//   categories: string[]
// }

// export default function CoffeechatRegisterPage() {
//   // 단계 관리
//   const [step, setStep] = useState(1)

//   // Step 1 데이터
//   const [title, setTitle] = useState('')
//   const [jobFields, setJobFields] = useState<string[]>([])
//   const [topics] = useState<string[]>([])
//   const [schedules, setSchedules] = useState<Schedule[]>([])

//   // Step 2 데이터
//   const [experiences, setExperiences] = useState<Experience[]>([
//     { title: '', content: '', categories: [] },
//   ])
//   const [intro, setIntro] = useState('')
//   const [tags, setTags] = useState<string[]>(['', '', '', '', ''])

//   // ✅ Step2에서 경험 목록 추가
//   const addExperience = () => {
//     setExperiences([
//       ...experiences,
//       { title: '', content: '', categories: [] },
//     ])
//   }

//   // ✅ 경험 항목 업데이트
//   const updateExperience = (
//     index: number,
//     field: keyof Experience,
//     value: string | string[],
//   ) => {
//     const newExps = [...experiences]
//     newExps[index] = { ...newExps[index], [field]: value }
//     setExperiences(newExps)
//   }

//   // 최종 제출
//   const handleSubmit = () => {
//     const payload = {
//       title,
//       jobFields,
//       topics,
//       experiences,
//       intro,
//       tags,
//     }
//     console.log('📦 최종 폼 데이터:', payload)
//     alert('등록 완료!')
//   }

//   return (
//     <main className="gap-spacing-3xl py-spacing-5xl ml-[84px] flex flex-col">
//       {step === 1 && (
//         <>
//           <h2 className="font-heading2 text-label-strong">
//             커피챗 등록하기
//           </h2>
//           <section className="border-border-subtler bg-fill-white px-spacing-xs py-spacing-md flex flex-col gap-[80px] rounded-sm border">
//             {/* 커피챗 제목 */}
//             <div className="gap-spacing-sm flex flex-col">
//               <label className="font-title4 text-label-strong">
//                 커피챗 제목
//               </label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   value={title}
//                   onChange={(e) => setTitle(e.target.value)}
//                   maxLength={70}
//                   placeholder="토론할 수 있는 커피챗 제목을 입력해주세요."
//                   className="border-border-subtler bg-fill-white p-spacing-3xs font-caption2-medium text-label-default placeholder:text-label-subtler rounded-2xs focus:ring-label-primary w-full border focus:outline-none focus:ring-1"
//                 />
//                 <span className="text-label-subtler right-spacing-3xs font-caption2-medium absolute top-1/2 -translate-y-1/2 text-right">
//                   {title.length}/70
//                 </span>
//               </div>
//             </div>

//             {/* 커피챗 분야 */}
//             <div className="gap-spacing-sm flex flex-col">
//               <label className="font-title4 text-label-strong">
//                 커피챗 분야
//               </label>
//               <div className="flex flex-col gap-[20px]">
//                 <SelectedChips
//                   selected={jobFields}
//                   onRemove={(val) =>
//                     setJobFields((prev) =>
//                       prev.filter((f) => f !== val),
//                     )
//                   }
//                 />
//                 <JobFieldFilter
//                   selected={jobFields}
//                   onChange={setJobFields}
//                 />
//               </div>
//             </div>

//             {/* 커피챗 주제 */}
//             <div className="gap-spacing-sm flex w-fit flex-col">
//               <div className="gap-spacing-2xs flex flex-col">
//                 <label className="font-title4 text-label-strong">
//                   커피챗 신청 받을 일정을 선택해주세요.
//                 </label>
//                 <p className="font-caption2-medium text-label-subtle">
//                   일정을 추가하고 싶다면 활동 일정을 추가해주세요.
//                 </p>
//               </div>
//               <ScheduleInput
//                 schedules={schedules}
//                 onChange={setSchedules}
//               />
//             </div>

//             <div className="flex justify-end">
//               <SquareButton
//                 variant="primary"
//                 size="lg"
//                 onClick={() => setStep(2)}
//               >
//                 다음으로
//               </SquareButton>
//             </div>
//           </section>
//         </>
//       )}

//       {step === 2 && (
//         <>
//           <h2 className="font-heading2 text-label-strong">
//             커피챗 등록하기
//           </h2>
//           <section className="border-border-subtler bg-fill-white px-spacing-xs py-spacing-md flex flex-col gap-[80px] rounded-sm border">
//             <div className="gap-spacing-sm w-fulll flex flex-col">
//               <label className="font-title4 text-label-strong">
//                 이 커피챗은 어떤 분께 도움이 될까요?
//               </label>
//               <ul className="gap-pacing-4xs flex flex-col">
//                 <li className="gap-spacing-4xs relative flex flex-row">
//                   <label className="rounded-2xs font-label4-medium text-label-default border-border-subtle bg-fill-input-gray flex h-[50px] w-[50px] items-center justify-center border text-center">
//                     대상
//                   </label>
//                   <input
//                     type="text"
//                     value={title}
//                     onChange={(e) => setTitle(e.target.value)}
//                     maxLength={40}
//                     placeholder="도움을 줄 수 있는 대상에 대해 작성해주세요."
//                     className="border-border-subtler bg-fill-white p-spacing-3xs font-caption2-medium text-label-default placeholder:text-label-subtler rounded-2xs focus:ring-label-primary w-full border focus:outline-none focus:ring-1"
//                   />
//                   <span className="text-label-subtler right-spacing-3xs font-caption2-medium absolute top-1/2 -translate-y-1/2 text-right">
//                     {title.length}/40
//                   </span>
//                 </li>
//               </ul>
//               <ul className="gap-pacing-4xs flex flex-col">
//                 <li className="gap-spacing-4xs relative flex flex-row">
//                   <label className="rounded-2xs font-label4-medium text-label-default border-border-subtle bg-fill-input-gray flex h-[50px] w-[50px] items-center justify-center border text-center">
//                     상황
//                   </label>
//                   <input
//                     type="text"
//                     value={title}
//                     onChange={(e) => setTitle(e.target.value)}
//                     maxLength={40}
//                     placeholder="어떤 상황에 도움이 될 수 있을지 작성해주세요"
//                     className="border-border-subtler bg-fill-white p-spacing-3xs font-caption2-medium text-label-default placeholder:text-label-subtler rounded-2xs focus:ring-label-primary w-full border focus:outline-none focus:ring-1"
//                   />
//                   <span className="text-label-subtler right-spacing-3xs font-caption2-medium absolute top-1/2 -translate-y-1/2 text-right">
//                     {title.length}/40
//                   </span>
//                 </li>
//               </ul>
//               <ul className="gap-pacing-4xs flex flex-col">
//                 <li className="gap-spacing-4xs relative flex flex-row">
//                   <label className="rounded-2xs font-label4-medium text-label-default border-border-subtle bg-fill-input-gray flex h-[50px] w-[50px] items-center justify-center border text-center">
//                     내용
//                   </label>
//                   <input
//                     type="text"
//                     value={title}
//                     onChange={(e) => setTitle(e.target.value)}
//                     maxLength={40}
//                     placeholder="어떤 내용의 도움을 줄 수 있을지에 대해 작성해주세요."
//                     className="border-border-subtler bg-fill-white p-spacing-3xs font-caption2-medium text-label-default placeholder:text-label-subtler rounded-2xs focus:ring-label-primary w-full border focus:outline-none focus:ring-1"
//                   />
//                   <span className="text-label-subtler right-spacing-3xs font-caption2-medium absolute top-1/2 -translate-y-1/2 text-right">
//                     {title.length}/40
//                   </span>
//                 </li>
//               </ul>
//             </div>

//             {/* 경험 목록 */}
//             <div className="gap-spacing-sm flex w-full flex-col">
//               <label className="font-title4 text-label-strong">
//                 후배에게 나누실 경험 목록을 작성해주세요.
//               </label>
//               {experiences.map((exp, idx) => (
//                 <div
//                   key={idx}
//                   className="p-spacing-3xs gap-spacing-sm rounded-xs bg-fill-footer-gray relative flex flex-col"
//                 >
//                   {/* 삭제 버튼 (한 개 이상일 때만 노출) */}
//                   {experiences.length > 1 && (
//                     <button
//                       type="button"
//                       onClick={() =>
//                         setExperiences((prev) =>
//                           prev.filter((_, i) => i !== idx),
//                         )
//                       }
//                       className="text-label-subtlecursor-pointer right-spacing-3xs absolute top-2"
//                     >
//                       ✕
//                     </button>
//                   )}

//                   {/* 경험 제목 */}
//                   <div className="gap-spacing-4xs relative flex flex-col">
//                     <label className="font-label4-medium text-label-deep">
//                       경험 제목
//                     </label>
//                     <input
//                       type="text"
//                       value={exp.title}
//                       onChange={(e) =>
//                         updateExperience(idx, 'title', e.target.value)
//                       }
//                       maxLength={40}
//                       placeholder="경험의 제목을 작성해주세요. (예: N사 최종 합격)"
//                       className="border-border-subtler bg-fill-white px-spacing-3xs py-spacing-4xs font-caption2-medium text-label-default placeholder:text-label-subtle rounded-2xs focus:ring-label-primary w-full border focus:outline-none focus:ring-1"
//                     />
//                     <span className="text-label-subtle right-spacing-3xs absolute bottom-0.5 -translate-y-1/2 text-right text-sm">
//                       {exp.title.length}/40
//                     </span>
//                   </div>

//                   {/* 경험 내용 */}
//                   <div className="gap-spacing-4xs relative flex flex-col">
//                     <label className="font-label4-medium text-label-deep">
//                       경험 내용
//                     </label>
//                     <textarea
//                       value={exp.content}
//                       onChange={(e) =>
//                         updateExperience(
//                           idx,
//                           'content',
//                           e.target.value,
//                         )
//                       }
//                       maxLength={60}
//                       placeholder="경험에 대해 간단하게 설명하는 글을 작성해주세요.(예: 면접에 10번 이상 떨어졌지만 칠전팔기 끝에 최종 합격했어요)"
//                       className="border-border-subtler bg-fill-white px-spacing-3xs py-spacing-4xs font-caption2-medium text-label-default placeholder:text-label-subtle rounded-2xs focus:ring-label-primary min-h-[102px] w-full border focus:outline-none focus:ring-1"
//                     />
//                     <span className="text-label-subtle right-spacing-3xs bottom-spacing-4xs absolute text-right text-sm">
//                       {exp.content.length}/60
//                     </span>
//                   </div>

//                   {/* 주제 분류 */}
//                   <div className="gap-spacing-4xs flex flex-col">
//                     <label>주제분류</label>
//                     <CategoryFilter
//                       selected={exp.categories}
//                       onChange={(vals) =>
//                         updateExperience(idx, 'categories', vals)
//                       }
//                     />
//                   </div>
//                 </div>
//               ))}
//               {/* 경험 추가 버튼 */}
//               <button
//                 onClick={addExperience}
//                 className="bg-fill-selected-orange rounded-xs py-spacing-4xs font-label3-medium text-label-primary w-full cursor-pointer text-center"
//               >
//                 + 경험 목록 추가
//               </button>
//             </div>

//             {/* 커피챗 소개 */}
//             <div className="gap-spacing-sm relative flex flex-col">
//               <label className="font-title4 text-label-strong">
//                 커피챗 소개글
//               </label>
//               <textarea
//                 value={intro}
//                 onChange={(e) => setIntro(e.target.value)}
//                 maxLength={500}
//                 placeholder="본인의 경험과 커피챗에 대해 소개하는 글을 작성해주세요."
//                 className="border-border-subtler bg-fill-white p-spacing-2xs font-body3 text-label-default placeholder:text-label-subtle rounded-2xs focus:ring-label-primary min-h-[162px] w-full border focus:outline-none focus:ring-1"
//               />
//               <span className="text-label-subtle right-spacing-3xs bottom-spacing-4xs absolute text-right text-sm">
//                 {intro.length}/500
//               </span>
//             </div>

//             {/* 태그 */}
//             <div className="gap-spacing-md flex w-fit flex-col">
//               <div className="gap-spacing-2xs flex flex-col">
//                 <label className="font-title4 text-label-strong">
//                   프로필 카드에 노출될 경험 태그를 작성해주세요. (최대
//                   5개)
//                 </label>
//                 <p className="font-caption2-medium text-label-subtle">
//                   태그당 글자 수는 8자 이하로 제한됩니다.
//                 </p>
//               </div>
//               <div className="gap-spacing-xs grid grid-cols-3">
//                 {tags.map((tag, idx) => (
//                   <div
//                     key={idx}
//                     className="border-border-subtler bg-fill-white p-spacing-4xs rounded-2xs gap-spacing-5xs flex items-center border"
//                   >
//                     <span className="text-label-subtle text-center">
//                       #
//                     </span>
//                     <input
//                       type="text"
//                       value={tag}
//                       onChange={(e) => {
//                         const newTags = [...tags]
//                         newTags[idx] = e.target.value
//                         setTags(newTags)
//                       }}
//                       maxLength={8}
//                       placeholder="태그 입력"
//                       className="font-caption2-medium text-label-default placeholder:text-label-subtle flex-1 bg-transparent focus:outline-none"
//                     />
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="flex justify-between">
//               <SquareButton
//                 variant="secondary"
//                 size="lg"
//                 onClick={() => setStep(1)}
//               >
//                 이전
//               </SquareButton>
//               <SquareButton
//                 variant="primary"
//                 size="lg"
//                 onClick={handleSubmit}
//               >
//                 등록하기
//               </SquareButton>
//             </div>
//           </section>
//         </>
//       )}
//     </main>
//   )
// }

'use client'

import { useState } from 'react'

import SquareButton from '@/components/ui/Buttons/SquareButton'
import SelectedChips from '@/components/ui/Chips/SelectedChips'
import ScheduleInput from '@/components/ui/CustomSelectes/Schedule/ScheduleInput'
import { Schedule } from '@/components/ui/CustomSelectes/Schedule/ScheduleSelector'
import CategoryFilter from '@/components/ui/Filters/CategoryFilter'
import JobFieldFilter from '@/components/ui/Filters/JobFieldFilter'
import api from '@/lib/http/api'
import { useAuthStore } from '@/store/useAuthStore'

// 경험 항목 타입
interface Experience {
  title: string
  content: string
  categories: string[]
}

// 요일 변환
const convertDayToEnum = (day: string) => {
  switch (day) {
    case '월':
      return 'MONDAY'
    case '화':
      return 'TUESDAY'
    case '수':
      return 'WEDNESDAY'
    case '목':
      return 'THURSDAY'
    case '금':
      return 'FRIDAY'
    case '토':
      return 'SATURDAY'
    case '일':
      return 'SUNDAY'
    default:
      return 'MONDAY' // fallback
  }
}

export default function CoffeechatRegisterPage() {
  // 단계 관리
  const [step, setStep] = useState(1)

  // Step 1 데이터
  const [title, setTitle] = useState('')
  const [jobFields, setJobFields] = useState<string[]>([])
  // const [topics] = useState<string[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])

  // Step 2 데이터
  const [experiences, setExperiences] = useState<Experience[]>([
    { title: '', content: '', categories: [] },
  ])
  const [intro, setIntro] = useState('')
  const [tags, setTags] = useState<string[]>(['', '', '', '', ''])

  // ✅ 경험 상세 (who/solution/how)
  const [whoInput, setWhoInput] = useState('')
  const [solutionInput, setSolutionInput] = useState('')
  const [howInput, setHowInput] = useState('')

  // ✅ Step2에서 경험 목록 추가
  const addExperience = () => {
    setExperiences([
      ...experiences,
      { title: '', content: '', categories: [] },
    ])
  }

  // ✅ 경험 항목 업데이트
  const updateExperience = (
    index: number,
    field: keyof Experience,
    value: string | string[],
  ) => {
    const newExps = [...experiences]
    newExps[index] = { ...newExps[index], [field]: value }
    setExperiences(newExps)
  }

  // 최종 제출
  const handleSubmit = async () => {
    try {
      // 1) 커피챗 등록
      const chatRes = await api.post('/api/guides/me/coffeechat', {
        title,
        chatDescription: intro,
      })
      console.log('✅ 커피챗 등록 성공:', chatRes.data)
      // ✅ guideId 저장
      const newGuideId = chatRes.data?.data?.guide.id
      if (newGuideId) {
        const { setGuideId } = useAuthStore.getState()
        setGuideId(newGuideId)
        console.log('📌 guideId 저장 완료:', newGuideId)
      }

      // 2) 직무 분야 등록
      if (jobFields.length > 0) {
        await api.post('/api/guides/me/job-field', {
          jobName: jobFields[0],
        })
        console.log('✅ 직무 분야 등록 성공')
      }
      // 3) 스케줄 등록
      if (schedules.length > 0) {
        const schedulePayload = {
          schedules: schedules.map((s) => ({
            dayOfWeek: convertDayToEnum(s.days[0]), // ← key를 dayOfWeek로
            timeSlots: [
              { startTime: s.startTime, endTime: s.endTime },
            ],
          })),
        }

        await api.post('/api/guides/me/schedules', schedulePayload)
        console.log('✅ 스케줄 등록 성공')
      }
      // 4) 경험 상세 등록
      if (whoInput && solutionInput && howInput) {
        await api.post('/api/guides/me/experiences/details', {
          who: whoInput,
          solution: solutionInput,
          how: howInput,
        })
        console.log('✅ 경험 상세 등록 성공')
      }

      // 6) 해시태그 등록
      if (tags.some((t) => t.trim() !== '')) {
        // ✅ 빈 값 제거 + 중복 제거 + 최대 5개 제한
        const validTags = tags
          .map((t) => t.trim())
          .filter((t) => t !== '')
          .filter((t, i, arr) => arr.indexOf(t) === i) // 중복 제거
          .slice(0, 5)

        console.log('📌 최종 해시태그 payload:', validTags)

        if (validTags.length === 0) {
          alert('최소 1개 이상의 해시태그를 입력해주세요.')
          return
        }

        if (validTags.length > 5) {
          alert('해시태그는 최대 5개까지만 등록할 수 있습니다.')
          return
        }

        try {
          const tagRes = await api.post(
            '/api/guides/me/hashtags',
            validTags.map((t) => ({ hashTagName: t })),
          )
          console.log('✅ 해시태그 등록 성공:', tagRes.data)
        } catch (e) {
          console.error('❌ 해시태그 등록 실패:', e)
          alert('해시태그 등록 실패')
        }
      }

      // 5) 경험 목록 등록
      if (experiences.length > 0) {
        // ✅ 경험마다 주제 선택 여부 확인
        for (const exp of experiences) {
          if (!exp.categories[0]) {
            alert('경험마다 주제를 1개 이상 선택해야 합니다.')
            return
          }
        }
        const expPayload = {
          groups: experiences.map((exp) => ({
            guideChatTopicId: exp.categories[0], // ✅ ENUM 문자열 (한 개만)
            experienceTitle: exp.title,
            experienceContent: exp.content,
          })),
        }
        console.log('📌 경험 등록 payload:', expPayload)
        await api.post('/api/guides/me/experiences', expPayload)
        console.log('✅ 경험 목록 등록 성공')
      }

      alert('🎉 커피챗 등록 완료!')
    } catch (err) {
      console.error('❌ 등록 실패:', err)
      alert('등록 실패')
    }
  }
  // ================== UI (원본 그대로) ==================
  return (
    <main className="gap-spacing-3xl py-spacing-5xl ml-[84px] flex flex-col">
      {step === 1 && (
        <>
          <h2 className="font-heading2 text-label-strong">
            커피챗 등록하기
          </h2>
          <section className="border-border-subtler bg-fill-white px-spacing-xs py-spacing-md flex flex-col gap-[80px] rounded-sm border">
            {/* 커피챗 제목 */}
            <div className="gap-spacing-sm flex flex-col">
              <label className="font-title4 text-label-strong">
                커피챗 제목
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={70}
                  placeholder="토론할 수 있는 커피챗 제목을 입력해주세요."
                  className="border-border-subtler bg-fill-white p-spacing-3xs font-caption2-medium text-label-default placeholder:text-label-subtler rounded-2xs focus:ring-label-primary w-full border focus:outline-none focus:ring-1"
                />
                <span className="text-label-subtler right-spacing-3xs font-caption2-medium absolute top-1/2 -translate-y-1/2 text-right">
                  {title.length}/70
                </span>
              </div>
            </div>

            {/* 커피챗 분야 */}
            <div className="gap-spacing-sm flex flex-col">
              <label className="font-title4 text-label-strong">
                커피챗 분야
              </label>
              <div className="flex flex-col gap-[20px]">
                <SelectedChips
                  selected={jobFields}
                  onRemove={(val) =>
                    setJobFields((prev) =>
                      prev.filter((f) => f !== val),
                    )
                  }
                />
                <JobFieldFilter
                  selected={jobFields}
                  onChange={setJobFields}
                />
              </div>
            </div>

            {/* 커피챗 주제 */}
            <div className="gap-spacing-sm flex w-fit flex-col">
              <div className="gap-spacing-2xs flex flex-col">
                <label className="font-title4 text-label-strong">
                  커피챗 신청 받을 일정을 선택해주세요.
                </label>
                <p className="font-caption2-medium text-label-subtle">
                  일정을 추가하고 싶다면 활동 일정을 추가해주세요.
                </p>
              </div>
              <ScheduleInput
                schedules={schedules}
                onChange={setSchedules}
              />
            </div>

            <div className="flex justify-end">
              <SquareButton
                variant="primary"
                size="lg"
                onClick={() => setStep(2)}
              >
                다음으로
              </SquareButton>
            </div>
          </section>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="font-heading2 text-label-strong">
            커피챗 등록하기
          </h2>
          <section className="border-border-subtler bg-fill-white px-spacing-xs py-spacing-md flex flex-col gap-[80px] rounded-sm border">
            {/* 경험 소주제 */}
            <div className="gap-spacing-sm w-fulll flex flex-col">
              <label className="font-title4 text-label-strong">
                이 커피챗은 어떤 분께 도움이 될까요?
              </label>
              <ul className="gap-pacing-4xs flex flex-col">
                <li className="gap-spacing-4xs relative flex flex-row">
                  <label className="rounded-2xs font-label4-medium text-label-default border-border-subtle bg-fill-input-gray flex h-[50px] w-[50px] items-center justify-center border text-center">
                    대상
                  </label>
                  <input
                    type="text"
                    value={whoInput}
                    onChange={(e) => setWhoInput(e.target.value)}
                    maxLength={40}
                    placeholder="도움을 줄 수 있는 대상에 대해 작성해주세요."
                    className="border-border-subtler bg-fill-white p-spacing-3xs font-caption2-medium text-label-default placeholder:text-label-subtler rounded-2xs focus:ring-label-primary w-full border focus:outline-none focus:ring-1"
                  />
                </li>
              </ul>
              <ul className="gap-pacing-4xs flex flex-col">
                <li className="gap-spacing-4xs relative flex flex-row">
                  <label className="rounded-2xs font-label4-medium text-label-default border-border-subtle bg-fill-input-gray flex h-[50px] w-[50px] items-center justify-center border text-center">
                    상황
                  </label>
                  <input
                    type="text"
                    value={solutionInput}
                    onChange={(e) => setSolutionInput(e.target.value)}
                    maxLength={40}
                    placeholder="어떤 상황에 도움이 될 수 있을지 작성해주세요"
                    className="border-border-subtler bg-fill-white p-spacing-3xs font-caption2-medium text-label-default placeholder:text-label-subtler rounded-2xs focus:ring-label-primary w-full border focus:outline-none focus:ring-1"
                  />
                </li>
              </ul>
              <ul className="gap-pacing-4xs flex flex-col">
                <li className="gap-spacing-4xs relative flex flex-row">
                  <label className="rounded-2xs font-label4-medium text-label-default border-border-subtle bg-fill-input-gray flex h-[50px] w-[50px] items-center justify-center border text-center">
                    내용
                  </label>
                  <input
                    type="text"
                    value={howInput}
                    onChange={(e) => setHowInput(e.target.value)}
                    maxLength={40}
                    placeholder="어떤 내용의 도움을 줄 수 있을지에 대해 작성해주세요."
                    className="border-border-subtler bg-fill-white p-spacing-3xs font-caption2-medium text-label-default placeholder:text-label-subtler rounded-2xs focus:ring-label-primary w-full border focus:outline-none focus:ring-1"
                  />
                </li>
              </ul>
            </div>

            {/* 경험 목록 */}
            <div className="gap-spacing-sm flex w-full flex-col">
              <label className="font-title4 text-label-strong">
                후배에게 나누실 경험 목록을 작성해주세요.
              </label>
              {experiences.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-spacing-3xs gap-spacing-sm rounded-xs bg-fill-footer-gray relative flex flex-col"
                >
                  {/* 삭제 버튼 (한 개 이상일 때만 노출) */}
                  {experiences.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExperiences((prev) =>
                          prev.filter((_, i) => i !== idx),
                        )
                      }
                      className="text-label-subtlecursor-pointer right-spacing-3xs absolute top-2"
                    >
                      ✕
                    </button>
                  )}

                  {/* 경험 제목 */}
                  <div className="gap-spacing-4xs relative flex flex-col">
                    <label className="font-label4-medium text-label-deep">
                      경험 제목
                    </label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) =>
                        updateExperience(idx, 'title', e.target.value)
                      }
                      maxLength={40}
                      placeholder="경험의 제목을 작성해주세요. (예: N사 최종 합격)"
                      className="border-border-subtler bg-fill-white px-spacing-3xs py-spacing-4xs font-caption2-medium text-label-default placeholder:text-label-subtle rounded-2xs focus:ring-label-primary w-full border focus:outline-none focus:ring-1"
                    />
                    <span className="text-label-subtle right-spacing-3xs absolute bottom-0.5 -translate-y-1/2 text-right text-sm">
                      {exp.title.length}/40
                    </span>
                  </div>

                  {/* 경험 내용 */}
                  <div className="gap-spacing-4xs relative flex flex-col">
                    <label className="font-label4-medium text-label-deep">
                      경험 내용
                    </label>
                    <textarea
                      value={exp.content}
                      onChange={(e) =>
                        updateExperience(
                          idx,
                          'content',
                          e.target.value,
                        )
                      }
                      maxLength={60}
                      placeholder="경험에 대해 간단하게 설명하는 글을 작성해주세요.(예: 면접에 10번 이상 떨어졌지만 칠전팔기 끝에 최종 합격했어요)"
                      className="border-border-subtler bg-fill-white px-spacing-3xs py-spacing-4xs font-caption2-medium text-label-default placeholder:text-label-subtle rounded-2xs focus:ring-label-primary min-h-[102px] w-full border focus:outline-none focus:ring-1"
                    />
                    <span className="text-label-subtle right-spacing-3xs bottom-spacing-4xs absolute text-right text-sm">
                      {exp.content.length}/60
                    </span>
                  </div>

                  {/* 주제 분류 */}
                  <div className="gap-spacing-4xs flex flex-col">
                    <label>주제분류</label>
                    <CategoryFilter
                      selected={exp.categories}
                      onChange={(vals) =>
                        updateExperience(idx, 'categories', vals)
                      }
                    />
                  </div>
                </div>
              ))}
              {/* 경험 추가 버튼 */}
              <button
                onClick={addExperience}
                className="bg-fill-selected-orange rounded-xs py-spacing-4xs font-label3-medium text-label-primary w-full cursor-pointer text-center"
              >
                + 경험 목록 추가
              </button>
            </div>

            {/* 커피챗 소개 */}
            <div className="gap-spacing-sm relative flex flex-col">
              <label className="font-title4 text-label-strong">
                커피챗 소개글
              </label>
              <textarea
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                maxLength={500}
                placeholder="본인의 경험과 커피챗에 대해 소개하는 글을 작성해주세요."
                className="border-border-subtler bg-fill-white p-spacing-2xs font-body3 text-label-default placeholder:text-label-subtle rounded-2xs focus:ring-label-primary min-h-[162px] w-full border focus:outline-none focus:ring-1"
              />
              <span className="text-label-subtle right-spacing-3xs bottom-spacing-4xs absolute text-right text-sm">
                {intro.length}/500
              </span>
            </div>

            {/* 태그 */}
            <div className="gap-spacing-md flex w-fit flex-col">
              <div className="gap-spacing-2xs flex flex-col">
                <label className="font-title4 text-label-strong">
                  프로필 카드에 노출될 경험 태그를 작성해주세요. (최대
                  5개)
                </label>
                <p className="font-caption2-medium text-label-subtle">
                  태그당 글자 수는 8자 이하로 제한됩니다.
                </p>
              </div>
              <div className="gap-spacing-xs grid grid-cols-3">
                {tags.map((tag, idx) => (
                  <div
                    key={idx}
                    className="border-border-subtler bg-fill-white p-spacing-4xs rounded-2xs gap-spacing-5xs flex items-center border"
                  >
                    <span className="text-label-subtle text-center">
                      #
                    </span>
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => {
                        const newTags = [...tags]
                        newTags[idx] = e.target.value
                        setTags(newTags)
                      }}
                      maxLength={8}
                      placeholder="태그 입력"
                      className="font-caption2-medium text-label-default placeholder:text-label-subtle flex-1 bg-transparent focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <SquareButton
                variant="secondary"
                size="lg"
                onClick={() => setStep(1)}
              >
                이전
              </SquareButton>
              <SquareButton
                variant="primary"
                size="lg"
                onClick={handleSubmit}
              >
                등록하기
              </SquareButton>
            </div>
          </section>
        </>
      )}
    </main>
  )
}
