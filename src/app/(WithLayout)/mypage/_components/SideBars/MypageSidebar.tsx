'use client'

import Image from 'next/image'
import { useState } from 'react'

import SquareButton from '@/components/ui/Buttons/SquareButton'
import Divider from '@/components/ui/Divider.tsx/Divider'

export default function MypageSidebar() {
  const [imgSrc, setImgSrc] = useState('/images/profileMypage.png')

  return (
    <aside className="border-border-subtler bg-fill-white p-spacing-xs gap-spacing-md flex h-[1000px] w-[300px] flex-col rounded-sm border">
      <div className="gap-spacing-md flex w-full flex-col">
        {/* 프로필 영역 */}
        <div className="gap-spacing-3xs border-border-subtler flex flex-row items-center">
          <div className="border-border-subtle bg-fill-disabled flex items-center justify-center overflow-hidden rounded-full border">
            <Image
              src={imgSrc}
              alt="프로필 이미지"
              width={72}
              height={72}
              className="object-cover"
              onError={() => setImgSrc('/images/profileMypage.png')}
            />
          </div>
          <div className="gap-spacing-3xs flex flex-col">
            {/* 롤 */}
            <p className="font-caption2-bold text-label-deep">선배</p>
            <p className="font-caption2-medium text-label-deep">
              선배 닉네임
            </p>
          </div>
        </div>

        {/* 포인트 / 커피챗 버튼 */}
        <div className="gap-spacing-3xs flex flex-col">
          <div className="gap-spacing-6xs border-border-subtler py-spacing-2xs rounded-2xs flex h-[40px] w-full items-center justify-center border">
            <span className="text-label-primary">Ⓟ</span>
            <span className="font-label4-semibold text-label-default">
              3,000
            </span>
          </div>
          <SquareButton
            variant="secondary"
            size="md"
            className="w-full"
          >
            커피챗 편집
          </SquareButton>
        </div>
      </div>

      <Divider />

      {/* 네비 */}
      <div className="gap-spacing-xl flex w-full flex-col items-start">
        <div className="gap-spacing-xs flex w-full flex-col">
          <p className="font-title4 text-label-deep">
            선배 마이페이지
          </p>
          <ul className="font-label4-medium text-label-default flex flex-col">
            <li className="px-spacing-3xs py-spacing-4xs hover:bg-fill-input-gray cursor-pointer rounded-sm">
              대시보드
            </li>
            <li className="px-spacing-3xs py-spacing-4xs hover:bg-fill-input-gray cursor-pointer rounded-sm">
              후기
            </li>
            <li className="px-spacing-3xs py-spacing-4xs hover:bg-fill-input-gray cursor-pointer rounded-sm">
              프로필 정보
            </li>
          </ul>
        </div>
        <div className="gap-spacing-xs flex w-full flex-col">
          <p className="font-title4 text-label-deep">
            후배 마이페이지
          </p>
          <ul className="font-label4-medium text-label-default flex flex-col">
            <li className="px-spacing-3xs py-spacing-4xs hover:bg-fill-input-gray cursor-pointer rounded-sm">
              대시보드
            </li>
            <li className="px-spacing-3xs py-spacing-4xs hover:bg-fill-input-gray cursor-pointer rounded-sm">
              후기
            </li>
            <li className="px-spacing-3xs py-spacing-4xs hover:bg-fill-input-gray cursor-pointer rounded-sm">
              프로필 정보
            </li>
          </ul>
        </div>
      </div>
    </aside>
  )
}
