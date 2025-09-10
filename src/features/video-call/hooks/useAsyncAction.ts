import { useState, useCallback } from 'react'

import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

import { useVideoCallActions } from '../store'
import type { AsyncAction, VideoCallError } from '../types'

const logger = createOpenViduLogger('useAsyncAction')

interface UseAsyncActionOptions {
  onError?: (error: VideoCallError) => void
  onSuccess?: () => void
  errorType?: VideoCallError['type']
}

interface UseAsyncActionReturn<T> {
  execute: () => Promise<T | undefined>
  loading: boolean
  error: Error | null
  reset: () => void
}

/**
 * 비동기 작업을 래핑하여 로딩 상태, 에러 처리, 중복 실행 방지를 제공하는 훅
 */
export function useAsyncAction<T = void>(
  action: AsyncAction<T>,
  actionName: string,
  options: UseAsyncActionOptions = {},
): UseAsyncActionReturn<T> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { setError: setGlobalError } = useVideoCallActions()

  const execute = useCallback(async (): Promise<T | undefined> => {
    // 이미 실행 중인 경우 중복 실행 방지
    if (loading) {
      logger.debug(`${actionName} 중복 실행 방지`)
      return
    }

    setLoading(true)
    setError(null)

    logger.debug(`${actionName} 실행 시작`)

    try {
      const result = await action()

      logger.debug(`${actionName} 실행 완료`)
      options.onSuccess?.()

      return result
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('알 수 없는 오류')

      logger.error(`${actionName} 실행 실패`, {
        error: error.message,
      })

      setError(error)

      // 글로벌 에러 상태 업데이트
      const videoCallError: VideoCallError = {
        code: 'ACTION_FAILED',
        message: error.message,
        type: options.errorType || 'unknown',
        recoverable: true,
      }

      setGlobalError(videoCallError)
      options.onError?.(videoCallError)

      throw error
    } finally {
      setLoading(false)
    }
  }, [action, actionName, loading, options, setGlobalError])

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
  }, [])

  return {
    execute,
    loading,
    error,
    reset,
  }
}
