'use client'

import React, { useRef, useEffect } from 'react'
import { useVideoBinding } from '../hooks/useVideoBinding'
import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

const logger = createOpenViduLogger('LocalVideo')

export interface LocalVideoProps {
  stream: MediaStream | null
  label?: string
  className?: string
  videoEnabled?: boolean
  audioEnabled?: boolean
}

export default function LocalVideo({
  stream,
  label = '내 화면',
  className = '',
  videoEnabled = true,
  audioEnabled = true,
}: LocalVideoProps): React.ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)

  // 로컬 비디오는 항상 muted (에코 방지)
  const { bind, unbind } = useVideoBinding(videoRef, {
    muted: true,
    playsInline: true,
    autoPlay: true,
  })

  // 스트림 바인딩 효과
  useEffect(() => {
    if (stream && videoEnabled) {
      logger.debug('로컬 스트림 바인딩', {
        label,
        hasVideo: stream.getVideoTracks().length > 0,
        hasAudio: stream.getAudioTracks().length > 0,
      })

      bind(stream).catch((error) => {
        logger.error('로컬 스트림 바인딩 실패', { error })
      })
    } else {
      logger.debug('로컬 스트림 언바인딩')
      unbind()
    }

    // 정리 함수
    return () => {
      unbind()
    }
  }, [stream, videoEnabled, bind, unbind, label])

  // 비디오 상태 아이콘 렌더링
  const renderVideoStatusIcon = () => {
    if (!videoEnabled) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="flex flex-col items-center text-white">
            <svg
              className="mb-2 h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
              <line
                x1="1"
                y1="1"
                x2="23"
                y2="23"
                stroke="currentColor"
                strokeWidth={2}
              />
            </svg>
            <span className="text-sm">카메라 꺼짐</span>
          </div>
        </div>
      )
    }
    return null
  }

  // 오디오 상태 표시
  const renderAudioStatus = () => {
    return (
      <div className="absolute bottom-2 left-2">
        {audioEnabled ? (
          <svg
            className="h-5 w-5 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            className="h-5 w-5 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M12.293 5.293a1 1 0 011.414 0l2 2a1 1 0 010 1.414l-2 2a1 1 0 01-1.414-1.414L13.586 8l-1.293-1.293a1 1 0 010-1.414zM13 6V4a3 3 0 00-6 0v4c0 .35.06.687.17 1H7a1 1 0 000 2v2.93A7.001 7.001 0 0013 8a1 1 0 002 0 7.001 7.001 0 00-6-6.93V6z"
              clipRule="evenodd"
            />
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        )}
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-gray-900 ${className}`}
    >
      {/* 비디오 요소 */}
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        playsInline
        muted
        autoPlay
      />

      {/* 라벨 */}
      <div className="absolute left-2 top-2 rounded bg-black bg-opacity-50 px-2 py-1 text-sm text-white">
        {label}
      </div>

      {/* 비디오 상태 오버레이 */}
      {renderVideoStatusIcon()}

      {/* 오디오 상태 */}
      {renderAudioStatus()}

      {/* 로딩 상태 */}
      {!stream && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="flex flex-col items-center text-white">
            <div className="mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
            <span className="text-sm">카메라 준비 중...</span>
          </div>
        </div>
      )}
    </div>
  )
}
