'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

import ThreeColumnLayout from '@/features/video-call/components/ThreeColumnLayout'
import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

const logger = createOpenViduLogger('VideoCallPage')

// NOTE: Next 15 PageProps typing: allow permissive props type for type-check.
function VideoCallRoomContent({ params }: any) {
  const searchParams = useSearchParams()
  const reservationIdParam =
    params.sessionId || searchParams.get('reservationId')

  logger.debug('쿼리 파라미터 확인', {
    pathSessionId: params.sessionId,
    reservationId: reservationIdParam,
    hasReservationId: !!reservationIdParam,
    paramsSize: searchParams.toString().length,
  })

  if (!reservationIdParam) {
    logger.warn('필수 파라미터 누락', {
      missingReservationId: !reservationIdParam,
      pathSessionId: params.sessionId,
    })

    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-gray-900)]">
        <div className="text-center text-[var(--color-fill-white)]">
          <h2 className="font-title3 mb-[var(--spacing-spacing-6xs)]">
            잘못된 접근
          </h2>
          <p className="font-body2 text-[var(--color-label-subtle)]">
            예약 ID가 필요합니다.
          </p>
        </div>
      </div>
    )
  }

  const reservationId = parseInt(reservationIdParam.trim(), 10)

  if (isNaN(reservationId) || reservationId <= 0) {
    logger.warn('유효하지 않은 예약 ID', {
      reservationIdParam,
      parsedReservationId: reservationId,
    })

    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-gray-900)]">
        <div className="text-center text-[var(--color-fill-white)]">
          <h2 className="font-title3 mb-[var(--spacing-spacing-6xs)]">
            유효하지 않은 예약 ID
          </h2>
          <p className="font-body2 text-[var(--color-label-subtle)]">
            예약 ID는 양의 정수여야 합니다.
          </p>
        </div>
      </div>
    )
  }

  logger.info('VideoCallRoom 렌더링', {
    reservationId,
  })

  return <ThreeColumnLayout reservationId={reservationId} />
}

export default function VideoCallRoomPage({ params }: any) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-gray-900)]">
          <div className="text-center text-[var(--color-fill-white)]">
            <div className="mx-auto mb-[var(--spacing-spacing-md)] h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-label-primary)]"></div>
            <p className="font-body2">로딩 중...</p>
          </div>
        </div>
      }
    >
      <VideoCallRoomContent params={params} />
    </Suspense>
  )
}
