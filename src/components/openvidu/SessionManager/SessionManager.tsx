'use client'

import { useEffect } from 'react'
import { useOpenViduStore } from '@/store/useOpenViduStore'
import { logger } from '@/lib/utils/logger'
import { openViduApi } from '@/lib/openvidu/api'
import {
  getKoreanErrorMessage,
  checkBrowserSupport,
} from '@/lib/openvidu/utils'
// import { OpenViduSessionConfig } from '@/components/openvidu/types'

interface SessionManagerProps {
  sessionId: string
  nickname: string
  onError?: (error: string) => void
}

export default function SessionManager({
  sessionId,
  nickname,
  onError,
}: SessionManagerProps) {
  // SessionManager는 더 이상 사용하지 않음 - VideoCallRoom에서 직접 처리
  logger.warn(
    'SessionManager는 deprecated됨. VideoCallRoom을 직접 사용하세요.',
  )

  return null
}
