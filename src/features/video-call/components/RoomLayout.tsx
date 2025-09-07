'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { useSessionStatus, useError, useLoading } from '../store'
import { useEnvironmentInfo } from '../hooks'
import ControlsBar from './ControlsBar'
import MainVideo from './MainVideo'
import ParticipantsGrid from './ParticipantsGrid'
import Sidebar from './Sidebar'
import LoadingScreen from './LoadingScreen'
import ErrorScreen from './ErrorScreen'

interface RoomLayoutProps {
  username?: string
  sessionName?: string
  reservationId?: number
  onLeaveSession?: () => void
}

function RoomLayoutInner({
  username,
  sessionName,
  reservationId,
  onLeaveSession
}: RoomLayoutProps) {
  const sessionStatus = useSessionStatus()
  const error = useError()
  const loading = useLoading()
  
  // 환경 정보 로깅 (마운트 시 1회)
  useEnvironmentInfo()

  // 로딩 상태 표시
  if (loading || sessionStatus === 'connecting') {
    return <LoadingScreen />
  }

  // 에러 상태 표시
  if (error) {
    return <ErrorScreen error={error} />
  }

  return (
    <div className="flex h-[calc(100vh-68px)] overflow-hidden bg-[var(--color-gray-900)]">
      {/* 메인 비디오 영역 */}
      <div className="flex flex-1">
        {/* 좌측 비디오 영역 */}
        <div className="relative flex flex-1 flex-col">
          {/* 메인 비디오 */}
          <div className="relative flex-1 bg-[var(--color-gray-800)]">
            <MainVideo />
          </div>

          {/* 하단 참가자 비디오 그리드 */}
          <ParticipantsGrid />

          {/* 비디오 컨트롤 */}
          <ControlsBar onLeaveSession={onLeaveSession} />
        </div>

        {/* 우측 사이드바 */}
        <Sidebar />
      </div>
    </div>
  )
}

// SSR 방지를 위한 dynamic export (WebRTC는 브라우저 전용)
const RoomLayout = dynamic(() => Promise.resolve(RoomLayoutInner), {
  ssr: false,
  loading: () => <LoadingScreen message="비디오 통화 준비 중..." />
})

export default RoomLayout