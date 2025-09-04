'use client'

import clsx from 'clsx'
import Image from 'next/image'
import { useState } from 'react'

type FileStatus = 'empty' | 'pending' | 'completed'

interface FileUploadCardProps {
  className?: string
  multiple?: boolean
}

export default function FileUploadCard({
  className,
  multiple = false,
}: FileUploadCardProps) {
  const [status, setStatus] = useState<FileStatus>('empty')
  const [files, setFiles] = useState<File[]>([])

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = e.target.files
      ? Array.from(e.target.files)
      : []

    if (selectedFiles.length > 0) {
      setFiles(selectedFiles)
      setStatus('pending')

      // 예시: 2초 후 인증 완료 처리
      setTimeout(() => {
        setStatus('completed')
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
          <label className="bg-fill-primary px-spacing-lg py-spacing-2xs font-label4-semibold text-label-white cursor-pointer rounded-md">
            파일 등록
            <input
              type="file"
              accept="application/pdf*"
              multiple={multiple}
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}

      {/* PENDING 상태 */}
      {status === 'pending' && (
        <>
          <div className="bg-fill-disabled p-spacing-2xs flex items-center justify-between rounded">
            <span className="font-body3 text-label-strong">
              {files[0]?.name ?? '재직증명서 [pdf, 10MB]'}
            </span>
            <div className="flex items-center gap-2">
              <Image
                src="/icons/checkboxGray.svg"
                alt="checkbox"
                width={18}
                height={18}
              />
              <span className="text-label-subtle font-caption3">
                인증 대기중
              </span>
            </div>
          </div>
          <p className="mt-spacing-xs font-caption3 text-label-error">
            제출하신 파일을 확인 중입니다.
            <br />
            인증은 평균 1~2일 내로 완료됩니다.
          </p>
        </>
      )}

      {/* COMPLETED 상태 */}
      {status === 'completed' && (
        <>
          <div className="bg-fill-disabled p-spacing-2xs flex items-center justify-between rounded">
            <span className="font-body3 text-label-strong">
              {files[0]?.name ?? '재직증명서 [pdf, 10MB]'}
            </span>
            <div className="flex items-center gap-2">
              <Image
                src="/icons/checkboxPrimary.svg"
                alt="checkbox"
                width={18}
                height={18}
              />
              <label className="border-border-subtle px-spacing-sm py-spacing-2xs font-label4-semibold text-label-strong cursor-pointer rounded border">
                파일 변경
                <input
                  type="file"
                  accept="application/pdf"
                  multiple={multiple}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
          <p className="mt-spacing-xs font-caption3 text-label-error">
            재직 인증이 완료되었습니다.
            <br />
            파일 변경 시, 인증 절차가 다시 진행됩니다.
          </p>
        </>
      )}
    </div>
  )
}
