'use client'

import React from 'react'

import ControlButton from './ControlButton'
import {
  useAudioEnabled,
  useVideoEnabled,
  useScreenSharing,
  useLoading,
  useVideoCallActions,
  useSessionStatus,
  useNetworkQuality,
} from '../store'
import type { ControlConfig } from '../types'

interface ModifiedControlsBarProps {
  onLeaveSession?: () => void
  disabled?: boolean
  className?: string
}

export default function ModifiedControlsBar({
  onLeaveSession,
  disabled = false,
  className = '',
}: ModifiedControlsBarProps) {
  const audioEnabled = useAudioEnabled()
  const videoEnabled = useVideoEnabled()
  const screenSharing = useScreenSharing()
  const loading = useLoading()
  const actions = useVideoCallActions()
  const sessionStatus = useSessionStatus()
  const networkQuality = useNetworkQuality()

  // 통화 종료 핸들러
  const handleLeaveCall = async () => {
    const confirmed = confirm('통화를 종료하시겠습니까?')
    if (!confirmed) return

    try {
      await actions.disconnect()
      onLeaveSession?.()
    } catch (error) {
      console.error('통화 종료 실패:', error)
      // 실패해도 세션 나가기 시도
      onLeaveSession?.()
    }
  }

  // 컨트롤 버튼 설정 (마이크→카메라→화면공유→통화 순서)
  const controlConfigs: ControlConfig[] = [
    {
      id: 'microphone',
      label: '마이크',
      type: 'toggle',
      icon: audioEnabled ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
        </svg>
      ),
      active: audioEnabled,
      action: actions.toggleAudio,
      tooltip: audioEnabled ? '음소거' : '음소거 해제',
    },
    {
      id: 'camera',
      label: '카메라',
      type: 'toggle',
      icon: videoEnabled ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z" />
        </svg>
      ),
      active: videoEnabled,
      action: actions.toggleVideo,
      tooltip: videoEnabled ? '비디오 끄기' : '비디오 켜기',
    },
    {
      id: 'screenshare',
      label: '화면공유',
      type: 'toggle',
      icon: screenSharing ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M21.79 18l2 2H24v-2h-2.21zM1.11 2.98l1.55 1.56c-.41.37-.66.89-.66 1.48V16c0 1.1.9 2 2.01 2H0v2h18.13l2.71 2.71 1.41-1.41L2.52 1.57 1.11 2.98zM4 6.02h.13l4.95 4.93C7.94 12.07 7.31 13.52 7 15.02c.52-1.29 1.58-2.61 3.13-2.83L15.13 17H4V6.02zM15 1H9c-1.1 0-2 .9-2 2v4.13l2 1.99V3h6v6h-2.11l4.99 4.99H22c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2h-5z" />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" />
        </svg>
      ),
      active: screenSharing,
      action: actions.toggleScreenShare,
      tooltip: screenSharing ? '화면 공유 중지' : '화면 공유',
    },
    {
      id: 'leave',
      label: '통화 종료',
      type: 'action',
      destructive: true,
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.68.28-.53 0-.97-.43-.97-.96V9.72C2.21 7.93 6.87 6 12 6s9.79 1.93 10.53 3.72v5.17c0 .53-.44.96-.97.96-.25 0-.5-.1-.68-.28-.79-.73-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
        </svg>
      ),
      action: handleLeaveCall,
      tooltip: '통화 종료',
    },
  ]

  // 상태 표시
  const getStatusColor = () => {
    if (sessionStatus === 'connected') {
      if (networkQuality && networkQuality.level <= 2) {
        return 'bg-[var(--color-label-warning)]'
      }
      return 'bg-[var(--color-fill-success)]'
    } else if (sessionStatus === 'connecting') {
      return 'bg-[var(--color-label-warning)]'
    } else {
      return 'bg-[var(--color-label-error)]'
    }
  }

  const getStatusText = () => {
    if (sessionStatus === 'connected') {
      if (networkQuality && networkQuality.level <= 2) {
        return '네트워크 불안정'
      }
      return '연결됨'
    } else if (sessionStatus === 'connecting') {
      return '연결 중'
    } else {
      return '연결 끊어짐'
    }
  }

  return (
    <div
      className={`absolute bottom-[var(--spacing-spacing-md)] left-1/2 z-10 -translate-x-1/2 transform ${className}`}
    >
      <div className="flex items-center gap-[var(--spacing-spacing-3xs)]">
        {/* 컨트롤 버튼들 */}
        <div className="flex items-center gap-[var(--spacing-spacing-3xs)] rounded-full bg-black bg-opacity-70 px-[var(--spacing-spacing-2xs)] py-[var(--spacing-spacing-6xs)] backdrop-blur-sm">
          {controlConfigs.map((config) => (
            <ControlButton
              key={config.id}
              icon={config.icon}
              label={config.label}
              active={config.active}
              loading={loading}
              disabled={disabled || loading}
              destructive={config.destructive}
              onClick={config.action}
              tooltip={config.tooltip}
            />
          ))}
        </div>

        {/* 상태선 (표시 전용, 비상호작용) */}
        <div className="flex items-center gap-[var(--spacing-spacing-7xs)] rounded-full bg-black bg-opacity-70 px-[var(--spacing-spacing-6xs)] py-[var(--spacing-spacing-6xs)] backdrop-blur-sm">
          <div
            className={`h-2 w-2 rounded-full ${getStatusColor()}`}
          />
          <span className="font-caption text-xs text-[var(--color-fill-white)]">
            {getStatusText()}
          </span>
        </div>
      </div>
    </div>
  )
}
