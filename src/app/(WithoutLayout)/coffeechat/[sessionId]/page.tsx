'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import ThreeColumnLayout from '@/features/video-call/components/ThreeColumnLayout'
import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

const logger = createOpenViduLogger('CoffeeChatPage')

function CoffeeChatRoomContent({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const coffeeChatIdParam = params.id || searchParams.get('coffeeChatId')

  logger.debug('쿼리 파라미터 확인', {
    pathId: params.id,
    coffeeChatId: coffeeChatIdParam,
    hasCoffeeChatId: !!coffeeChatIdParam,
    paramsSize: searchParams.toString().length,
  })

  if (!coffeeChatIdParam) {
    logger.warn('필수 파라미터 누락', {
      missingCoffeeChatId: !coffeeChatIdParam,
      pathId: params.id,
    })

    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-gray-900)]">
        <div className="text-center text-[var(--color-fill-white)]">
          <h2 className="font-title3 mb-[var(--spacing-spacing-6xs)]">
            잘못된 접근
          </h2>
          <p className="font-body2 text-[var(--color-label-subtle)]">
            커피챗 ID가 필요합니다.
          </p>
        </div>
      </div>
    )
  }

  const coffeeChatId = parseInt(coffeeChatIdParam.trim(), 10)

  if (isNaN(coffeeChatId) || coffeeChatId <= 0) {
    logger.warn('유효하지 않은 커피챗 ID', {
      coffeeChatIdParam,
      parsedCoffeeChatId: coffeeChatId,
    })

    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-gray-900)]">
        <div className="text-center text-[var(--color-fill-white)]">
          <h2 className="font-title3 mb-[var(--spacing-spacing-6xs)]">
            유효하지 않은 커피챗 ID
          </h2>
          <p className="font-body2 text-[var(--color-label-subtle)]">
            커피챗 ID는 양의 정수여야 합니다.
          </p>
        </div>
      </div>
    )
  }

  logger.info('CoffeeChat Room 렌더링', {
    coffeeChatId,
  })

  return (
    <ThreeColumnLayout
      reservationId={coffeeChatId}
    />
  )
}

export default function CoffeeChatPage({ params }: { params: { id: string } }) {
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