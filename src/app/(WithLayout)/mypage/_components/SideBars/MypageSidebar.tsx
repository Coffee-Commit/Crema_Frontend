'use client'

import Image from 'next/image'
import Link from 'next/link'

import SquareButton from '@/components/ui/Buttons/SquareButton'
import Divider from '@/components/ui/Divider.tsx/Divider'
import { User } from '@/store/useAuthStore'

export default function MypageSidebar({ user }: { user: User }) {
  return (
    <aside className="border-border-subtler bg-fill-white p-spacing-xs gap-spacing-md flex h-[1000px] w-[300px] flex-col rounded-sm border">
      {/* 프로필 영역 */}
      <div className="gap-spacing-md flex w-full flex-col">
        <div className="gap-spacing-3xs flex flex-row items-center">
          <div className="border-border-subtle bg-fill-disabled flex items-center justify-center overflow-hidden rounded-full border">
            <Image
              src={
                user.profileImageUrl || '/images/profileMypage.png'
              }
              alt="프로필 이미지"
              width={72}
              height={72}
              className="object-cover"
            />
          </div>
          <div className="gap-spacing-3xs flex flex-col">
            <p className="font-caption2-bold text-label-deep">
              {user.role === 'GUIDE' ? '선배' : '후배'}
            </p>
            <p className="font-caption2-medium text-label-deep">
              {user.nickname}
            </p>
          </div>
        </div>

        {/* 포인트 / 버튼 */}
        <div className="gap-spacing-3xs flex flex-col">
          <div className="gap-spacing-6xs border-border-subtler py-spacing-2xs rounded-2xs flex h-[40px] w-full items-center justify-center border">
            <span className="text-label-primary">Ⓟ</span>
            <span className="font-label4-semibold text-label-default">
              {user.point.toLocaleString()}
            </span>
          </div>
          <SquareButton
            variant="secondary"
            size="md"
            className="w-full"
          >
            {user.role === 'GUIDE' ? '커피챗 편집' : '선배 신청하기'}
          </SquareButton>
        </div>
      </div>

      <Divider />

      {/* 네비게이션 */}
      <div className="gap-spacing-xl flex w-full flex-col items-start">
        {/* 선배 마이페이지 → GUIDE만 접근 */}
        {user.role === 'GUIDE' && (
          <div className="gap-spacing-xs flex w-full flex-col">
            <p className="font-title4 text-label-deep">
              선배 마이페이지
            </p>
            <ul className="font-label4-medium text-label-default flex flex-col">
              <li>
                <Link
                  href="/mypage/guide/dashboard"
                  className="px-spacing-3xs py-spacing-4xs hover:bg-fill-input-gray block rounded-sm"
                >
                  대시보드
                </Link>
              </li>
              <li>
                <Link
                  href="/mypage/guide/review"
                  className="px-spacing-3xs py-spacing-4xs hover:bg-fill-input-gray block rounded-sm"
                >
                  후기
                </Link>
              </li>
              <li>
                <Link
                  href="/mypage/guide/profile"
                  className="px-spacing-3xs py-spacing-4xs hover:bg-fill-input-gray block rounded-sm"
                >
                  프로필 정보
                </Link>
              </li>
            </ul>
          </div>
        )}

        {/* 후배 마이페이지 → ROOKIE & GUIDE 둘 다 접근 가능 */}
        <div className="gap-spacing-xs flex w-full flex-col">
          <p className="font-title4 text-label-deep">
            후배 마이페이지
          </p>
          <ul className="font-label4-medium text-label-default flex flex-col">
            <li>
              <Link
                href="/mypage/rookie/dashboard"
                className="px-spacing-3xs py-spacing-4xs hover:bg-fill-input-gray block rounded-sm"
              >
                대시보드
              </Link>
            </li>
            <li>
              <Link
                href="/mypage/rookie/review"
                className="px-spacing-3xs py-spacing-4xs hover:bg-fill-input-gray block rounded-sm"
              >
                후기
              </Link>
            </li>
            <li>
              <Link
                href="/mypage/rookie/profile"
                className="px-spacing-3xs py-spacing-4xs hover:bg-fill-input-gray block rounded-sm"
              >
                프로필 정보
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  )
}
