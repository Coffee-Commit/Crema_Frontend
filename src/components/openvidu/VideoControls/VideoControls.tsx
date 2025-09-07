'use client'

import { useState } from 'react'
import { useOpenViduStore } from '@/store/useOpenViduStore'
import { openViduNavigation } from '@/lib/openvidu/api'
import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

const logger = createOpenViduLogger('VideoControls')

export default function VideoControls() {
  const {
    audioEnabled,
    videoEnabled,
    isScreenSharing,
    isJoining,
    loading,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    leaveSession,
  } = useOpenViduStore()

  // 액션 로딩 상태 관리
  const [isTogglingAudio, setIsTogglingAudio] = useState(false)
  const [isTogglingVideo, setIsTogglingVideo] = useState(false)
  const [isTogglingScreen, setIsTogglingScreen] = useState(false)
  const [isLeavingCall, setIsLeavingCall] = useState(false)

  const handleToggleAudio = async () => {
    if (isTogglingAudio || loading || isJoining) {
      logger.debug('오디오 토글 중복 클릭 방지', { isTogglingAudio, loading, isJoining })
      return
    }

    setIsTogglingAudio(true)
    logger.debug('오디오 토글 시작', { currentState: audioEnabled })
    
    try {
      await toggleAudio()
      logger.debug('오디오 토글 완료', { newState: !audioEnabled })
    } catch (error) {
      logger.error('오디오 토글 실패', { error })
    } finally {
      setIsTogglingAudio(false)
    }
  }

  const handleToggleVideo = async () => {
    if (isTogglingVideo || loading || isJoining) {
      logger.debug('비디오 토글 중복 클릭 방지', { isTogglingVideo, loading, isJoining })
      return
    }

    setIsTogglingVideo(true)
    logger.debug('비디오 토글 시작', { currentState: videoEnabled })
    
    try {
      await toggleVideo()
      logger.debug('비디오 토글 완료', { newState: !videoEnabled })
    } catch (error) {
      logger.error('비디오 토글 실패', { error })
    } finally {
      setIsTogglingVideo(false)
    }
  }

  const handleToggleScreenShare = async () => {
    if (isTogglingScreen || loading || isJoining) {
      logger.debug('화면공유 토글 중복 클릭 방지', { isTogglingScreen, loading, isJoining })
      return
    }

    setIsTogglingScreen(true)
    logger.debug('화면공유 토글 시작', { currentState: isScreenSharing })
    
    try {
      await toggleScreenShare()
      logger.debug('화면공유 토글 완료', { newState: !isScreenSharing })
    } catch (error) {
      logger.error('화면공유 토글 실패', { error, action: isScreenSharing ? 'stop' : 'start' })
    } finally {
      setIsTogglingScreen(false)
    }
  }

  const handleLeaveCall = async () => {
    if (isLeavingCall || loading) {
      logger.debug('통화 종료 중복 클릭 방지', { isLeavingCall, loading })
      return
    }

    const confirmed = confirm('통화를 종료하시겠습니까?')
    if (!confirmed) {
      logger.debug('사용자가 통화 종료 취소')
      return
    }

    setIsLeavingCall(true)
    logger.info('통화 종료 시작')
    
    try {
      await leaveSession()
      logger.debug('세션 종료 완료, 홈으로 이동')
      
      // 라우팅은 세션 정리 후 수행
      openViduNavigation.goToHome()
    } catch (error) {
      logger.error('통화 종료 실패', { error })
      // 실패해도 홈으로 이동 (사용자 경험 개선)
      openViduNavigation.goToHome()
    } finally {
      setIsLeavingCall(false)
    }
  }

  return (
    <div className="absolute bottom-[var(--spacing-spacing-md)] left-1/2 z-10 -translate-x-1/2 transform">
      <div className="flex items-center gap-[var(--spacing-spacing-3xs)] rounded-full bg-black bg-opacity-70 px-[var(--spacing-spacing-2xs)] py-[var(--spacing-spacing-6xs)] backdrop-blur-sm">
        {/* 음소거 버튼 */}
        <button
          onClick={handleToggleAudio}
          disabled={isTogglingAudio || loading || isJoining}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 ${
            isTogglingAudio || loading || isJoining
              ? 'bg-[var(--color-gray-400)] text-[var(--color-label-subtle)] cursor-not-allowed opacity-60'
              : audioEnabled
                ? 'bg-[var(--color-gray-600)] text-[var(--color-fill-white)]'
                : 'bg-[var(--color-label-error)] text-[var(--color-fill-white)]'
          }`}
          aria-label={audioEnabled ? '음소거' : '음소거 해제'}
        >
          {isTogglingAudio ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          ) : audioEnabled ? (
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
          )}
        </button>

        {/* 비디오 토글 버튼 */}
        <button
          onClick={handleToggleVideo}
          disabled={isTogglingVideo || loading || isJoining}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 ${
            isTogglingVideo || loading || isJoining
              ? 'bg-[var(--color-gray-400)] text-[var(--color-label-subtle)] cursor-not-allowed opacity-60'
              : videoEnabled
                ? 'bg-[var(--color-gray-600)] text-[var(--color-fill-white)]'
                : 'bg-[var(--color-label-error)] text-[var(--color-fill-white)]'
          }`}
          aria-label={videoEnabled ? '비디오 끄기' : '비디오 켜기'}
        >
          {isTogglingVideo ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          ) : videoEnabled ? (
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
          )}
        </button>

        {/* 화면 공유 버튼 */}
        <button
          onClick={handleToggleScreenShare}
          disabled={isTogglingScreen || loading || isJoining}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 ${
            isTogglingScreen || loading || isJoining
              ? 'bg-[var(--color-gray-400)] text-[var(--color-label-subtle)] cursor-not-allowed opacity-60'
              : isScreenSharing
                ? 'bg-[var(--color-fill-primary)] text-[var(--color-fill-white)]'
                : 'bg-[var(--color-gray-600)] text-[var(--color-fill-white)]'
          }`}
          aria-label={
            isScreenSharing ? '화면 공유 중지' : '화면 공유'
          }
        >
          {isTogglingScreen ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          ) : isScreenSharing ? (
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
          )}
        </button>

        {/* 통화 종료 버튼 */}
        <button
          onClick={handleLeaveCall}
          disabled={isLeavingCall || loading}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 ${
            isLeavingCall || loading
              ? 'bg-[var(--color-gray-400)] text-[var(--color-label-subtle)] cursor-not-allowed opacity-60'
              : 'bg-[var(--color-label-error)] text-[var(--color-fill-white)] hover:scale-110 hover:brightness-110'
          }`}
          aria-label="통화 종료"
        >
          {isLeavingCall ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.68.28-.53 0-.97-.43-.97-.96V9.72C2.21 7.93 6.87 6 12 6s9.79 1.93 10.53 3.72v5.17c0 .53-.44.96-.97.96-.25 0-.5-.1-.68-.28-.79-.73-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
