'use client'

import CareerCard from '../../_components/Cards/CarrerCard'
import UserInfoCard from '../../_components/Cards/UserInfoCard'

export default function MyPage() {
  return (
    <section className="gap-spacing-6xl ml-[65px] flex flex-col">
      {/* 내 정보 */}
      <UserInfoCard
        nickname="선배닉네임"
        email="example@example.com"
        bio="안녕하세요 크레마에요"
      />

      {/* 대표 경력 */}
      <CareerCard
        company="(주)크레마"
        jobTitle="프로덕트 디자이너"
        period="n년 개월 (2000.01 ~ 재직중)"
        verified={false}
      />
    </section>
  )
}
