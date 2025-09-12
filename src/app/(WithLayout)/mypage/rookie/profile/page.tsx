'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

import SquareButton from '@/components/ui/Buttons/SquareButton'
import SelectedChips from '@/components/ui/Chips/SelectedChips'
import CategoryFilter from '@/components/ui/Filters/CategoryFilter'
import JobFieldFilter from '@/components/ui/Filters/JobFieldFilter'
import { useAuthStore } from '@/store/useAuthStore'

/* ===================== 매핑 테이블 ===================== */
const JOB_FIELD_MAP: Record<string, string> = {
  DESIGN: '디자인',
  PLANNING_STRATEGY: '기획/전략',
  MARKETING_PR: '마케팅/홍보',
  MANAGEMENT_SUPPORT: '경영/지원',
  IT_DEVELOPMENT_DATA: 'IT 개발/데이터',
  RESEARCH_RND: '연구/R&D',
}

const TOPIC_MAP: Record<string, string> = {
  RESUME: '이력서',
  COVER_LETTER: '자소서',
  PORTFOLIO: '포트폴리오',
  INTERVIEW: '면접',
  PRACTICAL_WORK: '실무',
  ORGANIZATION_CULTURE: '조직문화',
  HUMAN_RELATIONSHIP: '인간관계',
  WORK_LIFE_BALANCE: '워라밸',
  PASS_EXPERIENCE: '합격 경험',
  INDUSTRY_TRENDS: '업계 트렌드',
  CAREER_SWITCH: '직무 전환',
  JOB_CHANGE: '이직',
}

/* ===================== 타입 ===================== */
type ProfileResponse = {
  id: string
  nickname: string
  role: 'ROOKIE' | 'GUIDE'
  email: string | null
  point: number
  profileImageUrl: string | null
  description: string | null
  provider: string
  createdAt: string
}

type JobFieldResponse = {
  id: number
  memberId: string
  jobName: string
  jobNameDescription: string
}

type TopicResponse = {
  id: number
  memberId: string
  topic: {
    topicName: string
    description: string | null
  }
}

/* ===================== 컴포넌트 ===================== */
export default function ProfilePage() {
  const { user, tokens } = useAuthStore()

  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [intro, setIntro] = useState('')
  const [jobFields, setJobFields] = useState<string[]>([]) // ENUM 값
  const [topics, setTopics] = useState<string[]>([]) // ENUM 값

  const [isEditingInfo, setIsEditingInfo] = useState(false)
  const [isEditingInterest, setIsEditingInterest] = useState(false)

  // ===== 옵션 분기 함수 =====
  const getAuthOptions = (
    method: string,
    body?: BodyInit,
  ): RequestInit => {
    if (user?.provider === 'test' && tokens?.accessToken) {
      return {
        method,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          ...(body instanceof URLSearchParams
            ? { 'Content-Type': 'application/x-www-form-urlencoded' }
            : { 'Content-Type': 'application/json' }),
        },
        body,
      }
    }
    return {
      method,
      credentials: 'include',
      ...(body && {
        body,
        headers:
          body instanceof URLSearchParams
            ? { 'Content-Type': 'application/x-www-form-urlencoded' }
            : { 'Content-Type': 'application/json' },
      }),
    }
  }

  // ===== 초기 데이터 불러오기 =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. 프로필 정보
        const profileRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/member/me`,
          getAuthOptions('GET'),
        )
        if (profileRes.ok) {
          const data: { result: ProfileResponse } =
            await profileRes.json()
          setNickname(data.result.nickname || '')
          setEmail(data.result.email || '')
          setIntro(data.result.description || '')
        }

        // 2. 관심 분야
        const jobFieldRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/member/coffee-chat/interests/fields`,
          getAuthOptions('GET'),
        )
        if (jobFieldRes.ok) {
          const data: { result: JobFieldResponse } =
            await jobFieldRes.json()
          if (data.result?.jobName) {
            setJobFields([data.result.jobName]) // ENUM 값 저장
          }
        }

        // 3. 관심 주제
        const topicRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/member/coffee-chat/interests/topics`,
          getAuthOptions('GET'),
        )
        if (topicRes.ok) {
          const data: { result: TopicResponse[] } =
            await topicRes.json()
          setTopics(data.result.map((t) => t.topic.topicName)) // ENUM 값 저장
        }

        // 값이 있으면 조회 모드
        setIsEditingInfo(false)
        setIsEditingInterest(false)
      } catch (err) {
        console.error('❌ 초기 데이터 불러오기 실패:', err)
      }
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.provider, tokens?.accessToken])

  // ===== 저장 처리 =====
  const handleSubmit = async () => {
    try {
      // 1. 프로필 저장
      const profileBody = new URLSearchParams()
      profileBody.append('nickname', nickname)
      profileBody.append('description', intro)
      profileBody.append('email', email)

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/member/me/profile/info`,
        getAuthOptions('PUT', profileBody),
      )

      // 2. 관심 분야 저장 (1개만 가능)
      if (jobFields.length > 0) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/member/coffee-chat/interests/fields`,
          getAuthOptions(
            'PUT',
            JSON.stringify({ jobName: jobFields[0] }), // ENUM 값 전송
          ),
        )
      }

      // 3. 관심 주제 저장 (여러개 가능)
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/member/coffee-chat/interests/topics`,
        getAuthOptions(
          'PUT',
          JSON.stringify({
            topicNames: topics, // ENUM 값 배열 전송
          }),
        ),
      )

      console.log('✅ 프로필 저장 성공')
      setIsEditingInfo(false)
      setIsEditingInterest(false)
    } catch (err) {
      console.error('❌ 저장 실패:', err)
    }
  }

  // ===== 선택 해제 핸들러 =====
  const handleRemoveTopic = (label: string) => {
    // 한글 label → enum 역매핑
    const enumKey = Object.keys(TOPIC_MAP).find(
      (k) => TOPIC_MAP[k] === label,
    )
    if (!enumKey) return
    setTopics((prev) => prev.filter((t) => t !== enumKey))
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
            onClick={() =>
              isEditingInfo ? handleSubmit() : setIsEditingInfo(true)
            }
          >
            {isEditingInfo ? '완료' : '편집'}
          </SquareButton>
        </div>

        <div className="gap-spacing-xl flex flex-col md:flex-row">
          {/* 프로필 이미지 */}
          <div className="flex items-center justify-center">
            <div className="bg-fill-disabled h-[120px] w-[120px] overflow-hidden rounded-full">
              <Image
                src={
                  user?.profileImageUrl ?? '/icons/profileDefault.svg'
                }
                alt="프로필 이미지"
                width={120}
                height={120}
                className="rounded-full object-cover"
              />
            </div>
          </div>

          <div className="gap-spacing-md flex flex-1 flex-col">
            {isEditingInfo ? (
              <>
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
                </div>

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
            variant={isEditingInterest ? 'primary' : 'secondary'}
            size="sm"
            onClick={() =>
              isEditingInterest
                ? handleSubmit()
                : setIsEditingInterest(true)
            }
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
            selected={jobFields.map((f) => JOB_FIELD_MAP[f] || f)} // 한글 변환
            onRemove={() => setJobFields([])} // 1개만 선택 가능
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
            selected={topics.map((t) => TOPIC_MAP[t] || t)} // 한글 변환
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
