'use client'

import { useState } from 'react'

import SquareButton from '@/components/ui/Buttons/SquareButton'
import SelectedChips from '@/components/ui/Chips/SelectedChips'
import CategoryFilter from '@/components/ui/Filters/CategoryFilter'
import JobFieldFilter from '@/components/ui/Filters/JobFieldFilter'

export default function ProfilePage() {
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('example@example.com')
  const [intro, setIntro] = useState('')
  const [jobFields, setJobFields] = useState<string[]>([]) // ✅ 기본값 제거
  const [topics, setTopics] = useState<string[]>([]) // ✅ 기본값 제거

  const [isEditingInfo, setIsEditingInfo] = useState(true)
  const [isEditingInterest, setIsEditingInterest] = useState(true)

  // 선택 해제 핸들러
  const handleRemoveTopic = (value: string) => {
    setTopics((prev) => prev.filter((t) => t !== value))
  }

  const handleSubmit = () => {
    const payload = { nickname, email, intro, jobFields, topics }
    console.log('📦 폼 데이터:', payload)
    setIsEditingInfo(false)
    setIsEditingInterest(false)
  }

  return (
    <main className="gap-spacing-6xl py-spacing-5xl container mx-auto flex flex-col">
      {/* 내 정보 */}
      <section className="border-border-subtler bg-fill-white p-spacing-lg gap-spacing-lg flex flex-col rounded-md border">
        <div className="flex items-center justify-between">
          <h2 className="font-title2-bold text-label-strong">
            내 정보
          </h2>
          <SquareButton
            variant={isEditingInfo ? 'primary' : 'secondary'}
            size="sm"
            onClick={handleSubmit} // ✅ 여기서 호출
          >
            {isEditingInfo ? '완료' : '편집'}
          </SquareButton>
        </div>

        <div className="gap-spacing-xl flex flex-col md:flex-row">
          {/* 프로필 이미지 (일단 회색 원으로 처리) */}
          <div className="flex items-center justify-center">
            <div className="bg-fill-disabled h-[120px] w-[120px] overflow-hidden rounded-full" />
          </div>

          {/* 정보 입력/조회 */}
          <div className="gap-spacing-md flex flex-1 flex-col">
            {isEditingInfo ? (
              <>
                {/* 닉네임 */}
                <div className="flex flex-col gap-1">
                  <label className="font-title4 text-label-strong">
                    닉네임
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    maxLength={10}
                    placeholder="닉네임을 입력해주세요."
                    className="border-border-subtler bg-fill-white font-body3 text-label-default placeholder:text-label-subtle focus:ring-label-primary rounded-2xs px-spacing-2xs py-spacing-2xs w-full border focus:outline-none focus:ring-1"
                  />
                  <div className="text-label-subtle text-right text-sm">
                    {nickname.length}/10
                  </div>
                </div>

                {/* 이메일 */}
                <div className="flex flex-col gap-1">
                  <label className="font-title4 text-label-strong">
                    계정 이메일
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-border-subtler bg-fill-white font-body3 text-label-default placeholder:text-label-subtle focus:ring-label-primary rounded-2xs px-spacing-2xs py-spacing-2xs w-full border focus:outline-none focus:ring-1"
                  />
                </div>

                {/* 자기소개 */}
                <div className="flex flex-col gap-1">
                  <label className="font-title4 text-label-strong">
                    자기소개
                  </label>
                  <textarea
                    value={intro}
                    onChange={(e) => setIntro(e.target.value)}
                    maxLength={200}
                    placeholder="나를 소개하는 글을 남겨주세요."
                    className="border-border-subtler bg-fill-white p-spacing-2xs font-body3 text-label-default placeholder:text-label-subtle focus:border-border-primary min-h-[120px] w-full resize-none rounded-md border focus:outline-none"
                  />
                  <div className="text-label-subtle text-right text-sm">
                    {intro.length}/200
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="font-body3 text-label-subtle">
                    닉네임
                  </p>
                  <p className="font-body2 text-label-strong">
                    {nickname || '-'}
                  </p>
                </div>
                <div>
                  <p className="font-body3 text-label-subtle">
                    계정 이메일
                  </p>
                  <p className="font-body2 text-label-strong">
                    {email || '-'}
                  </p>
                </div>
                <div>
                  <p className="font-body3 text-label-subtle">
                    자기소개
                  </p>
                  <p className="font-body2 text-label-strong">
                    {intro || '-'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 내 관심 */}
      <section className="border-border-subtler bg-fill-white p-spacing-lg gap-spacing-lg flex flex-col rounded-md border">
        <div className="flex items-center justify-between">
          <h2 className="font-title2-bold text-label-strong">
            내 관심
          </h2>
          <SquareButton
            variant="secondary"
            size="sm"
            onClick={() => setIsEditingInterest(!isEditingInterest)}
          >
            {isEditingInterest ? '완료' : '편집'}
          </SquareButton>
        </div>

        {/* 커피챗 분야 */}
        <div className="gap-spacing-sm flex flex-col">
          <label className="font-title4 text-label-strong">
            커피챗 분야
          </label>
          <SelectedChips
            selected={jobFields}
            onRemove={(val) =>
              setJobFields((prev) => prev.filter((f) => f !== val))
            }
          />
          {isEditingInterest && (
            <JobFieldFilter
              selected={jobFields}
              onChange={setJobFields}
            />
          )}
        </div>

        {/* 커피챗 주제 */}
        <div className="gap-spacing-sm flex flex-col">
          <label className="font-title4 text-label-strong">
            커피챗 주제
          </label>
          <SelectedChips
            selected={topics}
            onRemove={handleRemoveTopic}
          />
          {isEditingInterest && (
            <CategoryFilter
              selected={topics}
              onChange={setTopics}
            />
          )}
        </div>
      </section>
    </main>
  )
}
