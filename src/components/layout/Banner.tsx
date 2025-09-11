'use client'

import StarRating from '@/components/ui/Ratings/StarRating'
import KeywordTag from '@/components/ui/Tags/KeywordTag'

interface BannerProps {
  categories: string[]
  title: string
  rating: number
  reviewCount: number
  keywords: string[]
}

export default function Banner({
  categories,
  title,
  rating,
  reviewCount,
  keywords,
}: BannerProps) {
  return (
    <section className="px-container-padding-sm py-spacing-xl lg:pt-spacing-7xl lg:pb-spacing-xl bg-[var(--color-fill-banner-yellow)]">
      <main className="gap-spacing-sm mx-auto flex max-w-[var(--container-width)] flex-col">
        <div className="gap-spacing-5xs flex flex-col">
          {/* 카테고리 */}
          <div className="font-caption2-medium text-label-subtler flex flex-wrap gap-1">
            {categories.map((cat, idx) => (
              <span key={idx}>
                {cat}
                {idx < categories.length - 1 && ' · '}
              </span>
            ))}
          </div>
          {/* 제목 */}
          <h1 className="font-title1 text-label-deep mb-spacing-md">
            {title}
          </h1>
        </div>

        {/* 별점 */}
        <div className="gap-spacing-5xs flex items-center">
          <StarRating rating={rating} />
          <span className="font-caption2-medium text-label-default">
            ({reviewCount})
          </span>
        </div>

        {/* 키워드 태그 */}
        <div className="gap-spacing-2xs flex flex-wrap">
          {keywords.map((kw, i) => (
            <KeywordTag key={i}>{kw}</KeywordTag>
          ))}
        </div>
      </main>
    </section>
  )
}
