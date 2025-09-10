'use client'

import dynamic from 'next/dynamic'
import React, { useEffect, useRef } from 'react'

import { useEnvironmentInfo } from '../hooks'
import {
  useSessionStatus,
  useError,
  useLoading,
  useVideoCallActions,
  usePublisher,
} from '../store'
import ErrorScreen from './ErrorScreen'
import LoadingScreen from './LoadingScreen'
import LocalVideoPanel from './LocalVideoPanel'
import ModifiedControlsBar from './ModifiedControlsBar'
import ModifiedSidebar from './ModifiedSidebar'
import RemoteVideoPanel from './RemoteVideoPanel'

interface ThreeColumnLayoutProps {
  username?: string
  sessionName?: string
  reservationId?: number
  onLeaveSession?: () => void
}

function ThreeColumnLayoutInner({
  username,
  sessionName,
  reservationId,
  onLeaveSession,
}: ThreeColumnLayoutProps) {
  const sessionStatus = useSessionStatus()
  const error = useError()
  const loading = useLoading()
  const publisher = usePublisher()
  const actions = useVideoCallActions()

  // 환경 정보 로깅 및 장치 정보 확인
  const environmentInfo = useEnvironmentInfo()

  // 세션 연결 및 Publisher 생성 (StrictMode-safe)
  const initializingRef = useRef(false)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    // React StrictMode에서 중복 실행 방지
    if (initializingRef.current) {
      return
    }
    initializingRef.current = true
    // Case 1: reservationId가 있는 경우 (정규 API 사용)
    if (reservationId) {
      if (sessionStatus !== 'idle') {
        return // 이미 연결 중이거나 연결됨
      }

      const initializeWithReservation = async () => {
        try {
          console.log(
            '🚀 예약 기반 화상통화 세션 초기화 시작',
            `reservationId:${reservationId}`,
          )

          // 1. API를 통한 Quick Join (정규 API)
          const { videoCallApiService } = await import(
            '../services/VideoCallApiService'
          )

          const apiResponse = await videoCallApiService.quickJoin({
            username: 'User', // 실제로는 API에서 받아온 사용자 정보 사용
            sessionName: `reservation-${reservationId}`,
            reservationId,
          })

          console.log(
            '✅ API Quick Join 완료',
            `${apiResponse.username}@${apiResponse.sessionId}`,
          )

          // 2. 세션 연결 (API에서 받은 정보 사용)
          await actions.connect(
            {
              id: apiResponse.sessionId,
              name: apiResponse.sessionName,
              token: apiResponse.token,
              serverUrl: apiResponse.openviduServerUrl,
            },
            apiResponse.username,
          )

          console.log('✅ 세션 연결 완료')

          // 3. Publisher 생성 (환경에 따라 조건부 비디오)
          try {
            const hasVideoDevice =
              environmentInfo?.hasVideoDevice ?? true
            console.log(
              `📹 비디오 장치 확인: ${hasVideoDevice ? '있음' : '없음 - 오디오 전용 모드'}`,
            )

            await actions.createPublisher({
              publishAudio: true, // 기본값: 마이크 켜짐
              publishVideo: hasVideoDevice, // 장치 있을 때만 비디오 켜짐
              resolution:
                apiResponse.configInfo?.defaultResolution ||
                '1280x720',
              frameRate:
                apiResponse.configInfo?.defaultFrameRate || 30,
            })
            console.log('✅ Publisher 생성 완료')

            // 4. 로컬 참가자 추가
            actions.addParticipant({
              id: `local-${Date.now()}`,
              connectionId: `local-connection-${Date.now()}`,
              nickname: apiResponse.username,
              isLocal: true,
              streams: {},
              audioLevel: 0,
              speaking: false,
              audioEnabled: true, // 기본값: 마이크 켜짐
              videoEnabled: hasVideoDevice, // 장치 있을 때만 카메라 켜짐
              isScreenSharing: false,
              joinedAt: new Date(),
            })

            console.log('✅ 로컬 참가자 추가 완료')
          } catch (error) {
            console.error('❌ Publisher 생성 실패:', error)
          }
        } catch (error) {
          console.error('❌ 예약 기반 세션 초기화 실패:', error)
        }
      }

      initializeWithReservation()

      // cleanup 함수 설정
      cleanupRef.current = async () => {
        initializingRef.current = false
        if (actions.getState().status === 'connected') {
          try {
            // Publisher 제거
            await actions.destroyPublisher?.()
            // 세션 연결 해제
            await actions.disconnect()
          } catch (error) {
            console.error('❌ cleanup 실패:', error)
          }
        }
      }
    }

    // Case 2: username과 sessionName이 있는 경우 (테스트룸)
    else if (username && sessionName) {
      if (sessionStatus !== 'idle') {
        return // 이미 연결 중이거나 연결됨
      }

      const initializeSession = async () => {
        try {
          console.log(
            '🚀 화상통화 세션 초기화 시작',
            `${username}@${sessionName}`,
          )

          // 1. 세션 연결
          await actions.connect(
            {
              id: sessionName,
              name: sessionName,
              token: '',
              serverUrl:
                process.env.NEXT_PUBLIC_OPENVIDU_SERVER_URL ||
                'https://demos.openvidu.io',
            },
            username,
          )

          console.log('✅ 세션 연결 완료')

          // 2. Publisher 생성 (환경에 따라 조건부 비디오)
          try {
            const hasVideoDevice =
              environmentInfo?.hasVideoDevice ?? true
            console.log(
              `📹 비디오 장치 확인: ${hasVideoDevice ? '있음' : '없음 - 오디오 전용 모드'}`,
            )

            await actions.createPublisher({
              publishAudio: true,
              publishVideo: hasVideoDevice, // 장치 있을 때만 비디오 켜짐
              resolution: '1280x720',
              frameRate: 30,
            })
            console.log('✅ Publisher 생성 완료')

            // 3. 로컬 참가자 추가
            actions.addParticipant({
              id: `local-${Date.now()}`,
              connectionId: `local-connection-${Date.now()}`,
              nickname: username,
              isLocal: true,
              streams: {},
              audioLevel: 0,
              speaking: false,
              audioEnabled: true,
              videoEnabled: hasVideoDevice, // 장치 있을 때만 카메라 켜짐
              isScreenSharing: false,
              joinedAt: new Date(),
            })

            console.log('✅ 로컬 참가자 추가 완료')
          } catch (error) {
            console.error('❌ Publisher 생성 실패:', error)
          }
        } catch (error) {
          console.error('❌ 세션 초기화 실패:', error)
        }
      }

      initializeSession()

      // cleanup 함수 설정
      cleanupRef.current = async () => {
        initializingRef.current = false
        if (actions.getState().status === 'connected') {
          try {
            // Publisher 제거
            await actions.destroyPublisher?.()
            // 세션 연결 해제
            await actions.disconnect()
          } catch (error) {
            console.error('❌ cleanup 실패:', error)
          }
        }
      }
    }

    // Case 3: 필수 파라미터 누락
    else {
      console.warn(
        'username과 sessionName 또는 reservationId가 필요합니다',
        {
          username,
          sessionName,
          reservationId,
        },
      )
      initializingRef.current = false
    }

    // cleanup 함수 반환 (StrictMode-safe)
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [username, sessionName, reservationId, sessionStatus, actions])

  // Publisher 생성 완료 시 로컬 참가자 ID 설정
  useEffect(() => {
    if (publisher && sessionStatus === 'connected') {
      const state: any = actions.getState?.()
      const localParticipants = Array.from(
        (state?.participants as Map<string, any>)?.values?.() ?? [],
      ).filter((p: any) => p?.isLocal)

      if (localParticipants.length > 0) {
        // 첫 번째 로컬 참가자를 현재 localParticipantId로 설정
        actions.setLocalParticipantId?.(localParticipants[0]?.id)
      }
    }
  }, [publisher, sessionStatus, actions])

  // 로딩 상태 표시
  if (loading || sessionStatus === 'connecting') {
    return <LoadingScreen />
  }

  // 에러 상태 표시
  if (error) {
    return <ErrorScreen error={error} />
  }

  return (
    <div className="grid h-full w-full grid-cols-[1fr_1fr_360px] overflow-hidden bg-[var(--color-gray-900)]">
      {/* 좌측 패널 - 상대방 비디오 */}
      <div className="relative min-h-0 min-w-0 overflow-hidden">
        <RemoteVideoPanel />
      </div>

      {/* 중앙 패널 - 내 비디오 */}
      <div className="relative min-h-0 min-w-0 overflow-hidden">
        <LocalVideoPanel />
      </div>

      {/* 우측 사이드바 - 2개 탭 (채팅/공유된 자료) */}
      <div className="min-h-0 min-w-0 overflow-hidden">
        <ModifiedSidebar />
      </div>

      {/* 하단 컨트롤바 (3열 전체에 오버레이) */}
      <ModifiedControlsBar onLeaveSession={onLeaveSession} />
    </div>
  )
}

// SSR 방지를 위한 dynamic export (WebRTC는 브라우저 전용)
const ThreeColumnLayout = dynamic(
  () => Promise.resolve(ThreeColumnLayoutInner),
  {
    ssr: false,
    loading: () => <LoadingScreen message="비디오 통화 준비 중..." />,
  },
)

export default ThreeColumnLayout
