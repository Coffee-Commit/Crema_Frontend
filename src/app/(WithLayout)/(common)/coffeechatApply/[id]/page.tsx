'use client'

import { useState } from 'react'

import CreditButton from '@/components/ui/Buttons/CreditButton'
import FileUploadCard from '@/components/ui/FileUpload/FileUploadCard'
import ScheduleInputView from '@/components/ui/CustomSelectes/Schedule/ScheduleInputView'
import DateTimeSelector from '@/components/ui/CustomSelectes/DateTimeSelector'
import TextAreaCounter from '@/components/ui/Inputs/TextAreaCounter'
import SquareButton from '@/components/ui/Buttons/SquareButton'
import { Schedule } from '@/components/ui/CustomSelectes/Schedule/ScheduleSelector'
import ApplyComplete from '../_components/ApplyComplete'
export default function CoffeechatApplyPage() {
  const [duration, setDuration] = useState<number | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const schedules: Schedule[] = [
    { days: ['월', '수'], startTime: '15:00', endTime: '21:00' },
    { days: ['화'], startTime: '15:00', endTime: '23:00' },
  ]

  return (
    <div className="gap-gutter px-gutter py-spacing-xl container grid grid-cols-12">
      {isSubmitted ? (
        // ✅ 신청 완료 페이지가 전체 넓이를 차지
        <div className="col-span-12">
          <ApplyComplete />
        </div>
      ) : (
        <>
          {/* 왼쪽 신청 폼 */}
          <div className="gap-spacing-xl col-span-12 flex flex-col lg:col-span-9">
            {/* 제목 */}
            <div className="p-spacing-lg border-border-subtle bg-fill-white rounded-md border">
              <h2 className="font-title3">커피챗 제목</h2>
              <p className="text-label-tertiary font-body2">
                선택 이름
              </p>
            </div>

            {/* 시간 선택 */}
            <div className="gap-spacing-md flex flex-col">
              <h3 className="font-label2-semibold">
                커피챗 시간 선택
              </h3>
              <div className="gap-spacing-sm flex">
                <CreditButton
                  duration={30}
                  price={8000}
                  selected={duration === 30}
                  onClick={() => setDuration(30)}
                />
                <CreditButton
                  duration={60}
                  price={15000}
                  selected={duration === 60}
                  onClick={() => setDuration(60)}
                />
              </div>
            </div>

            {/* 사진 공유 자료 선택 */}
            <div className="gap-spacing-md flex flex-col">
              <h3 className="font-label2-semibold">
                사진 공유 자료 선택
              </h3>
              <FileUploadCard />
            </div>

            {/* 일정 선택 */}
            <div className="gap-spacing-md flex flex-col">
              <h3 className="font-label2-semibold">일정 선택</h3>
              <ScheduleInputView schedules={schedules} />
              <div className="text-label-tertiary font-body3 text-center">
                또는
              </div>
              <DateTimeSelector />
            </div>

            {/* 메시지 입력 */}
            <div className="gap-spacing-sm flex flex-col">
              <h3 className="font-label2-semibold">
                선배에게 보낼 메시지
              </h3>
              <TextAreaCounter
                maxLength={500}
                placeholder="사전 전달 내용을 작성해주세요."
              />
            </div>

            {/* 신청자 정보 */}
            <div className="bg-fill-white border-border-subtle p-spacing-lg rounded-md border">
              <h3 className="font-label2-semibold mb-spacing-md">
                신청자 정보
              </h3>
              {/* ... */}
            </div>
          </div>

          {/* 오른쪽 결제 박스 */}
          <div className="sticky top-20 col-span-12 h-fit lg:col-span-3">
            <div className="p-spacing-lg border-border-subtle bg-fill-white gap-spacing-md flex flex-col rounded-md border">
              <h3 className="font-label3-semibold">총 결제 금액</h3>
              <div className="font-title3 text-label-strong">
                {duration === 30
                  ? '8,000 P'
                  : duration === 60
                    ? '15,000 P'
                    : '0 P'}
              </div>
              <SquareButton
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => setIsSubmitted(true)} // ✅ 결제 시 완료화면으로 변경
              >
                신청하기
              </SquareButton>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
