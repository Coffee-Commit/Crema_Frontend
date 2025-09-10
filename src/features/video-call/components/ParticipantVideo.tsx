'use client'

import React, { useRef, useEffect } from 'react'

import { useVideoCallActions } from '../store'
import type { Participant } from '../types'

interface ParticipantVideoProps {
  participant: Participant
  className?: string
}

export default function ParticipantVideo({
  participant,
  className = '',
}: ParticipantVideoProps) {
  const videoRef = useRef<HTMLDivElement>(null)
  const { pinParticipant } = useVideoCallActions()

  useEffect(() => {
    if (!videoRef.current || !participant) {
      return
    }

    // 비디오 엘리먼트 생성
    const videoElement = document.createElement('video')
    videoElement.autoplay = true
    videoElement.playsInline = true
    videoElement.muted = false // 원격 참가자는 음소거하지 않음
    videoElement.style.width = '100%'
    videoElement.style.height = '100%'
    videoElement.style.objectFit = 'cover'

    // 기존 엘리먼트 정리
    videoRef.current.innerHTML = ''
    videoRef.current.appendChild(videoElement)

    // 미디어 스트림 연결
    if (participant.streams.camera) {
      videoElement.srcObject = participant.streams.camera
    } else if (participant.streams.screen) {
      videoElement.srcObject = participant.streams.screen
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.innerHTML = ''
      }
    }
  }, [participant])

  const handleClick = () => {
    // 참가자 클릭시 메인 화면에 핀
    pinParticipant(participant.id)
  }

  const getStatusOverlay = () => {
    if (participant.videoEnabled) {
      return null
    }

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-gray-800)]">
        <div className="text-center">
          <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-gray-600)]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-[var(--color-fill-white)]"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
            </svg>
          </div>
          <p className="text-xs text-[var(--color-fill-white)]">
            {participant.nickname}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative cursor-pointer overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-gray-800)] transition-all hover:ring-2 hover:ring-[var(--color-fill-primary)] ${className}`}
      onClick={handleClick}
    >
      {/* 비디오 스트림 */}
      <div
        ref={videoRef}
        className="h-full w-full"
      />

      {/* 비디오 꺼짐 상태 오버레이 */}
      {getStatusOverlay()}

      {/* 참가자 정보 오버레이 */}
      <div className="absolute bottom-1 left-1">
        <div className="flex items-center gap-1 rounded bg-black bg-opacity-50 px-1 py-0.5 text-[var(--color-fill-white)]">
          {/* 오디오 상태 */}
          <div className="flex items-center">
            {participant.audioEnabled ? (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              </svg>
            ) : (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99z" />
              </svg>
            )}
          </div>

          {/* 이름 */}
          <span className="text-xs font-medium">
            {participant.nickname}
          </span>

          {/* 발화 중 표시 */}
          {participant.speaking && (
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-fill-primary)]" />
          )}
        </div>
      </div>

      {/* 화면 공유 아이콘 */}
      {participant.isScreenSharing && (
        <div className="absolute right-1 top-1">
          <div className="rounded bg-[var(--color-fill-primary)] p-1">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-white"
            >
              <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}
