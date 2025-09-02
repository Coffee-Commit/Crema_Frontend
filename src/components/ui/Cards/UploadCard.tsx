'use client'

import { User } from 'lucide-react'
import Image from 'next/image'

import KeywordTag from '@/components/ui/Tags/KeywordTag'

interface UploadCardProps {
  title: string
  subtitle: string
  tags: string[]
  rating: number
  reviewCount: number
  menteeCount: number
  mentorName: string
  profileImage?: string
}

export default function UploadCard({
  title,
  subtitle,
  tags,
  rating,
  reviewCount,
  menteeCount,
  mentorName,
  profileImage = '/img/default-profile.png',
}: UploadCardProps) {
  return (
    <div className="bg-fill-white pt-spacing-3xl pb-spacing-3xs px-spacing-3xs shadow-emphasize flex w-[300px] flex-col overflow-hidden rounded-[var(--radius-md)]">
      {/* 헤더 + 프로필 */}
      <div className="px-spacing-3xs relative flex items-center">
        {/* 프로필: border-top 선과 절반 겹치게 */}
        <div className="border-strong bg-fill-white absolute left-0 top-1/2 h-[64px] w-[64px] -translate-y-1/2 overflow-hidden rounded-full border">
          <Image
            src={profileImage}
            alt={mentorName}
            width={64}
            height={64}
            className="object-cover"
          />
        </div>
      </div>

      {/* 본문 */}
      <div className="px-spacing-3xs pb-spacing-3xs bg-fill-input-gray border-strong flex flex-col rounded-b-[var(--radius-md)] border-t pt-[40px]">
        <div className="mt-spacing-3xs flex flex-col">
          {/* 제목 */}
          <div className="mb-spacing-2xs h-[38px]">
            <h3 className="font-title4 text-label-deep line-clamp-2 break-words break-all">
              {title}
            </h3>
          </div>

          {/* 소제목 */}
          <p className="mb-spacing-3xs font-body3 text-label-subtle">
            {subtitle}
          </p>

          {/* 태그 */}
          <div className="mb-spacing-sm h-[60px]">
            <div className="gap-spacing-6xs flex flex-wrap">
              {tags.map((tag, i) => (
                <KeywordTag key={i}>{tag}</KeywordTag>
              ))}
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="mt-auto flex items-center justify-between">
          <div className="gap-spacing-5xs flex flex-row">
            {/* 별점 */}
            <div className="gap-spacing-6xs font-label5-medium text-label-strong flex items-center">
              <span className="text-label-primary">
                ★ {rating.toFixed(1)}
              </span>
              <span>({reviewCount}개)</span>
            </div>
            {/* 멘티 수 */}
            <div className="font-label5-medium text-label-strong flex items-center gap-1">
              <User
                size={14}
                className="text-label-primary"
              />
              <span>{menteeCount}명</span>
            </div>
          </div>
          <span className="font-label5-semibold text-label-strong">
            {mentorName}
          </span>
        </div>
      </div>
    </div>
  )
}
