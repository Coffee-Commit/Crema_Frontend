import { useCallback } from 'react'

import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

import { useAsyncAction } from './useAsyncAction'
import { useVideoCallActions, useScreenSharing } from '../store'

const logger = createOpenViduLogger('useScreenShare')

export function useScreenShare() {
  const { toggleScreenShare } = useVideoCallActions()
  const screenSharing = useScreenSharing()

  const action = useCallback(async () => {
    logger.info('화면 공유 토글 요청', {
      currentState: screenSharing,
    })
    await toggleScreenShare()
  }, [toggleScreenShare, screenSharing])

  return useAsyncAction(action, 'toggleScreenShare', {
    errorType: 'permission',
    onError: (error) => {
      if (error.message.includes('NotAllowedError')) {
        logger.warn('화면 공유 권한 거부됨')
      } else {
        logger.error('화면 공유 토글 실패', { error: error.message })
      }
    },
  })
}
