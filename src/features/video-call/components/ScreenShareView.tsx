'use client'

import React, { useRef, useEffect } from 'react'
import { useVideoBinding } from '../hooks/useVideoBinding'
import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

const logger = createOpenViduLogger('ScreenShareView')

export interface ScreenShareViewProps {
  stream: MediaStream | null
  label?: string
  className?: string
  onScreenShareEnd?: () => void
}

export default function ScreenShareView({
  stream,
  label = '화면 공유',
  className = '',
  onScreenShareEnd,
}: ScreenShareViewProps): React.ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const onEndRef = useRef<typeof onScreenShareEnd | undefined>(onScreenShareEnd)

  // 최신 콜백 보관 (deps 유발 방지)
  useEffect(() => {
    onEndRef.current = onScreenShareEnd
  }, [onScreenShareEnd])

  // 화면공유는 muted 불필요 (오디오는 마이크에서)
  const { bind, unbind } = useVideoBinding(videoRef, {
    muted: false,
    playsInline: true,
    autoPlay: true,
  })

  // 스트림 바인딩 및 ended 이벤트 처리
  useEffect(() => {
    if (stream) {
      logger.debug('화면공유 스트림 바인딩', {
        label,
        hasVideo: stream.getVideoTracks().length > 0,
        hasAudio: stream.getAudioTracks().length > 0,
      })

      bind(stream).catch((error) => {
        logger.error('화면공유 스트림 바인딩 실패', { error })
      })

      // 화면공유 비디오 트랙의 ended 이벤트 감지
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        const handleEnded = () => {
          logger.info('화면공유 트랙이 종료됨')
          onEndRef.current?.()
        }

        videoTrack.addEventListener('ended', handleEnded)

        // 정리 함수에서 이벤트 리스너 제거
        return () => {
          videoTrack.removeEventListener('ended', handleEnded)
          unbind()
        }
      }
    } else {
      logger.debug('화면공유 스트림 언바인딩')
      unbind()
    }

    // 정리 함수
    return () => {
      unbind()
    }
  }, [stream, bind, unbind, label])

  // 화면공유 중단 버튼
  const handleStopSharing = () => {
    logger.debug('사용자가 화면공유 중단 요청')
    onScreenShareEnd?.()
  }

  if (!stream) {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-lg bg-gray-800 ${className}`}
      >
        <div className="flex flex-col items-center text-white">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
          <span className="text-sm">화면공유 준비 중...</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-black ${className}`}
    >
      {/* 비디오 요소 */}
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        playsInline
        autoPlay
        style={{ backgroundColor: '#000' }}
      />

      {/* 라벨 및 컨트롤 */}
      <div className="absolute left-0 right-0 top-0 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {/* 화면공유 아이콘 */}
              <svg
                className="h-5 w-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 011 1v4a1 1 0 01-2 0V5H5v10h4a1 1 0 110 2H4a1 1 0 01-1-1V4zm7.707 4.293a1 1 0 00-1.414 1.414L11.586 12H9a1 1 0 100 2h4a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-2.293-2.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-white">
                {label}
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
              <span className="text-xs text-white">공유 중</span>
            </div>
          </div>

          {/* 화면공유 중단 버튼 */}
          <button
            onClick={handleStopSharing}
            className="flex items-center space-x-1 rounded-md bg-red-500 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-red-600"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span>공유 중단</span>
          </button>
        </div>
      </div>

      {/* 하단 안내 메시지 */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="text-center">
          <p className="text-sm text-white opacity-75">
            브라우저 탭을 닫거나 다른 앱으로 전환하면 화면공유가
            자동으로 종료됩니다
          </p>
        </div>
      </div>
    </div>
  )
}
