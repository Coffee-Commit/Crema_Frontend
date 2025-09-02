'use client'

import Image from 'next/image'

import CircleButton from '@/components/ui/Buttons/CircleButton'
import SearchBarMain from '@/components/ui/SearchBar/SearchBarMain'
import KeywordTag from '@/components/ui/Tags/KeywordTag'

export default function HomePage() {
  const handleSearch = (value: string) => {
    console.log('검색어:', value)
  }
  return (
    <main className="w-full">
      {/* 헤더 이후 Hero Section */}
      <section className="flex w-full flex-col items-center gap-[var(--spacing-spacing-xl)] bg-[var(--color-bg-default)] px-[var(--container-padding-sm)] py-[var(--spacing-spacing-xl)] lg:px-[var(--container-padding-lg)]">
        <div className="flex w-full max-w-[var(--container-width)] flex-col items-center text-center">
          <h1 className="font-title2-medium md:font-title1 text-[var(--color-label-strong)]">
            내게 꼭 맞는 취업 조언을,
            <br />
            가장 최근에 경험한 선배에게서
          </h1>
          <div className="mt-[var(--spacing-spacing-xs)] flex flex-wrap justify-center gap-[var(--spacing-spacing-3xs)]">
            <KeywordTag>추천 태그</KeywordTag>
            <KeywordTag>비전공자</KeywordTag>
            <KeywordTag>코딩테스트</KeywordTag>
            <KeywordTag>연봉</KeywordTag>
            <KeywordTag>디자이너</KeywordTag>
          </div>
          <SearchBarMain
            placeholder="어떤 경험을 가진 선배가 있을까요?"
            width="624px"
            height="56px"
            onSubmit={handleSearch}
          />
        </div>
        <div className="relative w-full max-w-[400px]">
          <Image
            src="/img/hero-illustration.svg"
            alt="Hero"
            width={400}
            height={400}
          />
        </div>
      </section>

      {/* 요즘 정보 Section */}
      <section className="bg-[var(--color-fill-white)] px-[var(--container-padding-sm)] py-[var(--spacing-spacing-xl)] lg:px-[var(--container-padding-lg)]">
        <div className="mx-auto max-w-[var(--container-width)] text-center">
          <h2 className="font-title3 mb-[var(--spacing-spacing-md)] text-[var(--color-label-strong)]">
            취업 관련 정보는 많고 많지만,
            <br />
            무엇이 내게 맞는 “요즘” 정보일까요?
          </h2>
          <div className="grid grid-cols-1 gap-[var(--spacing-gutter)] md:grid-cols-4">
            <div className="flex min-h-[240px] flex-col justify-between rounded-[var(--radius-xs)] bg-[var(--color-fill-active)] p-[var(--spacing-spacing-sm)] text-[var(--color-label-white)]">
              <div>
                <h3 className="font-title4 mb-[var(--spacing-spacing-5xs)]">
                  직무 탐색부터, 이직까지
                </h3>
                <p className="font-body2">
                  취업 고민은 최근 취업한 선배에게!
                </p>
              </div>
              <Image
                src="/img/lock-illustration.svg"
                alt="lock"
                width={80}
                height={80}
              />
            </div>
            <div className="rounded-[var(--radius-xs)] bg-[var(--color-fill-light)] p-[var(--spacing-spacing-sm)]">
              <h3 className="font-title4 mb-[var(--spacing-spacing-5xs)] text-[var(--color-label-strong)]">
                오늘 또는 역량
              </h3>
              <p className="font-body2 text-[var(--color-label-default)]">
                이력서가 A지만, 나의 장점은 B?
              </p>
            </div>
            <div className="rounded-[var(--radius-xs)] bg-[var(--color-fill-light)] p-[var(--spacing-spacing-sm)]">
              <h3 className="font-title4 mb-[var(--spacing-spacing-5xs)] text-[var(--color-label-strong)]">
                최근 시험·면접 동향
              </h3>
              <p className="font-body2 text-[var(--color-label-default)]">
                지금은, 면접 트렌드는 이렇다고들 해요…
              </p>
            </div>
            <div className="rounded-[var(--radius-xs)] bg-[var(--color-fill-light)] p-[var(--spacing-spacing-sm)]">
              <h3 className="font-title4 mb-[var(--spacing-spacing-5xs)] text-[var(--color-label-strong)]">
                나와 닮은 후기
              </h3>
              <p className="font-body2 text-[var(--color-label-default)]">
                나와 비슷한 배경의 선배는 어떻게 했을까?
              </p>
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
