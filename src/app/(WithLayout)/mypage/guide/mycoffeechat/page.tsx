'use client'

import { useState } from 'react'

import SquareButton from '@/components/ui/Buttons/SquareButton'
import SelectedChips from '@/components/ui/Chips/SelectedChips'
import CategoryFilter from '@/components/ui/Filters/CategoryFilter'
import JobFieldFilter from '@/components/ui/Filters/JobFieldFilter'

// 경험 항목 타입
interface Experience {
  title: string
  content: string
  categories: string[]
}

export default function CoffeechatRegisterPage() {
  // 단계 관리
  const [step, setStep] = useState(1)

  // Step 1 데이터
  const [title, setTitle] = useState('')
  const [jobFields, setJobFields] = useState<string[]>([])
  const [topics, setTopics] = useState<string[]>([])

  // Step 2 데이터
  const [experiences, setExperiences] = useState<Experience[]>([
    { title: '', content: '', categories: [] },
  ])
  const [intro, setIntro] = useState('')
  const [tags, setTags] = useState<string[]>(['', '', '', '', ''])

  // ✅ Step1에서 토픽 제거
  const handleRemoveTopic = (val: string) => {
    setTopics((prev) => prev.filter((t) => t !== val))
  }

  // ✅ Step2에서 경험 목록 추가
  const addExperience = () => {
    setExperiences([
      ...experiences,
      { title: '', content: '', categories: [] },
    ])
  }

  // ✅ 경험 항목 업데이트
  const updateExperience = (
    index: number,
    field: keyof Experience,
    value: string | string[],
  ) => {
    const newExps = [...experiences]
    newExps[index] = { ...newExps[index], [field]: value }
    setExperiences(newExps)
  }

  // 최종 제출
  const handleSubmit = () => {
    const payload = {
      title,
      jobFields,
      topics,
      experiences,
      intro,
      tags,
    }
    console.log('📦 최종 폼 데이터:', payload)
    alert('등록 완료!')
  }

  return (
    <main className="gap-spacing-6xl py-spacing-5xl container mx-auto flex flex-col">
      {step === 1 && (
        <section className="border-border-subtler bg-fill-white p-spacing-lg gap-spacing-lg flex flex-col rounded-md border">
          <h2 className="font-heading2 text-label-strong">
            커피챗 등록하기
          </h2>

          {/* 커피챗 제목 */}
          <div className="flex flex-col gap-1">
            <label className="font-title4 text-label-strong">
              커피챗 제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={70}
              placeholder="토론할 수 있는 커피챗 제목을 입력해주세요."
              className="border-border-subtler bg-fill-white p-spacing-2xs font-body3 text-label-default placeholder:text-label-subtle rounded-2xs focus:ring-label-primary w-full border focus:outline-none focus:ring-1"
            />
            <div className="text-label-subtle text-right text-sm">
              {title.length}/70
            </div>
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
            <JobFieldFilter
              selected={jobFields}
              onChange={setJobFields}
            />
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
            <CategoryFilter
              selected={topics}
              onChange={setTopics}
            />
          </div>

          <div className="flex justify-end">
            <SquareButton
              variant="primary"
              size="lg"
              onClick={() => setStep(2)}
            >
              다음으로
            </SquareButton>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="border-border-subtler bg-fill-white p-spacing-lg gap-spacing-lg flex flex-col rounded-md border">
          <h2 className="font-heading2 text-label-strong">
            커피챗 등록하기
          </h2>

          <p className="font-body2 text-label-subtle">
            후배들에게 나누실 경험 목록을 작성해주세요.
          </p>

          {/* 경험 목록 */}
          {experiences.map((exp, idx) => (
            <div
              key={idx}
              className="border-border-subtler p-spacing-md gap-spacing-md flex flex-col rounded-md border"
            >
              {/* 경험 제목 */}
              <input
                type="text"
                value={exp.title}
                onChange={(e) =>
                  updateExperience(idx, 'title', e.target.value)
                }
                placeholder="경험 제목을 작성해주세요. (예: 면접 10번 떨어진 사연과 성공기)"
                className="border-border-subtler bg-fill-white p-spacing-2xs font-body3 text-label-default placeholder:text-label-subtle rounded-2xs focus:ring-label-primary w-full border focus:outline-none focus:ring-1"
              />

              {/* 경험 내용 */}
              <textarea
                value={exp.content}
                onChange={(e) =>
                  updateExperience(idx, 'content', e.target.value)
                }
                maxLength={60}
                placeholder="작은 프로젝트를 설득력 있게 담는 것부터 시작해 포트폴리오를 완성했어요."
                className="border-border-subtler bg-fill-white p-spacing-2xs font-body3 text-label-default placeholder:text-label-subtle rounded-2xs focus:ring-label-primary min-h-[80px] w-full border focus:outline-none focus:ring-1"
              />

              {/* 주제 분류 */}
              <CategoryFilter
                selected={exp.categories}
                onChange={(vals) =>
                  updateExperience(idx, 'categories', vals)
                }
              />
            </div>
          ))}

          {/* 경험 추가 버튼 */}
          <SquareButton
            variant="secondary"
            size="md"
            onClick={addExperience}
          >
            + 경험 목록 추가
          </SquareButton>

          {/* 커피챗 소개 */}
          <div className="flex flex-col gap-1">
            <label className="font-title4 text-label-strong">
              커피챗 소개글
            </label>
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              maxLength={2000}
              placeholder="선배님을 가장 잘 표현할 수 있는 여러 경력과 특징을 소개해주세요."
              className="border-border-subtler bg-fill-white p-spacing-2xs font-body3 text-label-default placeholder:text-label-subtle rounded-2xs focus:ring-label-primary min-h-[120px] w-full border focus:outline-none focus:ring-1"
            />
            <div className="text-label-subtle text-right text-sm">
              {intro.length}/2000
            </div>
          </div>

          {/* 태그 */}
          <div className="flex flex-col gap-1">
            <label className="font-title4 text-label-strong">
              프로필 카드에 노출될 경험 태그 (최대 5개)
            </label>
            <div className="gap-spacing-xs grid grid-cols-2 md:grid-cols-5">
              {tags.map((tag, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={tag}
                  onChange={(e) => {
                    const newTags = [...tags]
                    newTags[idx] = e.target.value
                    setTags(newTags)
                  }}
                  maxLength={8}
                  placeholder="# 태그 입력"
                  className="border-border-subtler bg-fill-white p-spacing-2xs font-body3 text-label-default placeholder:text-label-subtle rounded-2xs focus:ring-label-primary w-full border focus:outline-none focus:ring-1"
                />
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <SquareButton
              variant="secondary"
              size="lg"
              onClick={() => setStep(1)}
            >
              이전
            </SquareButton>
            <SquareButton
              variant="primary"
              size="lg"
              onClick={handleSubmit}
            >
              등록하기
            </SquareButton>
          </div>
        </section>
      )}
    </main>
  )
}
