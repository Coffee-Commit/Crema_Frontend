'use client'

import { useEffect, useState } from 'react'

import SquareButton from '@/components/ui/Buttons/SquareButton'
import WorkPeriodPicker from '@/components/ui/CustomSelectes/WorkPeriodPicker'
import FileUploadCard from '@/components/ui/FileUpload/FileUploadCard'
import CircleTag from '@/components/ui/Tags/CircleTag'
import { useAuthStore } from '@/store/useAuthStore'

type FileStatus = 'empty' | 'pending' | 'completed'

type GuideUpgradeInfo = {
  companyName: string
  isCompanyNamePublic: boolean
  jobPosition: string
  isCurrent: boolean
  workingStart: string
  workingEnd: string | null
  workingPeriod: string
  certificationPdfUrl: string
}

export default function CareerCard() {
  const { tokens, user, setAuth } = useAuthStore()

  const [isEditing, setIsEditing] = useState(false)
  const [companyName, setCompanyName] = useState('')
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
  const [guideInfo, setGuideInfo] = useState<GuideUpgradeInfo | null>(
    null,
  )

  const getAuthOptions = (
    method: string,
    body?: BodyInit,
  ): RequestInit => {
    if (user?.provider === 'test' && tokens?.accessToken) {
      return {
        method,
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
        body,
      }
    }
    return { method, credentials: 'include', body }
  }

  useEffect(() => {
    const fetchGuideInfo = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/member/me/guide-upgrade-info`,
          getAuthOptions('GET'),
        )
        if (!res.ok) return
        const data = await res.json()
        if (data.result) {
          setGuideInfo(data.result)
          setCompanyName(data.result.companyName || '')
          setJob(data.result.jobPosition || '')
          setIsEditing(false)
        }
      } catch (err) {
        console.error('❌ 조회 실패:', err)
      }
    }
    fetchGuideInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.provider, tokens?.accessToken])

  const handleSave = async () => {
    try {
      const formData = new FormData()
      formData.append('companyName', companyName)
      formData.append('isCompanyNamePublic', 'true')
      formData.append('jobPosition', job)
      formData.append('isCurrent', String(workPeriod.isCurrent))
      const workingStart = `${workPeriod.startYear}-${workPeriod.startMonth.padStart(2, '0')}-01`
      formData.append('workingStart', workingStart)
      formData.append(
        'workingEnd',
        workPeriod.isCurrent
          ? ''
          : `${workPeriod.endYear}-${workPeriod.endMonth.padStart(2, '0')}-01`,
      )
      if (files[0]) formData.append('certificationPdf', files[0])

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/member/me/guide-upgrade-info`,
        getAuthOptions('PUT', formData),
      )
      if (!res.ok) throw new Error('업데이트 실패')

      const infoRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/member/me/guide-upgrade-info`,
        getAuthOptions('GET'),
      )
      const infoData = await infoRes.json()
      setGuideInfo(infoData.result)

      const meRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/member/me`,
        getAuthOptions('GET'),
      )
      if (meRes.ok) {
        const meData = await meRes.json()
        setAuth({ user: meData.result, tokens: tokens! })
      }

      setIsEditing(false)
    } catch (err) {
      console.error('❌ 저장 실패:', err)
    }
  }

  return (
    <main className="gap-spacing-3xl ml-[65px] flex flex-col">
      <section className="py-spacing-md px-spacing-xs gap-spacing-3xl border-border-subtler flex flex-col rounded-sm border">
        <div className="flex items-center justify-between">
          <h1 className="font-heading2 text-label-strong">
            대표 경력
          </h1>
          <SquareButton
            variant={isEditing ? 'primary' : 'secondary'}
            size="md"
            onClick={() =>
              isEditing ? handleSave() : setIsEditing(true)
            }
          >
            {isEditing ? '저장' : '편집'}
          </SquareButton>
        </div>

        {!isEditing ? (
          <div className="px-spacing-xs py-spacing-md gap-spacing-xl flex flex-col">
            <div className="gap-spacing-4xs flex flex-col">
              <h2 className="font-title4 text-label-strong">
                회사명
              </h2>
              <div className="gap-spacing-4xs py-spacing-5xs flex flex-row items-center">
                <CircleTag
                  variant={
                    guideInfo?.isCompanyNamePublic
                      ? 'primary'
                      : 'light'
                  }
                >
                  {guideInfo?.isCompanyNamePublic ? '공개' : '비공개'}
                </CircleTag>
                <span className="font-caption2-medium text-label-default">
                  {guideInfo?.companyName || '-'}
                </span>
              </div>
            </div>

            <div className="gap-spacing-4xs flex flex-col">
              <h2 className="font-title4 text-label-strong">
                직무명
              </h2>
              <p className="font-caption2-medium text-label-default py-spacing-5xs">
                {guideInfo?.jobPosition || '-'}
              </p>
            </div>

            <div className="gap-spacing-4xs flex flex-col">
              <h2 className="font-title4 text-label-strong">
                근무기간
              </h2>
              <p className="font-caption2-medium text-label-default py-spacing-5xs">
                {guideInfo?.workingPeriod || '-'}
              </p>
            </div>

            <div className="gap-spacing-4xs flex flex-col">
              <h2 className="font-title4 text-label-strong">
                경력 인증
              </h2>
              {guideInfo?.certificationPdfUrl ? (
                <a
                  href={guideInfo.certificationPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-caption2-medium text-label-primary underline"
                >
                  인증서 보기
                </a>
              ) : (
                <span className="font-caption2-medium text-label-error">
                  인증 필요
                </span>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="gap-spacing-2xs flex flex-col">
              <label className="font-title4 text-label-strong">
                회사명
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="border-border-subtle bg-fill-white p-spacing-2xs font-caption2-medium text-label-default placeholder:text-label-subtler focus:ring-label-primary rounded-2xs w-full border focus:outline-none focus:ring-1"
              />
            </div>

            <div className="gap-spacing-2xs flex flex-col">
              <label className="font-title4 text-label-strong">
                직무명
              </label>
              <input
                type="text"
                value={job}
                onChange={(e) => setJob(e.target.value)}
                className="border-border-subtle bg-fill-white p-spacing-2xs font-caption2-medium text-label-default placeholder:text-label-subtler focus:ring-label-primary rounded-2xs w-full border focus:outline-none focus:ring-1"
              />
            </div>

            <WorkPeriodPicker
              value={workPeriod}
              onChange={setWorkPeriod}
            />

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
          </>
        )}
      </section>
    </main>
  )
}
