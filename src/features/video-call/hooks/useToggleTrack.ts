import { useCallback } from 'react'
import { useAsyncAction } from './useAsyncAction'
import { useVideoCallActions, useAudioEnabled, useVideoEnabled } from '../store'
import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

const logger = createOpenViduLogger('useToggleTrack')

export function useToggleAudio() {
  const { toggleAudio } = useVideoCallActions()
  const audioEnabled = useAudioEnabled()

  const action = useCallback(async () => {
    logger.info('오디오 토글 요청', { currentState: audioEnabled })
    await toggleAudio()
  }, [toggleAudio, audioEnabled])

  return useAsyncAction(
    action,
    'toggleAudio',
    {
      errorType: 'device',
      onError: (error) => {
        logger.error('오디오 토글 실패', { error: error.message })
      }
    }
  )
}

export function useToggleVideo() {
  const { toggleVideo } = useVideoCallActions()
  const videoEnabled = useVideoEnabled()

  const action = useCallback(async () => {
    logger.info('비디오 토글 요청', { currentState: videoEnabled })
    await toggleVideo()
  }, [toggleVideo, videoEnabled])

  return useAsyncAction(
    action,
    'toggleVideo',
    {
      errorType: 'device',
      onError: (error) => {
        logger.error('비디오 토글 실패', { error: error.message })
      }
    }
  )
}