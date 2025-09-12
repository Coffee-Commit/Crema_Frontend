'use client'

import clsx from 'clsx'
import Image from 'next/image'
import { useState } from 'react'

import SquareButton from '@/components/ui/Buttons/SquareButton'

type FileStatus = 'empty' | 'pending' | 'completed'

interface FileUploadCardProps {
  className?: string
  status?: FileStatus
  files?: File[]
  onChange?: (files: File[], status: FileStatus) => void
}

export default function FileUploadCard({
  className,
  status: propStatus,
  files: propFiles,
  onChange,
}: FileUploadCardProps) {
  const [internalStatus, setInternalStatus] =
    useState<FileStatus>('empty')
  const [internalFiles, setInternalFiles] = useState<File[]>([])

  const status = propStatus ?? internalStatus
  const files = propFiles ?? internalFiles

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = e.target.files
      ? Array.from(e.target.files)
      : []
    if (selectedFiles.length > 0) {
      const file = selectedFiles[0] // ✅ 한 개만 선택
      console.log('📂 업로드 파일 정보:', file)
      console.log('파일 타입:', file.type)
      console.log('파일 이름:', file.name)
      console.log('파일 크기:', file.size, 'bytes')

      if (!propFiles) setInternalFiles([file])
      if (!propStatus) setInternalStatus('pending')

      onChange?.([file], 'pending')

      // 예시: 2초 후 인증 완료 처리
      setTimeout(() => {
        if (!propStatus) setInternalStatus('completed')
        onChange?.([file], 'completed')
      }, 2000)
    }
  }

  return (
    <div
      className={clsx(
        'p-spacing-lg bg-fill-white border-border-light rounded-2xs gap-spacing-sm flex h-fit flex-col border',
        className,
      )}
    >
      {/* EMPTY 상태 */}
      {status === 'empty' && (
        <div className="gap-spacing-sm py-spacing-xl flex flex-col items-center justify-center text-center">
          <p className="font-body2 text-label-subtle">
            아직 등록한 파일이 없습니다.
          </p>
          <SquareButton
            variant="primary"
            size="md"
          >
            <label className="cursor-pointer">
              파일 등록
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </SquareButton>
        </div>
      )}

      {/* PENDING 상태 */}
      {status === 'pending' && (
        <>
          <div className="rounded-2xs flex items-center justify-between">
            <div className="py-spacing-4xs px-spacing-3xs bg-fill-disabled rounded-2xs border-border-subtle flex w-[564px] items-center justify-between border">
              <span className="font-caption2-medium text-label-strong truncate">
                {files.map((f) => f.name).join(', ')}
              </span>
              <Image
                src="/images/buttons/checkboxGray.png"
                alt="checkbox"
                width={18}
                height={18}
              />
            </div>
            <SquareButton
              variant="disabled"
              size="md"
            >
              인증 대기중
            </SquareButton>
          </div>

          <div className="gap-spacing-5xs font-caption2-medium text-label-primary flex w-full flex-col text-center">
            <p>제출하신 파일을 확인 중입니다.</p>
            <p>인증은 평균 1~2일 내로 완료됩니다.</p>
          </div>
        </>
      )}

      {/* COMPLETED 상태 */}
      {status === 'completed' && (
        <>
          <div className="rounded-2xs flex items-center justify-between">
            <div className="py-spacing-4xs px-spacing-3xs bg-fill-disabled rounded-2xs border-border-subtle flex w-[564px] items-center justify-between border">
              <span className="font-caption2-medium text-label-strong truncate">
                {files.map((f) => f.name).join(', ')}
              </span>
              <Image
                src="/images/buttons/checkboxPrimary.png"
                alt="checkbox"
                width={18}
                height={18}
              />
            </div>
            <SquareButton
              variant="tertiary"
              size="md"
            >
              <label className="cursor-pointer">
                파일 변경
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden" // ✅ multiple 제거
                  onChange={handleFileChange}
                />
              </label>
            </SquareButton>
          </div>
          <div className="gap-spacing-5xs font-caption2-medium text-label-primary flex w-full flex-col text-center">
            <p>재직 인증이 완료되었습니다.</p>
            <p>파일 변경시, 인증 절차가 다시 진행됩니다.</p>
          </div>
        </>
      )}
    </div>
  )
}
