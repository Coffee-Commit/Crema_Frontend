'use client'

import { Star, User, ThumbsUp } from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { RefObject, useEffect, useState } from 'react'

import SquareButton from '@/components/ui/Buttons/SquareButton'
import api from '@/lib/http/api'

interface SideBarProps {
  summaryRef: RefObject<HTMLDivElement | null>
  experienceRef: RefObject<HTMLDivElement | null>
  descriptionRef: RefObject<HTMLDivElement | null>
  reviewRef: RefObject<HTMLDivElement | null>
  scrollToSection: (ref: RefObject<HTMLDivElement | null>) => void
}

type GuideProfileResponse = {
  guideId: number
  nickname: string
  profileImageUrl: string | null
  companyName: string
  workingPeriod: string
  guideJobField?: {
    guideId: number
    jobName: string
    jobNameDescription: string
  }
}

type CoffeeChatStatsResponse = {
  totalCoffeeChats: number
  averageStar: number
  totalReviews: number
  thumbsUpCount: number
}

const sections = [
  { key: 'summary', label: '요약' },
  { key: 'experience', label: '경험' },
  { key: 'description', label: '상세' },
  { key: 'review', label: '후기' },
]

export default function ProfileSidebar({
  summaryRef,
  experienceRef,
  descriptionRef,
  reviewRef,
  scrollToSection,
}: SideBarProps) {
  const { id } = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<GuideProfileResponse | null>(
    null,
  )
  const [stats, setStats] = useState<CoffeeChatStatsResponse | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('summary')

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          api.get(`/api/guides/${id}/profile`),
          api.get(`/api/guides/${id}/coffeechat-stats`),
        ])

        console.log('📦 프로필 응답:', profileRes.data)
        console.log('📦 스탯 응답:', statsRes.data)

        setProfile(profileRes.data?.data ?? null)
        setStats(statsRes.data?.data ?? null)
      } catch (error) {
        console.error(
          '❌ ProfileSidebar 데이터 불러오기 실패:',
          error,
        )
        setProfile(null)
        setStats(null)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchProfileAndStats()
  }, [id])

  // ✅ 스크롤 감지해서 현재 섹션 업데이트
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.5 },
    )

    const elements = [
      summaryRef,
      experienceRef,
      descriptionRef,
      reviewRef,
    ]
    elements.forEach((ref, i) => {
      if (ref.current) {
        ref.current.id = sections[i].key
        observer.observe(ref.current)
      }
    })

    return () => {
      elements.forEach((ref) => {
        if (ref.current) observer.unobserve(ref.current)
      })
    }
  }, [summaryRef, experienceRef, descriptionRef, reviewRef])

  if (loading)
    return <div className="py-10 text-center">로딩중...</div>
  if (!profile || !stats)
    return <div className="py-10 text-center">데이터 없음</div>

  return (
    <aside className="gap-spacing-3xl sticky top-[120px] z-10 -mt-[200px] flex h-[434px] flex-row">
      {/* 프로필 카드 */}
      <div className="gap-spacing-xs flex w-[300px] flex-col">
        <div className="gap-spacing-xs bg-fill-white border-border-subtle p-spacing-2xs shadow-card flex w-full flex-col items-center rounded-lg border">
          <div className="gap-spacing-3xs flex w-full flex-row items-center">
            {profile.profileImageUrl ? (
              <Image
                src={profile.profileImageUrl}
                alt={`${profile.nickname} 프로필`}
                width={64}
                height={64}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="bg-fill-input-gray h-[64px] w-[64px] rounded-full" />
            )}
            <span className="font-title3 text-label-deep">
              {profile.nickname}
            </span>
          </div>

          <ul className="text-label-default font-label4-medium gap-spacing-3xs flex w-full flex-col justify-center">
            <li>
              <span className="mr-spacing-5xs">·</span>
              {profile.guideJobField?.jobNameDescription ??
                profile.guideJobField?.jobName ??
                '직무 정보 없음'}
            </li>
            <li>
              <span className="mr-spacing-5xs">·</span>
              {profile.workingPeriod ?? '경력 정보 없음'}
            </li>
            <li>
              <span className="mr-spacing-5xs">·</span>
              {profile.companyName ?? '회사 정보 없음'}
            </li>
          </ul>

          <div className="p-spacing-3xs text-label-strong font-caption2-bold bg-fill-input-gray gap-spacing-3xs rounded-xs flex w-full flex-col">
            <div className="gap-spacing-3xs flex items-center">
              <Star
                className="text-fill-primary"
                size={16}
                fill="currentColor"
              />
              <span>
                {stats.averageStar.toFixed(1)}
                <span className="text-label-default font-caption2-medium">
                  ({stats.totalReviews})
                </span>
              </span>
            </div>
            <div className="gap-spacing-3xs flex items-center">
              <User
                className="text-fill-primary"
                size={16}
              />
              <span>
                {stats.totalCoffeeChats}
                <span className="text-label-default font-caption2-medium">
                  명
                </span>
              </span>
            </div>
            <div className="gap-spacing-3xs flex items-center">
              <ThumbsUp
                className="text-fill-primary"
                size={16}
              />
              <span>
                {stats.thumbsUpCount}
                <span className="text-label-default font-caption2-medium">
                  번 도움 됐어요
                </span>
              </span>
            </div>
          </div>
        </div>

        <SquareButton
          onClick={() =>
            router.push(`/coffeechatApply/${profile.guideId}`)
          }
          variant="primary"
          size="xl"
          className="w-full"
        >
          예약하기
        </SquareButton>
      </div>

      {/* 네비게이션 타임라인 */}
      <div className="relative flex flex-col justify-center">
        <div className="relative flex flex-col">
          <div className="bg-border-subtle absolute bottom-[10px] left-[9px] top-[10px] w-[2px]" />
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() =>
                scrollToSection(
                  section.key === 'summary'
                    ? summaryRef
                    : section.key === 'experience'
                      ? experienceRef
                      : section.key === 'description'
                        ? descriptionRef
                        : reviewRef,
                )
              }
              className="relative z-10 mb-6 flex cursor-pointer items-center gap-3 text-left last:mb-0"
            >
              <span
                className={`size-5 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors ${
                  activeSection === section.key
                    ? 'bg-fill-primary border-fill-primary'
                    : 'bg-fill-disabled border-fill-disabled'
                }`}
              />
              <span
                className={`font-label4-semibold cursor-pointer transition-colors ${
                  activeSection === section.key
                    ? 'text-fill-primary'
                    : 'text-label-default'
                }`}
              >
                {section.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
