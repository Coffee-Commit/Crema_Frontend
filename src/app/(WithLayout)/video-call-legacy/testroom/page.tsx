'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

import VideoCallRoom from '@/components/openvidu/VideoCallRoom'
import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

const logger = createOpenViduLogger('Page')

function VideoCallRoomContent() {
  const searchParams = useSearchParams()
  const usernameParam = searchParams.get('username')
  const sessionNameParam = searchParams.get('sessionName')

  logger.debug('쿼리 파라미터 확인', {
    username: usernameParam,
    sessionName: sessionNameParam,
    hasUsername: !!usernameParam,
    hasSessionName: !!sessionNameParam,
    paramsSize: searchParams.toString().length,
  })

  if (!usernameParam || !sessionNameParam) {
    logger.warn('필수 파라미터 누락', {
      missingUsername: !usernameParam,
      missingSessionName: !sessionNameParam,
    })

    return (
      <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-[var(--color-gray-900)]">
        <div className="text-center text-[var(--color-fill-white)]">
          <h2 className="font-title3 mb-[var(--spacing-spacing-6xs)]">
            잘못된 접근
          </h2>
          <p className="font-body2 text-[var(--color-label-subtle)]">
            사용자명과 세션명이 모두 필요합니다.
          </p>
        </div>
      </div>
    )
  }

  const username = usernameParam.trim()
  const sessionName = sessionNameParam.trim()

  if (!username || !sessionName) {
    logger.warn('빈 파라미터', {
      emptyUsername: !username,
      emptySessionName: !sessionName,
    })

    return (
      <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-[var(--color-gray-900)]">
        <div className="text-center text-[var(--color-fill-white)]">
          <h2 className="font-title3 mb-[var(--spacing-spacing-6xs)]">
            잘못된 파라미터
          </h2>
          <p className="font-body2 text-[var(--color-label-subtle)]">
            사용자명과 세션명은 비어있을 수 없습니다.
          </p>
        </div>
      </div>
    )
  }

  logger.info('VideoCallRoom 렌더링', {
    username,
    sessionName,
  })

  return (
    <VideoCallRoom
      username={username}
      sessionName={sessionName}
    />
  )
}

export default function VideoCallRoomPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-[var(--color-gray-900)]">
          <div className="text-center text-[var(--color-fill-white)]">
            <div className="mx-auto mb-[var(--spacing-spacing-md)] h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-label-primary)]"></div>
            <p className="font-body2">로딩 중...</p>
          </div>
        </div>
      }
    >
      <VideoCallRoomContent />
    </Suspense>
  )
}
