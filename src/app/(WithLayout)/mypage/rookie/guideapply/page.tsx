'use client'

import { useState } from 'react'
import SquareButton from '@/components/ui/Buttons/SquareButton'
import WorkPeriodPicker from '@/components/ui/CustomSelectes/WorkPeriodPicker'
import FileUploadCard from '@/components/ui/FileUpload/FileUploadCard'
import TextFieldCounter from '@/components/ui/Inputs/TextFieldCounter'

type FileStatus = 'empty' | 'pending' | 'completed'

export default function GuideApplyPage() {
  // 입력 상태
  const [company, setCompany] = useState('')
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

  // 제출 여부
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    setSubmitted(true)
  }

  const handleEdit = () => {
    setSubmitted(false)
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
        ) : (
          <>
            {/* ✅ 조회 모드 */}
            <div className="gap-spacing-md flex flex-col">
              <div>
                <h2 className="font-title4 text-label-strong">
                  회사명
                </h2>
                <p className="font-body2 text-label-default">
                  {company || '-'}
                </p>
              </div>

              <div>
                <h2 className="font-title4 text-label-strong">
                  직무명
                </h2>
                <p className="font-body2 text-label-default">
                  {job || '-'}
                </p>
              </div>

              <div>
                <h2 className="font-title4 text-label-strong">
                  근무기간
                </h2>
                <p className="font-body2 text-label-default">
                  {workPeriod.startYear}년 {workPeriod.startMonth}월 ~{' '}
                  {workPeriod.isCurrent
                    ? '재직중'
                    : `${workPeriod.endYear}년 ${workPeriod.endMonth}월`}
                </p>
              </div>

              <div>
                <h2 className="font-title4 text-label-strong">
                  경력 인증
                </h2>
                <p className="font-body2 text-label-default">
                  {files.length > 0
                    ? files.map((f) => f.name).join(', ')
                    : '제출된 파일 없음'}
                </p>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  )
}
