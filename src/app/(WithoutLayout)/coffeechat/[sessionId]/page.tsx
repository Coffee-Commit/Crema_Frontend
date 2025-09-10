'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, use } from 'react'

import VideoCallRoom from '@/components/openvidu/VideoCallRoom'
import type { CoffeeChatPageProps } from '@/features/video-call/types/page.types'
import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

const logger = createOpenViduLogger('CoffeeChatPage')

// NOTE: Next 15's generated PageProps expects params/searchParams as Promise.
// Use a permissive type here to satisfy the type constraint during type-check.
function CoffeeChatRoomContent({ params }: CoffeeChatPageProps) {
  const searchParams = useSearchParams()
  const resolvedParams = use(params)

  // Path Param 우선, 없으면 쿼리 파라미터 fallback 허용(reservationId | coffeeChatId)
  const rawParam =
    resolvedParams.sessionId ||
    searchParams.get('reservationId') ||
    searchParams.get('coffeeChatId')

  logger.debug('파라미터 확인', {
    pathSessionId: resolvedParams.sessionId,
    queryReservationId: searchParams.get('reservationId'),
    queryCoffeeChatId: searchParams.get('coffeeChatId'),
  })

  if (!rawParam) {
    logger.warn('필수 파라미터 누락')
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

  const reservationId = parseInt(String(rawParam).trim(), 10)
  if (isNaN(reservationId) || reservationId <= 0) {
    logger.warn('유효하지 않은 예약 ID', { rawParam })
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

  logger.info('CoffeeChat Room 진입', { reservationId })

  // 레거시 테스트룸과 동일 UI/로직 구성 요소 사용
  return <VideoCallRoom reservationId={reservationId} />
}

export default function CoffeeChatPage({
  params,
}: CoffeeChatPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-gray-900)]">
          <div className="text-center text-[var(--color-fill-white)]">
            <div className="mx-auto mb-[var(--spacing-spacing-md)] h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-label-primary)]"></div>
            <p className="font-body2">커피챗 로딩 중...</p>
          </div>
        </div>
      }
    >
      <CoffeeChatRoomContent params={params} />
    </Suspense>
  )
}
