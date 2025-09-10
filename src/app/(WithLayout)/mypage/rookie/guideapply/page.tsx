'use client'

import { useState } from 'react'
import SquareButton from '@/components/ui/Buttons/SquareButton'
import WorkPeriodPicker from '@/components/ui/CustomSelectes/WorkPeriodPicker'
import FileUploadCard from '@/components/ui/FileUpload/FileUploadCard'
import TextFieldCounter from '@/components/ui/Inputs/TextFieldCounter'
import CircleTag from '@/components/ui/Tags/CircleTag'

type FileStatus = 'empty' | 'pending' | 'completed'

type GuideUpgradeInfo = {
  companyName: string
  isCompanyNamePublic: boolean
  jobPosition: string
  isCurrent: boolean
  workingStart: string
  workingEnd?: string
  workingPeriod: string
  certificationPdfUrl: string
}

export default function GuideApplyPage() {
  const [company, setCompany] = useState('')
  const [isCompanyNamePublic, setIsCompanyNamePublic] = useState(true)
  const [job, setJob] = useState('')
  const [workPeriod, setWorkPeriod] = useState({
    startYear: '',
    startMonth: '',
    endYear: '',
    endMonth: '',
    isCurrent: false,
  })
  const [files, setFiles] = useState<File[]>([])
  const [fileStatus, setFileStatus] = useState<FileStatus>('empty')

  // 조회 데이터
  const [info, setInfo] = useState<GuideUpgradeInfo | null>(null)

  const [submitted, setSubmitted] = useState(false)

  // 업그레이드 정보 조회
  const fetchGuideInfo = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/member/me/guide-upgrade-info`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        },
      )
      if (!res.ok) throw new Error('조회 실패')
      const data = await res.json()
      setInfo(data.result)
    } catch (err) {
      console.error('❌ 가이드 정보 조회 실패:', err)
    }
  }

  const handleSubmit = async () => {
    try {
      if (!company || !job) {
        alert('회사명과 직무명을 입력해주세요.')
        return
      }

      if (!files[0]) {
        alert('재직 증명서를 업로드해주세요.')
        return
      }

      if (files[0].size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하여야 합니다.')
        return
      }

      const formData = new FormData()
      formData.append('companyName', company)
      formData.append(
        'isCompanyNamePublic',
        String(isCompanyNamePublic),
      )
      formData.append('jobPosition', job)
      formData.append('isCurrent', String(workPeriod.isCurrent))

      if (workPeriod.startYear && workPeriod.startMonth) {
        const workingStart = `${workPeriod.startYear}-${workPeriod.startMonth.padStart(2, '0')}-01`
        formData.append('workingStart', workingStart)
      }

      if (
        !workPeriod.isCurrent &&
        workPeriod.endYear &&
        workPeriod.endMonth
      ) {
        const workingEnd = `${workPeriod.endYear}-${workPeriod.endMonth.padStart(2, '0')}-01`
        formData.append('workingEnd', workingEnd)
      }

      formData.append('certificationPdf', files[0])

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/member/me/upgrade-to-guide`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: formData,
        },
      )

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || 'API 요청 실패')
      }

      const result = await res.json()
      console.log('✅ 업로드 성공:', result)

      setSubmitted(true)
      await fetchGuideInfo() // 업로드 후 최신 데이터 조회
    } catch (err) {
      console.error('❌ 업로드 실패:', err)
    }
  }

  const handleEdit = () => {
    setSubmitted(false)
    setInfo(null)
  }

  return (
    <main className="gap-spacing-3xl ml-[65px] flex flex-col">
      {/* 제목 + 편집 버튼 */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading2 text-label-strong">
          선배 신청내역
        </h1>
        {submitted && (
          <SquareButton
            variant="secondary"
            size="md"
            onClick={handleEdit}
          >
            편집
          </SquareButton>
        )}
      </div>

      <section className="py-spacing-md px-spacing-xs gap-spacing-3xl border-border-subtler flex flex-col rounded-sm border">
        {!submitted ? (
          <>
            {/* 회사명 */}
            <div className="gap-spacing-2xs flex flex-col">
              <label className="font-title4 text-label-strong">
                회사명
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="경력 인증 내역과 동일하게 입력해주세요."
                className="border-border-subtle bg-fill-white p-spacing-2xs font-caption2-medium text-label-default placeholder:text-label-subtler focus:ring-label-primary rounded-2xs w-full border focus:outline-none focus:ring-1"
              />

              {/* 회사명 공개 여부 토글 */}
              <label className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isCompanyNamePublic}
                  onChange={(e) =>
                    setIsCompanyNamePublic(e.target.checked)
                  }
                  className="border-border-subtle accent-fill-primary h-4 w-4 cursor-pointer rounded"
                />
                <span className="font-caption2-medium text-label-deep">
                  회사명 공개
                </span>
              </label>
            </div>

            {/* 직무명 */}
            <div className="gap-spacing-2xs flex flex-col">
              <label className="font-title4 text-label-strong">
                직무명
              </label>
              <TextFieldCounter
                placeholder="직무명을 입력해주세요. (예: 프론트엔드 개발자)"
                maxLength={16}
                className="w-full"
                radiusClassName="rounded-2xs"
                onChange={(val) => setJob(val)}
              />
            </div>

            {/* 근무기간 */}
            <WorkPeriodPicker
              value={workPeriod}
              onChange={setWorkPeriod}
            />

            {/* 경력 인증 */}
            <div className="gap-spacing-2xs flex flex-col">
              <label className="font-title4 text-label-strong">
                경력 인증
              </label>
              <FileUploadCard
                files={files}
                status={fileStatus}
                onChange={(newFiles, status) => {
                  setFiles(newFiles)
                  setFileStatus(status)
                }}
              />
            </div>

            {/* 제출 버튼 */}
            <div className="flex justify-end">
              <SquareButton
                variant="primary"
                size="lg"
                className="px-spacing-lg"
                onClick={handleSubmit}
              >
                제출하기
              </SquareButton>
            </div>
          </>
        ) : info ? (
          <>
            {/* ✅ 조회 모드 */}
            <div className="px-spacing-xs py-spacing-md gap-spacing-xl flex flex-col">
              <div className="gap-spacing-4xs flex flex-col">
                <h2 className="font-title4 text-label-strong">
                  회사명
                </h2>
                <div className="gap-spacing-4xs py-spacing-5xs flex flex-row items-center">
                  <CircleTag variant="primary">
                    {info.isCompanyNamePublic ? '공개' : '비공개'}
                  </CircleTag>
                  <span className="font-caption2-medium text-label-default">
                    {info.companyName}
                  </span>
                </div>
              </div>

              <div className="gap-spacing-4xs flex flex-col">
                <h2 className="font-title4 text-label-strong">
                  직무명
                </h2>
                <p className="font-caption2-medium text-label-default py-spacing-5xs">
                  {info.jobPosition}
                </p>
              </div>

              <div className="gap-spacing-4xs flex flex-col">
                <h2 className="font-title4 text-label-strong">
                  근무기간
                </h2>
                <p className="font-caption2-medium text-label-default py-spacing-5xs">
                  {info.workingPeriod || '근무기간을 입력해주세요.'}
                </p>
              </div>

              <div className="gap-spacing-4xs flex flex-col">
                <h2 className="font-title4 text-label-strong">
                  경력 인증
                </h2>
                <div className="gap-spacing-4xs py-spacing-5xs flex flex-row items-center">
                  <CircleTag variant="primary">인증 완료</CircleTag>
                  <a
                    href={info.certificationPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-caption2-medium text-label-primary underline"
                  >
                    파일 보기
                  </a>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p>업로드된 정보를 불러오는 중입니다...</p>
        )}
      </section>
    </main>
  )
}
