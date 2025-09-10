'use client'

import Image from 'next/image'
import { useState } from 'react'

import CreditButton from '@/components/ui/Buttons/CreditButton'
import SquareButton from '@/components/ui/Buttons/SquareButton'
import DateTimeSelector from '@/components/ui/CustomSelectes/DateTimeSelector'
import ScheduleInputView from '@/components/ui/CustomSelectes/Schedule/ScheduleInputView'
import { Schedule } from '@/components/ui/CustomSelectes/Schedule/ScheduleSelector'
import FileUploadCard from '@/components/ui/FileUpload/FileUploadCard'
import TextAreaCounter from '@/components/ui/Inputs/TextAreaCounter'

import ApplyComplete from '../_components/ApplyComplete'
export default function CoffeechatApplyPage() {
  const [duration, setDuration] = useState<number | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const schedules: Schedule[] = [
    { days: ['월', '수'], startTime: '15:00', endTime: '21:00' },
    { days: ['화'], startTime: '15:00', endTime: '23:00' },
  ]

  return (
    <>
      <div className="bg-fill-banner-yellow h-[180px] w-full" />
      <div className="container grid grid-cols-12 gap-[132px] p-[60px]">
        {isSubmitted ? (
          // ✅ 신청 완료 페이지가 전체 넓이를 차지
          <div className="col-span-12">
            <ApplyComplete />
          </div>
        ) : (
          <>
            {/* 왼쪽 신청 폼 */}
            <div className="gap-spacing-xl col-span-12 flex flex-col lg:col-span-9">
              <h1 className="font-heading2 text-label-strong">
                커피챗 신청
              </h1>
              <div className="gap-spacing-5xs px-spacing-3xs py-spacing-4xs bg-fill-input-gray rounded-2xs flex w-[514px] items-center">
                <Image
                  src="/images/profileMypage.png"
                  alt="프로필 이미지"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div className="gap-spacing-5xs flex flex-col">
                  <h2 className="font-label4-bold text-label-deep">
                    커피챗 제목
                  </h2>
                  <p className="text-label-default font-label4-medium">
                    선배 이름
                  </p>
                </div>
              </div>
              <div className="border-border-subtler rounded-2xs px-spacing-xs py-spacing-md flex flex-col gap-[80px] border">
                {/* 시간 선택 */}
                <div className="gap-spacing-sm flex flex-col">
                  <h3 className="font-title4 text-label-strong">
                    커피챗 시간 선택
                  </h3>
                  <div className="gap-spacing-2xs flex">
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
                <div className="gap-spacing-sm flex flex-col">
                  <h3 className="font-title4 text-label-strong">
                    사진 공유 자료 선택
                  </h3>
                  <FileUploadCard />
                </div>

                {/* 일정 선택 */}
                <div className="gap-spacing-sm flex flex-col">
                  <h3 className="font-title4 text-label-strong">
                    일정 선택
                  </h3>
                  <ScheduleInputView schedules={schedules} />
                  <DateTimeSelector />
                </div>

                {/* 메시지 입력 */}
                <div className="gap-spacing-sm flex flex-col">
                  <div className="gap-spacing-2xs flex flex-col">
                    <h3 className="font-title4 text-label-strong">
                      선배에게 보낼 메시지
                    </h3>
                    <p className="text-label-subtle font-caption2-medium">
                      커피챗을 신청한 목적이나 질문사항 등, 커피챗
                      진행에 도움이 될 만한 정보를 작성해주세요.
                    </p>
                  </div>
                  <TextAreaCounter
                    maxLength={500}
                    placeholder="사전 전달 내용을 작성해주세요."
                  />
                </div>

                {/* 신청자 정보 */}
                <div className="gap-spacing-sm flex flex-col">
                  <div className="gap-spacing-2xs flex flex-col">
                    <h3 className="font-title4 text-label-strong">
                      신청자 정보
                    </h3>
                    <p className="text-label-subtle font-caption2-medium">
                      다음과 같은 정보가 선배에게 전달됩니다.
                    </p>
                  </div>
                  <ul className="bg-fill-input-gray p-spacing-xs flex flex-col gap-[20px]">
                    <li className="flex flex-row items-center justify-between">
                      <span className="font-caption2-medium text-label-default">
                        이름(닉네임)
                      </span>
                      <span className="text-label-strong font-label4-medium">
                        피크민
                      </span>
                    </li>
                    <li className="flex flex-row items-center justify-between">
                      <span className="font-caption2-medium text-label-default">
                        직무 분야
                      </span>
                      <span className="text-label-strong font-label4-medium">
                        디자인
                      </span>
                    </li>
                    <li className="flex flex-row items-center justify-between">
                      <span className="font-caption2-medium text-label-default">
                        커피챗 주제
                      </span>
                      <span className="text-label-strong font-label4-medium">
                        포트폴리오
                      </span>
                    </li>
                    <li className="gap-spacing-3xs flex flex-col">
                      <span className="font-caption2-medium text-label-default">
                        자기소개
                      </span>
                      <span className="text-label-strong font-body3">
                        노랑피크민입니달라
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 오른쪽 결제 박스 */}
            <div className="sticky top-20 col-span-12 h-fit w-[300px] lg:col-span-3">
              <div className="px-spacing-sm py-spacing-xs border-border-subtle bg-fill-white gap-spacing-xs rounded-2xs flex w-full flex-col items-center border">
                <div className="flex w-full flex-row justify-between">
                  <h3 className="font-label4-medium">총 결제 금액</h3>
                  <div className="font-label3-semibold text-label-strong">
                    {duration === 30
                      ? '8,000 P'
                      : duration === 60
                        ? '15,000 P'
                        : '0 P'}
                  </div>
                </div>
                <div className="roun-2xs bg-fill-input-gray p-spacing-4xs gap-spacing-4xs font-label5-medium text-label-subtler flex w-full flex-col">
                  <p>결제 전 안내사항</p>
                  <p>개인정보 제3자 제공</p>
                </div>
                <p className="text-label-subtle font-caption3 w-full text-center">
                  위 내용을 확인하였고, 결제에 동의합니다.
                </p>
                <SquareButton
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => setIsSubmitted(true)}
                >
                  신청하기
                </SquareButton>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
