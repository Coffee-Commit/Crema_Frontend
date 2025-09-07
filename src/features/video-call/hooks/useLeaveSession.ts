import { useCallback } from 'react'
import { useAsyncAction } from './useAsyncAction'
import { useVideoCallActions } from '../store'
import { openViduNavigation } from '@/lib/openvidu/api'
import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

const logger = createOpenViduLogger('useLeaveSession')

interface UseLeaveSessionOptions {
  onLeaveComplete?: () => void
  confirmBeforeLeave?: boolean
  confirmMessage?: string
}

export function useLeaveSession(options: UseLeaveSessionOptions = {}) {
  const { disconnect } = useVideoCallActions()
  const {
    onLeaveComplete,
    confirmBeforeLeave = true,
    confirmMessage = '통화를 종료하시겠습니까?'
  } = options

  const action = useCallback(async () => {
    // 확인 다이얼로그 표시
    if (confirmBeforeLeave) {
      const confirmed = confirm(confirmMessage)
      if (!confirmed) {
        logger.debug('사용자가 통화 종료 취소')
        return
      }
    }

    logger.info('세션 종료 요청')
    
    try {
      // 세션 연결 해제
      await disconnect()
      logger.info('세션 종료 완료')
      
      // 완료 콜백 실행
      onLeaveComplete?.()
      
    } catch (error) {
      logger.error('세션 종료 중 오류 발생', {
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
      
      // 오류가 발생해도 페이지 이동은 수행 (사용자 경험 개선)
      logger.info('세션 종료 실패했지만 홈으로 이동')
      onLeaveComplete?.()
    }
  }, [disconnect, confirmBeforeLeave, confirmMessage, onLeaveComplete])

  return useAsyncAction(
    action,
    'leaveSession',
    {
      errorType: 'connection',
      onError: (error) => {
        logger.error('세션 종료 실패', { error: error.message })
        // 실패해도 홈으로 이동
        openViduNavigation.goToHome()
      }
    }
  )
}