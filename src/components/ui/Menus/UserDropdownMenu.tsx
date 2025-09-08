'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

import RoleBadge from '@/components/ui/Badges/RoleBadge'
import { useAuthStore } from '@/store/useAuthStore'

export default function UserDropdownMenu() {
  const { user, logout } = useAuthStore()
  const name = user?.nickname ?? '사용자'
  const role = user?.role ?? null

  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () =>
      document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 역할에 따른 마이페이지 경로
  const handleMypageClick = () => {
    if (role === 'GUIDE') {
      router.push('/mypage/guide/dashboard')
    } else if (role === 'ROOKIE') {
      router.push('/mypage/rookie/dashboard')
    } else {
      router.push('/login') // 로그인 안 된 경우
    }
    setOpen(false)
  }

  return (
    <div
      className="relative"
      ref={dropdownRef}
    >
      {/* 아이콘 + 닉네임 + 뱃지 버튼 */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="gap-spacing-5xs flex cursor-pointer items-center rounded-md px-2 py-1 transition-colors hover:bg-gray-200"
      >
        <Image
          src="/icons/HeaderUser.svg"
          alt="사용자 아이콘"
          width={26}
          height={26}
        />
        <span className="font-label4-medium text-label-deep">
          {name}
        </span>
        <RoleBadge role={role} />
      </button>

      {/* 드롭다운 메뉴 */}
      {open && (
        <div className="px-spacing-4xs py-spacing-5xs gap-spacing-4xs rounded-2xs border-border-subtler bg-fill-white shadow-dropdown absolute right-0 z-10 mt-4 flex w-[140px] flex-col border">
          <button
            onClick={handleMypageClick}
            className="font-label4-medium rounded-2xs hover:bg-fill-selected-orange text-label-strong w-full cursor-pointer px-[6px] py-[4px] text-start"
          >
            마이페이지
          </button>

          {role === 'ROOKIE' && (
            <button
              onClick={() => {
                router.push('/rookie/guideapply')
                setOpen(false)
              }}
              className="font-label4-medium rounded-2xs hover:bg-fill-selected-orange text-label-strong w-full cursor-pointer px-[6px] py-[4px] text-start"
            >
              선배 신청하기
            </button>
          )}
          {role === 'GUIDE' && (
            <button
              onClick={() => {
                router.push('/guide/mycoffeechat')
                setOpen(false)
              }}
              className="font-label4-medium rounded-2xs hover:bg-fill-selected-orange text-label-strong w-full cursor-pointer px-[6px] py-[4px] text-start"
            >
              나의 커피챗
            </button>
          )}

          <button
            onClick={logout}
            className="font-label4-medium rounded-2xs hover:bg-fill-selected-orange text-label-strong w-full cursor-pointer px-[6px] py-[4px] text-start"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  )
}
