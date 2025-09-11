'use client'

import React, { useRef, useEffect } from 'react'

import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

import { useVideoBinding } from '../hooks/useVideoBinding'
import type { Participant } from '../types'

const logger = createOpenViduLogger('RemoteVideo')

export interface RemoteVideoProps {
  participant: Participant | null
  className?: string
  showControls?: boolean
}

export default function RemoteVideo({
  participant,
  className = '',
  showControls = true,
}: RemoteVideoProps): React.ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)

  // 원격 비디오는 muted 안함 (소리 들어야 함)
  const { bind, unbind } = useVideoBinding(videoRef, {
    muted: false,
    playsInline: true,
    autoPlay: true,
  })

  // 참가자의 스트림 바인딩
  useEffect(() => {
    if (participant) {
      // 화면공유 우선, 없으면 카메라 스트림 사용
      const stream =
        participant.streams.screen || participant.streams.camera

      if (stream) {
        logger.debug('원격 스트림 바인딩', {
          participantId: participant.id,
          nickname: participant.nickname,
          hasScreen: !!participant.streams.screen,
          hasCamera: !!participant.streams.camera,
          videoEnabled: participant.videoEnabled,
        })

        bind(stream).catch((error) => {
          logger.error('원격 스트림 바인딩 실패', {
            error,
            participantId: participant.id,
          })
        })
      } else {
        logger.debug('원격 스트림 없음, 언바인딩', {
          participantId: participant.id,
        })
        unbind()
      }
    } else {
      logger.debug('참가자 없음, 스트림 언바인딩')
      unbind()
    }

    // 정리 함수
    return () => {
      unbind()
    }
  }, [participant, bind, unbind])

  // 비디오 상태 아이콘 렌더링
  const renderVideoStatusIcon = () => {
    if (!participant?.videoEnabled) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="flex flex-col items-center text-white">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-600">
              <svg
                className="h-8 w-8"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-sm font-medium">
              {participant?.nickname}
            </span>
            <span className="text-xs text-gray-400">카메라 꺼짐</span>
          </div>
        </div>
      )
    }
    return null
  }

  // 참가자 정보 오버레이
  const renderParticipantInfo = () => {
    if (!participant) return null

    return (
      <div className="absolute bottom-2 left-2 flex items-center space-x-1 rounded bg-black bg-opacity-50 px-2 py-1 text-sm text-white">
        {/* 오디오 상태 */}
        {participant.audioEnabled ? (
          <svg
            className={`h-4 w-4 ${participant.speaking ? 'text-green-400' : 'text-gray-300'}`}
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
            className="h-4 w-4 text-red-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M12.293 5.293a1 1 0 011.414 0l2 2a1 1 0 010 1.414l-2 2a1 1 0 01-1.414-1.414L13.586 8l-1.293-1.293a1 1 0 010-1.414zM13 6V4a3 3 0 00-6 0v4c0 .35.06.687.17 1H7a1 1 0 000 2v2.93A7.001 7.001 0 0013 8a1 1 0 002 0 7.001 7.001 0 00-6-6.93V6z"
              clipRule="evenodd"
            />
          </svg>
        )}

        {/* 화면공유 표시 */}
        {participant.isScreenSharing && (
          <svg
            className="h-4 w-4 text-blue-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 011 1v4a1 1 0 01-2 0V5H5v10h4a1 1 0 110 2H4a1 1 0 01-1-1V4z"
              clipRule="evenodd"
            />
          </svg>
        )}

        <span>{participant.nickname}</span>
      </div>
    )
  }

  // 빈 상태 (참가자 없음)
  if (!participant) {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-lg bg-gray-800 ${className}`}
      >
        <div className="flex flex-col items-center text-gray-400">
          <svg
            className="mb-3 h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span className="text-sm">원격 참가자 대기 중</span>
          <span className="mt-1 text-xs text-gray-500">
            다른 사용자의 참여를 기다리고 있습니다
          </span>
        </div>
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
        autoPlay
      />

      {/* 비디오 상태 오버레이 */}
      {renderVideoStatusIcon()}

      {/* 참가자 정보 */}
      {showControls && renderParticipantInfo()}

      {/* 발화 상태 표시 (테두리) */}
      {participant.speaking && (
        <div className="pointer-events-none absolute inset-0 animate-pulse rounded-lg border-4 border-green-400" />
      )}

      {/* 네트워크 상태 표시 (선택사항) */}
      {participant.audioLevel > 0 && (
        <div className="absolute right-2 top-2">
          <div className="flex items-center space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`h-3 w-1 rounded-full ${
                  participant.audioLevel > (i + 1) * 0.33
                    ? 'bg-green-400'
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
