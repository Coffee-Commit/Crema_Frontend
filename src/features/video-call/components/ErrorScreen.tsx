'use client'

import React from 'react'
import type { VideoCallError } from '../types'
import { useVideoCallActions } from '../store'

interface ErrorScreenProps {
  error: VideoCallError
}

export default function ErrorScreen({ error }: ErrorScreenProps) {
  const { clearError } = useVideoCallActions()

  const getErrorIcon = () => {
    switch (error.type) {
      case 'permission':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="mx-auto">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM13 17h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        )
      case 'network':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="mx-auto">
            <path d="M24.24 8.64c-.45-.34-4.93-3.64-12.24-3.64s-11.79 3.3-12.24 3.64L-.5 9.36l1.06 1.06 10.44-10.44 10.44 10.44L22.5 9.36l1.74-1.32z"/>
            <path d="M3.53 10.95L8 15.42l4-4 4 4 4.47-4.47C17.93 8.78 15.13 7.5 12 7.5s-5.93 1.28-8.47 3.45z"/>
          </svg>
        )
      case 'device':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="mx-auto">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            <path d="M16 8v8H4V8h12z"/>
          </svg>
        )
      default:
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="mx-auto">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        )
    }
  }

  const getErrorTitle = () => {
    switch (error.type) {
      case 'permission':
        return '권한이 필요합니다'
      case 'network':
        return '네트워크 연결 오류'
      case 'device':
        return '장치 오류'
      case 'connection':
        return '연결 실패'
      default:
        return '오류가 발생했습니다'
    }
  }

  const getErrorDescription = () => {
    switch (error.type) {
      case 'permission':
        return '마이크와 카메라 권한을 허용해주세요'
      case 'network':
        return '인터넷 연결을 확인하고 다시 시도해주세요'
      case 'device':
        return '마이크나 카메라에 문제가 있습니다'
      case 'connection':
        return '서버에 연결할 수 없습니다'
      default:
        return error.message
    }
  }

  const handleRetry = () => {
    clearError()
  }

  return (
    <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-[var(--color-gray-900)] p-[var(--spacing-spacing-xs)]">
      <div className="w-full max-w-md rounded-[var(--radius-lg)] bg-[var(--color-fill-white)] p-[var(--spacing-spacing-lg)] text-center">
        {/* 에러 아이콘 */}
        <div className="mb-[var(--spacing-spacing-md)] text-[var(--color-label-error)]">
          {getErrorIcon()}
        </div>
        
        {/* 에러 제목 */}
        <h2 className="font-title3 mb-[var(--spacing-spacing-6xs)] text-[var(--color-label-deep)]">
          {getErrorTitle()}
        </h2>
        
        {/* 에러 설명 */}
        <p className="font-body2 mb-[var(--spacing-spacing-md)] text-[var(--color-label-default)]">
          {getErrorDescription()}
        </p>

        {/* 에러 코드 (개발 환경에서만) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-[var(--spacing-spacing-md)] text-xs text-[var(--color-label-subtle)] bg-[var(--color-gray-100)] p-2 rounded">
            <p>에러 코드: {error.code}</p>
            <p>복구 가능: {error.recoverable ? '예' : '아니오'}</p>
          </div>
        )}
        
        {/* 액션 버튼들 */}
        <div className="flex gap-[var(--spacing-spacing-6xs)]">
          {error.recoverable && (
            <button
              onClick={handleRetry}
              className="font-label4-medium flex-1 rounded-[var(--radius-sm)] bg-[var(--color-fill-primary)] px-[var(--spacing-spacing-xs)] py-[var(--spacing-spacing-6xs)] text-[var(--color-fill-white)] transition-all hover:brightness-110"
            >
              다시 시도
            </button>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="font-label4-medium flex-1 rounded-[var(--radius-sm)] bg-[var(--color-gray-200)] px-[var(--spacing-spacing-xs)] py-[var(--spacing-spacing-6xs)] text-[var(--color-label-strong)] transition-all hover:bg-[var(--color-gray-300)]"
          >
            페이지 새로고침
          </button>
        </div>
      </div>
    </div>
  )
}