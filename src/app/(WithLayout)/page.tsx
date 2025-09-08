'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import ScrollReveal from '@/components/common/ScrollReveal'
import CircleButton from '@/components/ui/Buttons/CircleButton'
import {
  HeroCard,
  FeatureCard,
} from '@/components/ui/Cards/MainCards'
import UploadCarousel from '@/components/ui/Crousel/UploadCarousel'
import SearchBarMain from '@/components/ui/SearchBar/SearchBarMain'
import KeywordTag from '@/components/ui/Tags/KeywordTag'
import api from '@/lib/http/api'

type Guide = {
  guideId: number
  nickname: string
  profileImageUrl: string | null
  title: string
  workingPeriodYears: string
  jobField: {
    id: number
    jobName: string
  }
  hashTags: { id: number; hashTagName: string }[]
  totalCoffeeChats: number
  averageStar: number
  totalReviews: number
  thumbsUpCount: number
}

type CardData = {
  id: number
  title: string
  subtitle: string
  tags: string[]
  rating: number
  reviewCount: number
  menteeCount: number
  mentorName: string
  profileImage: string | null
}

export default function HomePage() {
  const router = useRouter()
  const [cards, setCards] = useState<CardData[]>([])

  const handleSearch = (value: string) => {
    const encoded = encodeURIComponent(value.trim())
    if (encoded) {
      router.push(`/searchGuide?query=${encoded}`)
    }
  }
  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const res = await api.get('/api/guides', {
          params: { page: 0, size: 10, sort: 'latest' },
        })

        console.log('📦 API 응답:', res.data)

        const guides: Guide[] = res.data.data?.content ?? []

        const mapped: CardData[] =
          guides.length > 0
            ? guides.map((g) => ({
                id: g.guideId,
                title: g.title,
                subtitle: `${g.workingPeriodYears} ${g.jobField.jobName}`,
                tags: g.hashTags.map((tag) => tag.hashTagName),
                rating: g.averageStar,
                reviewCount: g.totalReviews,
                menteeCount: g.totalCoffeeChats,
                mentorName: g.nickname,
                profileImage: g.profileImageUrl,
              }))
            : Array.from({ length: 4 }).map((_, i) => ({
                id: -(i + 1),
                title: '데이터가 없습니다',
                subtitle: '',
                tags: [],
                rating: 0,
                reviewCount: 0,
                menteeCount: 0,
                mentorName: '',
                profileImage: null,
              }))

        console.log('📝 매핑된 cards:', mapped)
        setCards(mapped)
      } catch (err) {
        console.error('❌ fetchGuides 에러:', err)

        // ✅ 실패했을 때도 fallback 카드 세팅
        const fallback = Array.from({ length: 4 }).map((_, i) => ({
          id: -(i + 1),
          title: '데이터가 없습니다',
          subtitle: '',
          tags: [],
          rating: 0,
          reviewCount: 0,
          menteeCount: 0,
          mentorName: '',
          profileImage: null,
        }))
        setCards(fallback)
      }
    }

    fetchGuides()
  }, [])

  return (
    <main className="w-full">
      {/* 헤더 이후 Hero Section */}
      <ScrollReveal>
        <section className="gap-spacing-xl px-container-padding-sm py-spacing-xl lg:px-container-padding-lg mx-auto flex w-full max-w-[var(--container-width)] flex-col items-center text-center md:flex-row md:justify-between md:pb-[80px]">
          <div className="max-w-container-width md:gap-spacing-5xl flex w-full flex-col items-start text-left">
            <h1 className="font-title2-medium md:font-display1 text-label-deep">
              내게 꼭 맞는 취업 조언을,
              <br />
              가장 최근에 경험한 선배에게서
            </h1>
            <div className="gap-spacing-sm">
              <SearchBarMain
                placeholder="어떤 경험을 가진 선배가 있을까요?"
                width="624px"
                height="56px"
                onSubmit={handleSearch}
              />
              <div className="mt-spacing-xs gap-spacing-3xs flex flex-wrap justify-start">
                <KeywordTag variant="primary">추천 태그</KeywordTag>
                <KeywordTag variant="secondary">비전공자</KeywordTag>
                <KeywordTag variant="secondary">
                  코딩테스트
                </KeywordTag>
                <KeywordTag variant="secondary">연봉</KeywordTag>
                <KeywordTag variant="secondary">디자이너</KeywordTag>
              </div>
            </div>
          </div>

          <div className="relative w-full min-w-[300px] max-w-[600px]">
            <Image
              src="/images/mainHero.png"
              alt="Hero"
              width={600}
              height={600}
            />
          </div>
        </section>
      </ScrollReveal>

      {/* 요즘 정보 Section */}
      <ScrollReveal>
        <section className="bg-fill-footer-gray px-container-padding-sm py-spacing-spacing-xl lg:px-container-padding-lg md:py-spacing-6xl">
          <div className="md:gap-spacing-3xl max-w-container-width container mx-auto flex flex-col text-center">
            <div className="flex-start md: gap-spacing-4xs flex flex-col">
              <p className="font-title2-medium text-label-subtle">
                취업 관련 정보는 많고 많지만,
              </p>
              <h2 className="font-heading1 text-label-deep">
                무엇이 내게 맞는 “요즘” 정보일까요?
              </h2>
            </div>
            <div className="gap-spacing-xs grid grid-cols-1 md:grid-cols-3">
              <HeroCard
                subtitle1="약은 약사에게,"
                subtitle2="과외는 대학생에게,"
                title="취업 고민은 최근 취업한 선배에게!"
                iconSrc="/images/mainBg01.png"
                iconWidth={361}
                iconHeight={360}
                className="md:col-span-1"
              />

              <div className="gap-spacing-xs col-span-1 grid grid-cols-1 md:col-span-2 md:grid-cols-2">
                <FeatureCard
                  title="요즘 뜨는 역량"
                  description1="어딜가나 AI가 대세라던데,"
                  description2="자소서에서도 관련 능력을 어필해야 하는 추세일까?"
                  iconSrc="/images/mainBg02.png"
                  iconWidth={172}
                  iconHeight={159}
                />
                <FeatureCard
                  title="최근 서류·면접 동향"
                  description1="자격증, 인턴, 프로젝트 등 준비하라는 건 많은데…"
                  description2="요즘 기업에서는 무엇을 눈여겨볼까?"
                  iconSrc="/images/mainBg03.png"
                  iconWidth={200}
                  iconHeight={171}
                />
                <FeatureCard
                  title="나와 닮은 합격기"
                  description1="나처럼 공백기가 긴 사람은 어떨까?"
                  description2="최근 나와 비슷한 상황에서 합격한 사람의 이야기가 궁금해."
                  iconSrc="/images/mainBg04.png"
                  iconWidth={235}
                  iconHeight={201}
                  className="md:col-span-2"
                />
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 최근 업로드 섹션 */}
      <ScrollReveal>
        <section className="md: py-spacing-6xl px-container-padding-sm py-spacing-spacing-xl container">
          <div className="mx-auto max-w-[var(--container-width)]">
            <h2 className="font-heading1 mb-spacing-3xl text-label-deep">
              최근에 올라왔어요
            </h2>
            <UploadCarousel cards={cards} />
          </div>
        </section>
      </ScrollReveal>

      {/* CTA 섹션 */}
      <ScrollReveal>
        <section className="bg-fill-tooltip-orange px-container-padding-sm py-spacing-spacing-xl lg:px-container-padding-lg">
          <div className="md: p-spacing-sm md: container flex flex-col items-center justify-center md:flex-row md:gap-[160px]">
            <div className="text-center md:text-left">
              <h3 className="font-title2-medium text-label-deep mb-spacing-xs">
                당신의 이야기, 누군가에게는 <br />꼭 필요한 단서일지도
                몰라요!
              </h3>
              <CircleButton
                variant="secondary"
                size="lg"
              >
                내 경험 공유하기
              </CircleButton>
            </div>
            <Image
              src="/images/mainBg05.png"
              alt="커피"
              width={212}
              height={145}
            />
          </div>
        </section>
      </ScrollReveal>
    </main>
  )
}
