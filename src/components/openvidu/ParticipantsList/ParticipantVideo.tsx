'use client'

import { useEffect, useRef } from 'react'
import { Participant } from '@/components/openvidu/types'
import clsx from 'clsx'

interface ParticipantVideoProps {
  participant: Participant
  className?: string
  showNickname?: boolean
}

export default function ParticipantVideo({
  participant,
  className,
  showNickname = true,
}: ParticipantVideoProps) {
  const videoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (videoRef.current && participant.streamManager) {
      const videoElement = document.createElement('video')
      videoElement.autoplay = true
      videoElement.playsInline = true
      videoElement.style.width = '100%'
      videoElement.style.height = '100%'
      videoElement.style.objectFit = 'cover'

      videoRef.current.appendChild(videoElement)
      participant.streamManager.addVideoElement(videoElement)

      return () => {
        if (videoRef.current && videoElement) {
          videoRef.current.removeChild(videoElement)
        }
      }
    }
  }, [participant.streamManager])

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-gray-800)]',
        className,
      )}
    >
      {/* 비디오 영역 */}
      <div
        ref={videoRef}
        className="h-full w-full [&>video]:h-full [&>video]:w-full [&>video]:object-cover"
      >
        {!participant.videoEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-gray-700)]">
            <div className="text-center text-[var(--color-fill-white)]">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-gray-600)]">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              {showNickname && (
                <p className="font-caption text-xs">
                  {participant.nickname}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 상태 표시 오버레이 */}
      <div className="absolute left-2 top-2 flex gap-1">
        {/* 음소거 상태 */}
        {!participant.audioEnabled && (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-label-error)]">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="white"
            >
              <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
            </svg>
          </div>
        )}

        {/* 화면 공유 상태 */}
        {participant.isScreenSharing && (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-fill-primary)]">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="white"
            >
              <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" />
            </svg>
          </div>
        )}
      </div>

      {/* 닉네임 표시 */}
      {showNickname && (
        <div className="absolute bottom-1 left-1 right-1">
          <div className="font-caption truncate rounded bg-black bg-opacity-60 px-1 py-0.5 text-xs text-[var(--color-fill-white)]">
            {participant.nickname}
          </div>
        </div>
      )}
    </div>
  )
}
