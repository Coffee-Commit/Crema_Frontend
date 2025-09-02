'use client'

import Image from 'next/image'

import CircleButton from '@/components/ui/Buttons/CircleButton'
import {
  HeroCard,
  FeatureCard,
} from '@/components/ui/Cards/MainCards'
import SearchBarMain from '@/components/ui/SearchBar/SearchBarMain'
import KeywordTag from '@/components/ui/Tags/KeywordTag'

export default function HomePage() {
  const handleSearch = (value: string) => {
    console.log('검색어:', value)
  }
  return (
    <main className="w-full">
      {/* 헤더 이후 Hero Section */}
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
              <KeywordTag>추천 태그</KeywordTag>
              <KeywordTag>비전공자</KeywordTag>
              <KeywordTag>코딩테스트</KeywordTag>
              <KeywordTag>연봉</KeywordTag>
              <KeywordTag>디자이너</KeywordTag>
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

      {/* 요즘 정보 Section */}
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

      {/* 최근 업로드 섹션 */}
      <section className="px-[var(--container-padding-sm)] py-[var(--spacing-spacing-xl)] lg:px-[var(--container-padding-lg)]">
        <div className="mx-auto max-w-[var(--container-width)]">
          <h2 className="font-title3 mb-[var(--spacing-spacing-sm)] text-[var(--color-label-strong)]">
            최근에 올라왔어요
          </h2>
          <div className="grid grid-cols-1 gap-[var(--spacing-gutter)] md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-[var(--radius-xs)] border border-[var(--color-border-subtle)] p-[var(--spacing-spacing-4xs)]"
              >
                <div className="mb-[var(--spacing-spacing-4xs)] h-[120px] rounded-[var(--radius-2xs)] bg-[var(--color-fill-disabled)]" />
                <p className="font-body2 mb-[var(--spacing-spacing-5xs)] text-[var(--color-label-default)]">
                  긍정적인 디자이너가 되기까지, 채용과정의 전반적인
                  이야이이이이야기
                </p>
                <div className="flex flex-wrap gap-[var(--spacing-spacing-6xs)]">
                  <KeywordTag>디자인</KeywordTag>
                  <KeywordTag>포트폴리오</KeywordTag>
                  <KeywordTag>면접</KeywordTag>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="bg-[var(--color-fill-banner-yellow)] px-[var(--container-padding-sm)] py-[var(--spacing-spacing-xl)] lg:px-[var(--container-padding-lg)]">
        <div className="mx-auto flex max-w-[var(--container-width)] flex-col items-center justify-between gap-[var(--spacing-spacing-md)] md:flex-row">
          <div className="text-center md:text-left">
            <h3 className="font-title3 mb-[var(--spacing-spacing-5xs)] text-[var(--color-label-strong)]">
              당신의 이야기, 누군가에게는 꼭 필요한 단서일지도 몰라요!
            </h3>
            <CircleButton
              variant="secondary"
              size="lg"
            >
              내 경험 공유하기
            </CircleButton>
          </div>
          <Image
            src="/img/footer-illustration.svg"
            alt="커피"
            width={120}
            height={120}
          />
        </div>
      </section>
    </main>
  )
}
