'use client'

import { logger } from '@/lib/utils/logger'

interface SessionManagerProps {
  sessionId: string
  nickname: string
  onError?: (error: string) => void
}

export default function SessionManager({
  sessionId: _sessionId,
  nickname: _nickname,
  onError: _onError,
}: SessionManagerProps) {
  // SessionManager는 더 이상 사용하지 않음 - VideoCallRoom에서 직접 처리
  logger.warn(
    'SessionManager는 deprecated됨. VideoCallRoom을 직접 사용하세요.',
  )

  return null
}
