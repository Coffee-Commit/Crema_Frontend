'use client'

import React, { useRef, useEffect } from 'react'

import {
  useLocalParticipant,
  usePinnedParticipant,
  useSessionReady,
} from '../store'

export default function MainVideo() {
  const localParticipant = useLocalParticipant()
  const pinnedParticipant = usePinnedParticipant()
  const sessionReady = useSessionReady()
  const videoRef = useRef<HTMLDivElement>(null)

  // 표시할 참가자 결정 (핀된 참가자가 있으면 우선, 없으면 로컬 참가자)
  const displayParticipant = pinnedParticipant || localParticipant

  useEffect(() => {
    if (!videoRef.current || !displayParticipant || !sessionReady) {
      return
    }

    // 비디오 엘리먼트 생성 및 설정
    const videoElement = document.createElement('video')
    videoElement.autoplay = true
    videoElement.playsInline = true
    videoElement.muted = displayParticipant.isLocal // 로컬 참가자는 음소거
    videoElement.style.width = '100%'
    videoElement.style.height = '100%'
    videoElement.style.objectFit = 'cover'

    // 기존 비디오 엘리먼트 정리
    videoRef.current.innerHTML = ''
    videoRef.current.appendChild(videoElement)

    // 미디어 스트림 연결
    if (displayParticipant.streams.camera) {
      videoElement.srcObject = displayParticipant.streams.camera
    } else if (displayParticipant.streams.screen) {
      videoElement.srcObject = displayParticipant.streams.screen
    }

    // 정리 함수
    return () => {
      if (videoRef.current) {
        videoRef.current.innerHTML = ''
      }
    }
  }, [displayParticipant, sessionReady])

  const getDisplayName = () => {
    if (!displayParticipant) return ''

    if (displayParticipant.isLocal) {
      return '나'
    }

    return displayParticipant.nickname
  }

  const getVideoStatusIcon = () => {
    if (!displayParticipant) return null

    if (!displayParticipant.videoEnabled) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center text-[var(--color-fill-white)]">
            <div className="mx-auto mb-[var(--spacing-spacing-6xs)] flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-gray-600)]">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <p className="font-body2">
              {displayParticipant.nickname}
            </p>
            <p className="font-caption text-[var(--color-label-subtle)]">
              비디오가 꺼져 있습니다
            </p>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="relative h-full w-full">
      {/* 비디오 스트림 */}
      <div
        ref={videoRef}
        className="h-full w-full"
      />

      {/* 비디오 비활성화 상태 표시 */}
      {getVideoStatusIcon()}

      {/* 참가자 정보 오버레이 */}
      {displayParticipant && (
        <div className="absolute bottom-[var(--spacing-spacing-3xs)] left-[var(--spacing-spacing-3xs)]">
          <div className="flex items-center gap-[var(--spacing-spacing-7xs)] rounded-[var(--radius-xs)] bg-black bg-opacity-50 px-[var(--spacing-spacing-6xs)] py-[var(--spacing-spacing-7xs)] text-[var(--color-fill-white)]">
            {/* 음성 상태 아이콘 */}
            <div className="flex items-center">
              {displayParticipant.audioEnabled ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
                </svg>
              )}
            </div>

            {/* 참가자 이름 */}
            <span className="font-caption">{getDisplayName()}</span>

            {/* 발화 중 표시 */}
            {displayParticipant.speaking && (
              <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-fill-primary)]" />
            )}

            {/* 화면 공유 표시 */}
            {displayParticipant.isScreenSharing && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* 연결되지 않은 상태 표시 */}
      {!sessionReady && (
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center text-[var(--color-fill-white)]">
            <div className="mx-auto mb-[var(--spacing-spacing-6xs)] flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-gray-600)]">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <p className="font-body2">카메라를 준비 중...</p>
          </div>
        </div>
      )}
    </div>
  )
}
