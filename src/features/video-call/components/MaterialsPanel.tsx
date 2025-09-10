'use client'

import React, { useState, useEffect, useRef } from 'react'

import api from '@/lib/http/api'

import type {
  SharedMaterial,
  ImageUploadResponse,
  ImageUrlResponse,
  ApiResponse,
} from '../types/api.types'
import type {
  JobSeekerInfo,
  MaterialError,
} from '../types/materials.types'

// SharedMaterial 타입은 api.types.ts에서 import

export default function MaterialsPanel() {
  // 상태 관리
  const [jobSeekerInfo, _setJobSeekerInfo] =
    useState<JobSeekerInfo | null>(null)
  const [sharedMaterials, setSharedMaterials] = useState<
    SharedMaterial[]
  >([])
  const [jobSeekerLoading, setJobSeekerLoading] = useState(true)
  const [materialsLoading, setMaterialsLoading] = useState(true)
  const [jobSeekerError, setJobSeekerError] = useState(false)
  const [_materialsError, setMaterialsError] = useState(false)

  // 파일 업로드 관련 상태
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 구직자 정보 조회 (추후 구현될 API)
  useEffect(() => {
    const fetchJobSeekerInfo = async () => {
      try {
        setJobSeekerLoading(true)
        setJobSeekerError(false)
        // TODO: 추후 구현될 API
        // const response = await api.get(`/api/video-call/sessions/${sessionId}/job-seeker`)
        // setJobSeekerInfo(response.data)

        // 임시로 에러 상태로 설정 (API가 구현되지 않았으므로)
        throw new Error('API not implemented')
      } catch (error) {
        console.error('구직자 정보 조회 실패:', error)
        setJobSeekerError(true)
      } finally {
        setJobSeekerLoading(false)
      }
    }

    fetchJobSeekerInfo()
  }, [])

  // 공유 자료 조회 (추후 구현될 API)
  useEffect(() => {
    const fetchSharedMaterials = async () => {
      try {
        setMaterialsLoading(true)
        setMaterialsError(false)
        // TODO: 추후 구현될 API
        // const response = await api.get(`/api/video-call/sessions/${sessionId}/materials`)
        // setSharedMaterials(response.data.materials)

        // 임시로 빈 배열로 설정
        setSharedMaterials([])
      } catch (error) {
        console.error('공유 자료 조회 실패:', error)
        setMaterialsError(true)
      } finally {
        setMaterialsLoading(false)
      }
    }

    fetchSharedMaterials()
  }, [])

  // 파일 업로드 함수
  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true)
      setUploadProgress(0)
      setUploadError(null)

      // 파일 크기 체크 (10MB 제한)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('파일 크기는 10MB를 초과할 수 없습니다.')
      }

      const formData = new FormData()
      formData.append('image', file) // API에서 'image' 파라미터로 받음
      formData.append('folder', 'shared-materials')

      const response = await api.post<
        ApiResponse<ImageUploadResponse>
      >('/api/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1),
          )
          setUploadProgress(progress)
        },
      })

      // 업로드 성공 후 새로운 자료를 목록에 추가
      const uploadResult =
        (response.data as unknown as ApiResponse<ImageUploadResponse>)
          .result ||
        (response.data as unknown as { data: ImageUploadResponse })
          .data
      const uploadedFile: SharedMaterial = {
        id: uploadResult.imageKey,
        imageKey: uploadResult.imageKey,
        fileName: file.name,
        uploadedAt: uploadResult.uploadedAt,
        uploadedBy: 'Me', // TODO: 실제 사용자명으로 변경
        fileSize: uploadResult.fileSize,
        contentType: file.type,
      }

      setSharedMaterials((prev) => [...prev, uploadedFile])

      console.log('파일 업로드 성공:', uploadResult)
    } catch (error: unknown) {
      const materialError = error as MaterialError
      console.error('파일 업로드 실패:', error)
      const errorMessage =
        materialError?.message ||
        (error instanceof Error ? error.message : String(error)) ||
        '파일 업로드에 실패했습니다.'
      setUploadError(errorMessage)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // 파일 선택 핸들러
  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
    // input을 리셋해서 같은 파일도 다시 선택할 수 있게 함
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 업로드 버튼 클릭 핸들러
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // 다운로드 핸들러 (presigned URL 사용)
  const handleDownload = async (material: SharedMaterial) => {
    try {
      const response = await api.get<ApiResponse<ImageUrlResponse>>(
        '/api/images/url',
        {
          params: { imageKey: material.imageKey },
        },
      )

      const urlResult =
        (response.data as unknown as ApiResponse<ImageUrlResponse>)
          .result ||
        (response.data as unknown as { data: ImageUrlResponse }).data
      const downloadUrl = urlResult.presignedUrl

      // 새 탭에서 다운로드 URL 열기
      window.open(downloadUrl, '_blank')
    } catch (error: unknown) {
      const materialError = error as MaterialError
      console.error('다운로드 URL 생성 실패:', error)
      const errorMessage =
        materialError?.message ||
        (error instanceof Error ? error.message : String(error)) ||
        '다운로드에 실패했습니다.'
      alert(errorMessage)
    }
  }
  // 파일 확장자 기반 아이콘 반환
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()

    switch (extension) {
      case 'pdf':
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        )
      case 'doc':
      case 'docx':
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M14,17H7V15H14M17,13H7V11H17M17,9H7V7H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z" />
          </svg>
        )
      case 'xls':
      case 'xlsx':
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        )
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
          </svg>
        )
      default:
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z" />
          </svg>
        )
    }
  }

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return (
      parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    )
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* 섹션 1: 구직자 정보 */}
      <div className="border-b border-[var(--color-border-subtle)] p-[var(--spacing-spacing-md)]">
        <h3 className="font-title4 mb-[var(--spacing-spacing-xs)] text-[var(--color-label-deep)]">
          구직자 정보
        </h3>

        {jobSeekerLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-[var(--color-label-subtle)]">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="font-caption">로딩 중...</span>
              </div>
            </div>
          </div>
        ) : jobSeekerError ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-[var(--color-label-subtle)]">
              <span className="font-caption">요청이 실패함</span>
            </div>
          </div>
        ) : jobSeekerInfo ? (
          <div className="space-y-[var(--spacing-spacing-2xs)]">
            {/* 이름 & 포지션 */}
            <div className="flex items-center justify-between">
              <span className="font-label3-semibold text-[var(--color-label-strong)]">
                {jobSeekerInfo.name}
              </span>
              <span className="font-caption rounded-[var(--radius-xs)] bg-[var(--color-fill-secondary)] px-[var(--spacing-spacing-7xs)] py-[var(--spacing-spacing-8xs)] text-[var(--color-label-default)]">
                {jobSeekerInfo.experience}
              </span>
            </div>

            {/* 포지션 */}
            <p className="font-body2 text-[var(--color-label-default)]">
              {jobSeekerInfo.position}
            </p>

            {/* 기술 스택 */}
            <div>
              <p className="font-caption mb-[var(--spacing-spacing-7xs)] text-[var(--color-label-subtle)]">
                주요 기술
              </p>
              <div className="flex flex-wrap gap-[var(--spacing-spacing-7xs)]">
                {jobSeekerInfo.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="font-caption rounded-[var(--radius-xs)] bg-[var(--color-fill-primary)] px-[var(--spacing-spacing-7xs)] py-[var(--spacing-spacing-8xs)] text-white"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* 소개 */}
            <div>
              <p className="font-caption mb-[var(--spacing-spacing-7xs)] text-[var(--color-label-subtle)]">
                자기소개
              </p>
              <p className="font-caption leading-relaxed text-[var(--color-label-default)]">
                {jobSeekerInfo.introduction}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* 섹션 2: 사전 질문 / 공유 자료 */}
      <div className="flex-1 p-[var(--spacing-spacing-md)]">
        <div className="mb-[var(--spacing-spacing-xs)] flex items-center justify-between">
          <h3 className="font-title4 text-[var(--color-label-deep)]">
            사전 질문 / 공유 자료
          </h3>
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className={`flex items-center gap-1 rounded-[var(--radius-sm)] px-[var(--spacing-spacing-2xs)] py-[var(--spacing-spacing-7xs)] text-xs transition-all ${
              isUploading
                ? 'cursor-not-allowed bg-[var(--color-gray-200)] text-[var(--color-label-subtle)]'
                : 'bg-[var(--color-fill-primary)] text-white hover:brightness-110'
            }`}
          >
            {isUploading ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                업로드 중...
              </>
            ) : (
              <>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                파일 업로드
              </>
            )}
          </button>
        </div>

        {/* 숨겨진 파일 입력 */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* 업로드 진행률 표시 */}
        {isUploading && (
          <div className="mb-[var(--spacing-spacing-6xs)]">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-caption text-xs text-[var(--color-label-subtle)]">
                업로드 중...
              </span>
              <span className="font-caption text-xs text-[var(--color-label-subtle)]">
                {uploadProgress}%
              </span>
            </div>
            <div className="h-1 w-full rounded-full bg-[var(--color-gray-200)]">
              <div
                className="h-1 rounded-full bg-[var(--color-fill-primary)] transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* 업로드 에러 메시지 */}
        {uploadError && (
          <div className="mb-[var(--spacing-spacing-6xs)] rounded-[var(--radius-sm)] border border-red-200 bg-red-50 p-[var(--spacing-spacing-2xs)]">
            <span className="font-caption text-xs text-red-600">
              {uploadError}
            </span>
          </div>
        )}

        <div className="space-y-[var(--spacing-spacing-6xs)]">
          {materialsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-[var(--color-label-subtle)]">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span className="font-caption">
                    자료 로딩 중...
                  </span>
                </div>
              </div>
            </div>
          ) : sharedMaterials.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center text-[var(--color-label-subtle)]">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="mx-auto mb-2"
                >
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                <p className="font-caption">공유된 자료가 없습니다</p>
                <p className="font-caption mt-1 text-xs">
                  파일을 업로드해보세요!
                </p>
              </div>
            </div>
          ) : (
            sharedMaterials.map((material) => (
              <div
                key={material.id}
                onClick={() => handleDownload(material)}
                className="cursor-pointer rounded-[var(--radius-sm)] border border-[var(--color-border-default)] p-[var(--spacing-spacing-2xs)] transition-all hover:bg-[var(--color-fill-secondary)]"
              >
                <div className="flex items-start gap-[var(--spacing-spacing-7xs)]">
                  {/* 파일 아이콘 */}
                  <div className="mt-0.5 flex-shrink-0 text-[var(--color-label-default)]">
                    {getFileIcon(material.fileName)}
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* 파일명 & 크기 */}
                    <div className="mb-[var(--spacing-spacing-8xs)] flex items-center gap-[var(--spacing-spacing-7xs)]">
                      <h4 className="font-label4-medium truncate text-[var(--color-label-strong)]">
                        {material.fileName}
                      </h4>
                      <span className="font-caption flex-shrink-0 rounded-[var(--radius-xs)] bg-[var(--color-fill-tertiary)] px-[var(--spacing-spacing-8xs)] py-[var(--spacing-spacing-9xs)] text-[var(--color-label-subtle)]">
                        {formatFileSize(material.fileSize)}
                      </span>
                    </div>

                    {/* 업로드 정보 */}
                    <div className="flex items-center justify-between">
                      <span className="font-caption text-[var(--color-label-default)]">
                        {material.uploadedBy}
                      </span>
                      <span className="font-caption text-xs text-[var(--color-label-subtle)]">
                        {new Date(
                          material.uploadedAt,
                        ).toLocaleDateString('ko-KR')}
                      </span>
                    </div>

                    {/* 다운로드 힌트 */}
                    <div className="mt-[var(--spacing-spacing-8xs)]">
                      <span className="font-caption text-xs text-[var(--color-label-primary)]">
                        클릭하여 다운로드
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
