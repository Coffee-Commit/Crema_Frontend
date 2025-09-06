'use client'

import Image from 'next/image'
import SquareButton from '@/components/ui/Buttons/SquareButton'

interface ScheduleItem {
  id: string
  profileImageUrl?: string | null
  nickname: string
  date: string
  time: string
  isActive: boolean
}

interface ScheduleTableProps {
  items: ScheduleItem[]
}

export default function ScheduleTable({ items }: ScheduleTableProps) {
  return (
    <div className="gap-spacing-xs flex flex-col">
      {items.map((item) => (
        <div
          key={item.id}
          className={`p-spacing-sm flex items-center justify-between rounded-md border ${
            item.isActive
              ? 'border-fill-primary bg-fill-white'
              : 'border-border-subtler bg-fill-disabled'
          }`}
        >
          {/* 좌측 정보 */}
          <div className="gap-spacing-sm flex items-center">
            <div className="border-border-subtle bg-fill-disabled flex h-[40px] w-[40px] items-center justify-center overflow-hidden rounded-full border">
              <Image
                src={
                  item.profileImageUrl || '/images/profileMypage.png'
                }
                alt="프로필"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <p className="font-body2 text-label-default">
              {item.nickname}
            </p>
          </div>

          {/* 일정 */}
          <div className="gap-spacing-lg flex items-center">
            <span className="font-body3 text-label-subtle">
              {item.date}
            </span>
            <span className="font-body3 text-label-subtle">
              {item.time}
            </span>
          </div>

          {/* 버튼 */}
          <div className="gap-spacing-xs flex items-center">
            {item.isActive && (
              <SquareButton
                variant="primary"
                size="sm"
              >
                커피챗 입장하기
              </SquareButton>
            )}
            <SquareButton
              variant="secondary"
              size="sm"
            >
              사진자료
            </SquareButton>
          </div>
        </div>
      ))}
    </div>
  )
}
