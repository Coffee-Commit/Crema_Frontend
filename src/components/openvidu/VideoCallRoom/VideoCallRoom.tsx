'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, useRef } from 'react'

import ChatContainer from '@/components/openvidu/Chat/ChatContainer'
import ParticipantVideo from '@/components/openvidu/ParticipantsList/ParticipantVideo'
import VideoControls from '@/components/openvidu/VideoControls'
import { openViduTestApi } from '@/lib/openvidu/api'
import { createOpenViduLogger } from '@/lib/utils/openviduLogger'
import { useOpenViduStore } from '@/store/useOpenViduStore'

interface VideoCallRoomProps {
  username?: string
  sessionName?: string
  reservationId?: number
}

const logger = createOpenViduLogger('Room')

function VideoCallRoomInner({
  username,
  sessionName,
  reservationId,
}: VideoCallRoomProps) {
  const {
    publisher,
    participants,
    isConnected,
    loading,
    isScreenSharing,
    error,
    username: connectedUsername,
    isJoining,
    joinSequence,
    joinTestSession,
    joinSessionByReservation,
    leaveSession,
    clearError,
  } = useOpenViduStore()

  const [activeTab, setActiveTab] = useState<'chat' | 'materials'>(
    'chat',
  )
  const connectionAttempted = useRef(false)
  const currentSessionRef = useRef<{
    username: string
    sessionName: string
  } | null>(null)
  const joinSeqRef = useRef(0)
  const joinAbortKeyRef = useRef<string | null>(null)

  // 환경 정보 로깅 함수 (마운트 시 1회만 실행)
  const logEnvironmentInfo = async () => {
    try {
      // 미디어 장치 정보 확인
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioCount = devices.filter(
        (d) => d.kind === 'audioinput',
      ).length
      const videoCount = devices.filter(
        (d) => d.kind === 'videoinput',
      ).length

      // 브라우저 정보 간소화
      const userAgentParts = navigator.userAgent.split(' ')
      const browserInfo = userAgentParts[userAgentParts.length - 1]

      logger.info('환경정보', {
        브라우저: browserInfo,
        화면: `${screen.width}x${screen.height}`,
        WebRTC지원: !!window.RTCPeerConnection,
        오디오장치: audioCount,
        비디오장치: videoCount,
      })
    } catch (err) {
      logger.warn('미디어 장치 조회 실패', {
        error: err instanceof Error ? err.message : '알 수 없는 오류',
      })
    }
  }

  // Store 상태 변화 로그 제거 (너무 많은 로그 생성)

  // 컴포넌트 마운트시 환경 정보 로깅 (한 번만)
  useEffect(() => {
    logger.debug('컴포넌트 마운트', { username, sessionName })

    // 환경 정보 로깅 (마운트시 한 번만)
    logEnvironmentInfo()

    // 컴포넌트 언마운트시 세션 종료
    return () => {
      logger.debug('컴포넌트 언마운트 시작')

      // 현재 join 요청만 취소 (글로벌 취소 방지)
      if (joinAbortKeyRef.current) {
        openViduTestApi.cancelRequest(joinAbortKeyRef.current)
        joinAbortKeyRef.current = null
      }

      // 세션 종료 (비동기, 오류 무시)
      leaveSession().catch((error) => {
        // unmount 중 세션 종료 실패는 정상 (leaveRoom timeout 등)
        logger.debug('언마운트 중 세션 종료 실패 (무시)', {
          msg:
            error instanceof Error
              ? error.message
              : '알 수 없는 오류',
        })
      })

      logger.debug('컴포넌트 언마운트 완료')
    }
  }, [])

  // 페이지 나가기 이벤트 처리 (안전한 세션 정리)
  useEffect(() => {
    const handleBeforeUnload = () => {
      logger.debug('페이지 종료 감지, 세션 정리 시도')

      // best-effort로 세션 종료 시도 (실패해도 무시)
      try {
        // 현재 join 요청만 취소 (동기)
        if (joinAbortKeyRef.current) {
          openViduTestApi.cancelRequest(joinAbortKeyRef.current)
        }

        // 비동기 세션 종료는 시도만 하고 결과를 기다리지 않음
        leaveSession().catch(() => {
          // beforeunload에서는 로깅도 제한적
        })
      } catch {
        // beforeunload에서 오류 발생시 무시
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [leaveSession])

  // 세션 연결 관리 (중복 방지 강화)
  useEffect(() => {
    const isTestMode = !!username && !!sessionName
    const isProductionMode = !!reservationId

    // 모드 확인
    if (!isTestMode && !isProductionMode) {
      logger.debug('파라미터 미충족', {
        hasUsername: !!username,
        hasSessionName: !!sessionName,
        hasReservationId: !!reservationId,
      })
      return
    }

    if (isTestMode && isProductionMode) {
      logger.warn(
        '양쪽 모드 파라미터가 모두 존재함, 테스트 모드 우선',
      )
    }

    // 이미 연결 시도중이거나 연결된 경우 중복 방지
    if (
      isJoining ||
      (isConnected && connectedUsername === username)
    ) {
      logger.debug('이미 연결 시도중/연결됨, 중복 요청 무시', {
        isJoining,
        isConnected,
        connectedUsername,
        requestedUsername: username,
      })
      return
    }

    // 동일한 세션 정보인 경우 재연결 방지 (테스트 모드만)
    if (
      isTestMode &&
      currentSessionRef.current &&
      currentSessionRef.current.username === username &&
      currentSessionRef.current.sessionName === sessionName &&
      connectionAttempted.current
    ) {
      logger.debug('동일 세션 재연결 방지')
      return
    }

    // 조인 시퀀스 추적 (오래된 요청 무시를 위해)
    joinSeqRef.current = joinSequence + 1
    const myJoinSeq = joinSeqRef.current

    // 세션 정보 업데이트
    currentSessionRef.current = isTestMode
      ? { username: username!, sessionName: sessionName! }
      : { username: '', sessionName: '' }
    connectionAttempted.current = true

    logger.info('세션 연결 시작', {
      mode: isTestMode ? 'test' : 'production',
      username,
      sessionName,
      reservationId,
      joinSeq: myJoinSeq,
    })

    const joinPromise = isTestMode
      ? joinTestSession(username!, sessionName!)
      : joinSessionByReservation(reservationId!)

    joinPromise
      .then(() => {
        // 오래된 요청인지 확인
        if (joinSeqRef.current === myJoinSeq) {
          logger.debug('세션 연결 성공', {
            mode: isTestMode ? 'test' : 'production',
            username,
            sessionName,
            reservationId,
          })
        } else {
          logger.debug('오래된 연결 요청 무시', {
            myJoinSeq,
            current: joinSeqRef.current,
          })
        }
      })
      .catch((error) => {
        // 오래된 요청의 에러는 무시
        if (joinSeqRef.current === myJoinSeq) {
          logger.error('세션 연결 실패', {
            mode: isTestMode ? 'test' : 'production',
            username,
            sessionName,
            reservationId,
            error: error.message,
            joinSeq: myJoinSeq,
          })
        }
      })
  }, [
    username,
    sessionName,
    reservationId,
    isJoining,
    isConnected,
    connectedUsername,
    joinSequence,
    joinTestSession,
    joinSessionByReservation,
  ])

  const participantsList = Array.from(participants.values())

  // 탭 변경 핸들러
  const handleTabChange = (tab: 'chat' | 'materials') => {
    logger.debug('탭 변경', { from: activeTab, to: tab })
    setActiveTab(tab)
  }

  // 에러 클리어 핸들러
  const handleClearError = () => {
    logger.debug('에러 클리어')
    clearError()
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-[var(--color-gray-900)]">
        <div className="text-center text-[var(--color-fill-white)]">
          <div className="mb-[var(--spacing-spacing-md)]">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-label-primary)]"></div>
          </div>
          <p className="font-label3-semibold">연결 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-[var(--color-gray-900)] p-[var(--spacing-spacing-xs)]">
        <div className="w-full max-w-md rounded-[var(--radius-lg)] bg-[var(--color-fill-white)] p-[var(--spacing-spacing-lg)] text-center">
          <div className="mb-[var(--spacing-spacing-md)] text-[var(--color-label-error)]">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="mx-auto"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <h2 className="font-title3 mb-[var(--spacing-spacing-6xs)] text-[var(--color-label-deep)]">
            연결 실패
          </h2>
          <p className="font-body2 mb-[var(--spacing-spacing-md)] text-[var(--color-label-default)]">
            {error}
          </p>
          <button
            onClick={handleClearError}
            className="font-label4-medium rounded-[var(--radius-sm)] bg-[var(--color-fill-primary)] px-[var(--spacing-spacing-xs)] py-[var(--spacing-spacing-6xs)] text-[var(--color-fill-white)] transition-all hover:brightness-110"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-68px)] overflow-hidden bg-[var(--color-gray-900)]">
      {/* 메인 비디오 영역 */}
      <div className="flex flex-1">
        {/* 좌측 비디오 영역 */}
        <div className="relative flex flex-1 flex-col">
          {/* 메인 화면 */}
          <div className="relative flex-1 bg-[var(--color-gray-800)]">
            {publisher && isConnected ? (
              <div className="relative h-full w-full">
                <div
                  id="main-video"
                  className="h-full w-full"
                  ref={(el) => {
                    if (el && publisher) {
                      const videoElement =
                        document.createElement('video')
                      videoElement.autoplay = true
                      videoElement.playsInline = true
                      videoElement.muted = !isScreenSharing
                      videoElement.style.width = '100%'
                      videoElement.style.height = '100%'
                      videoElement.style.objectFit = 'cover'

                      el.innerHTML = ''
                      el.appendChild(videoElement)
                      publisher.addVideoElement(videoElement)
                    }
                  }}
                />

                {/* 사용자 정보 오버레이 */}
                <div className="font-caption absolute bottom-[var(--spacing-spacing-3xs)] left-[var(--spacing-spacing-3xs)] rounded-[var(--radius-xs)] bg-black bg-opacity-50 px-[var(--spacing-spacing-6xs)] py-[var(--spacing-spacing-7xs)] text-[var(--color-fill-white)]">
                  {connectedUsername || username || '나'}
                </div>
              </div>
            ) : (
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

          {/* 하단 참가자 비디오 그리드 */}
          {participantsList.length > 0 && (
            <div className="h-32 border-t border-[var(--color-gray-700)] bg-[var(--color-gray-900)]">
              <div className="flex h-full gap-[var(--spacing-spacing-6xs)] overflow-x-auto p-[var(--spacing-spacing-6xs)]">
                {participantsList.map((participant) => (
                  <ParticipantVideo
                    key={participant.connectionId}
                    participant={participant}
                    className="h-full w-24 flex-shrink-0"
                  />
                ))}
              </div>
            </div>
          )}

          {/* 비디오 컨트롤 */}
          <VideoControls />
        </div>

        {/* 우측 사이드바 */}
        <div className="flex w-80 flex-col border-l border-[var(--color-border-subtle)] bg-[var(--color-fill-white)]">
          {/* 탭 헤더 */}
          <div className="flex border-b border-[var(--color-border-subtle)]">
            <button
              onClick={() => handleTabChange('chat')}
              className={`font-label4-medium flex-1 px-[var(--spacing-spacing-2xs)] py-[var(--spacing-spacing-3xs)] transition-colors ${
                activeTab === 'chat'
                  ? 'border-b-2 border-[var(--color-label-primary)] text-[var(--color-label-primary)]'
                  : 'text-[var(--color-label-default)] hover:text-[var(--color-label-strong)]'
              }`}
            >
              채팅
            </button>
            <button
              onClick={() => handleTabChange('materials')}
              className={`font-label4-medium flex-1 px-[var(--spacing-spacing-2xs)] py-[var(--spacing-spacing-3xs)] transition-colors ${
                activeTab === 'materials'
                  ? 'border-b-2 border-[var(--color-label-primary)] text-[var(--color-label-primary)]'
                  : 'text-[var(--color-label-default)] hover:text-[var(--color-label-strong)]'
              }`}
            >
              공유 자료
            </button>
          </div>

          {/* 탭 컨텐츠 */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'chat' ? (
              <ChatContainer />
            ) : (
              <div className="flex h-full items-center justify-center p-[var(--spacing-spacing-md)]">
                <div className="text-center text-[var(--color-label-subtle)]">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="mx-auto mb-[var(--spacing-spacing-6xs)]"
                  >
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                  <p className="font-body2">공유된 자료가 없습니다</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// SSR 방지를 위한 dynamic export (WebRTC는 브라우저 전용)
const VideoCallRoom = dynamic(
  () => Promise.resolve(VideoCallRoomInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-[var(--color-gray-900)]">
        <div className="text-center text-[var(--color-fill-white)]">
          <div className="mx-auto mb-[var(--spacing-spacing-md)] h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-label-primary)]"></div>
          <p className="font-body2">비디오 통화 준비 중...</p>
        </div>
      </div>
    ),
  },
)

export default VideoCallRoom
