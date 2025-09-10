'use client'

import React, { useRef, useEffect } from 'react'

import { useEnvironmentInfo } from '../hooks'
import {
  useLocalParticipant,
  useSessionReady,
  usePublisher,
} from '../store'

export default function LocalVideoPanel() {
  const localParticipant = useLocalParticipant()
  const sessionReady = useSessionReady()
  const publisher = usePublisher()
  const environmentInfo = useEnvironmentInfo()
  const videoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentVideoRef = videoRef.current
    if (!currentVideoRef || !publisher || !sessionReady) {
      return
    }

    console.log('📹 LocalVideoPanel: Publisher 스트림 연결 시작', {
      publisherId: publisher.stream?.streamId,
      hasVideo: publisher.stream?.hasVideo,
      hasAudio: publisher.stream?.hasAudio,
    })

    // 비디오 엘리먼트 생성 및 설정
    const videoElement = document.createElement('video')
    videoElement.autoplay = true
    videoElement.playsInline = true
    videoElement.muted = true // 로컬 참가자는 항상 음소거 (에코 방지)
    videoElement.style.width = '100%'
    videoElement.style.height = '100%'
    videoElement.style.objectFit = 'cover'
    videoElement.style.transform = 'scaleX(-1)' // 거울 효과 (본인 화면)

    // 기존 비디오 엘리먼트 정리
    currentVideoRef.innerHTML = ''
    currentVideoRef.appendChild(videoElement)

    try {
      // OpenVidu Publisher의 addVideoElement 메서드 사용
      publisher.addVideoElement(videoElement)
      console.log(
        '✅ LocalVideoPanel: Publisher 비디오 엘리먼트 연결 완료',
      )
    } catch (error) {
      console.error(
        '❌ LocalVideoPanel: Publisher 비디오 엘리먼트 연결 실패:',
        error,
      )

      // 대안: 직접 srcObject 설정
      if (publisher.stream) {
        const mediaStream = publisher.stream.getMediaStream()
        if (mediaStream) {
          videoElement.srcObject = mediaStream
          console.log('✅ LocalVideoPanel: 직접 스트림 연결 완료')
        }
      }
    }

    // 정리 함수
    return () => {
      if (currentVideoRef) {
        currentVideoRef.innerHTML = ''
      }
    }
  }, [publisher, sessionReady])

  const getVideoStatusIcon = () => {
    if (!localParticipant) return null

    if (!localParticipant.videoEnabled) {
      // 카메라 장치가 없는 경우와 사용자가 끈 경우 구분
      const hasVideoDevice = environmentInfo?.hasVideoDevice ?? true
      const statusMessage = !hasVideoDevice
        ? '오디오 전용 모드'
        : '비디오가 꺼져 있습니다'

      const icon = !hasVideoDevice ? (
        // 오디오 전용 아이콘
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
        </svg>
      ) : (
        // 사용자 아이콘 (기존)
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      )

      return (
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center text-[var(--color-fill-white)]">
            <div className="mx-auto mb-[var(--spacing-spacing-6xs)] flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-gray-600)]">
              {icon}
            </div>
            <p className="font-body2">나</p>
            <p className="font-caption text-[var(--color-label-subtle)]">
              {statusMessage}
            </p>
          </div>
        </div>
      )
    }

    return null
  }

  const renderPreparingState = () => (
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
        <p className="font-caption text-[var(--color-label-subtle)]">
          잠시만 기다려주세요
        </p>
      </div>
    </div>
  )

  return (
    <div className="relative h-full w-full bg-[var(--color-gray-800)]">
      {/* 비디오 스트림 */}
      <div
        ref={videoRef}
        className="h-full w-full"
      />

      {/* 비디오 비활성화 상태 표시 */}
      {localParticipant && getVideoStatusIcon()}

      {/* 준비 중 상태 표시 */}
      {!localParticipant && renderPreparingState()}
      {!sessionReady && renderPreparingState()}

      {/* 참가자 정보 오버레이 (토글 형태) */}
      {localParticipant && (
        <div className="absolute bottom-[var(--spacing-spacing-3xs)] left-[var(--spacing-spacing-3xs)]">
          <div className="flex items-center gap-[var(--spacing-spacing-7xs)] rounded-[var(--radius-xs)] bg-black bg-opacity-50 px-[var(--spacing-spacing-6xs)] py-[var(--spacing-spacing-7xs)] text-[var(--color-fill-white)]">
            {/* 음성 상태 아이콘 */}
            <div className="flex items-center">
              {localParticipant.audioEnabled ? (
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

            {/* 참가자 이름 (동적으로 nickname 표시, 로컬 참가자는 '나'로 표시하거나 실제 nickname) */}
            <span className="font-caption">
              {localParticipant.nickname}
            </span>

            {/* 발화 중 표시 */}
            {localParticipant.speaking && (
              <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-fill-primary)]" />
            )}

            {/* 화면 공유 표시 */}
            {localParticipant.isScreenSharing && (
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
    </div>
  )
}
