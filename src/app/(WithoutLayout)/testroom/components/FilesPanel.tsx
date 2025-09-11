"use client"

import { useRef } from 'react'
import Image from 'next/image'

import type { SharedFile } from '../types'
import { prettySize } from '../utils'

type Props = {
  files: SharedFile[]
  onPreview: (file: SharedFile) => void
  onDownload: (file: SharedFile) => void
  onUpload?: (file: File) => void
  onDelete?: (fileId: string, imageKey: string) => void
}

export default function FilesPanel({ files, onPreview, onDownload, onUpload, onDelete }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onUpload) {
      onUpload(file)
      // 선택 상태 초기화 (같은 파일을 다시 선택할 수 있도록)
      event.target.value = ''
    }
  }

  return (
    <section className="rounded-md border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-label3-semibold text-label-strong">공유 파일 리스트</h3>
        {onUpload && (
          <button
            onClick={handleUploadClick}
            className="rounded-md bg-[#EB5F27] px-3 py-1 text-xs text-white hover:brightness-95"
          >
            파일 업로드
          </button>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
        onChange={handleFileChange}
        className="hidden"
      />

      {files.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-500">
          공유된 파일이 없습니다.
        </div>
      ) : (
        <ul className="space-y-2">
          {files.map((file) => (
            <li key={file.id} className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-gray-50">
              <button
                type="button"
                onClick={() => onPreview(file)}
                className="flex flex-1 items-center gap-2 text-left"
                title="미리보기"
              >
                <span className="text-red-500">📄</span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">{file.name}</span>
                  <span className="text-xs text-gray-500">{prettySize(file.sizeBytes)}</span>
                </div>
              </button>
              <div className="flex gap-1">
                <button
                  onClick={() => onDownload(file)}
                  className="rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                >
                  다운로드
                </button>
                {onDelete && (
                  <button
                    onClick={() => onDelete(file.id, file.id)} // API에서 imageKey로 file.id 사용
                    className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                    title="파일 삭제"
                  >
                    삭제
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

