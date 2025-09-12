import type { Session as _Session } from 'openvidu-browser'
import { StateCreator } from 'zustand'

import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

import type {
  SessionSlice,
  SessionStatus,
  SessionInfo,
  VideoCallError as _VideoCallError,
} from '../types'

const logger = createOpenViduLogger('SessionSlice')

export const createSessionSlice: StateCreator<
  SessionSlice,
  [],
  [],
  SessionSlice
> = (set, get) => ({
  // ============================================================================
  // 상태
  // ============================================================================

  status: 'idle',
  session: null,
  sessionInfo: null,
  currentUsername: null,
  joinSequence: 0,

  // ============================================================================
  // 액션
  // ============================================================================

  connect: async (sessionInfo: SessionInfo, username: string) => {
    const currentState = get()

    // 중복 연결 방지
    if (
      currentState.status === 'connecting' ||
      currentState.status === 'connected'
    ) {
      logger.warn('연결 시도 중복 방지', {
        currentStatus: currentState.status,
        newSessionId: sessionInfo.id,
      })
      return
    }

    set({
      status: 'connecting',
      sessionInfo,
      currentUsername: username,
      joinSequence: currentState.joinSequence + 1,
    })

    logger.info('세션 연결 시작', {
      sessionId: sessionInfo.id,
      username,
      sequence: currentState.joinSequence + 1,
    })

    try {
      // 실제 OpenVidu 연결 수행 (동적 import로 클라이언트 전용 보장)
      const { openViduClient } = await import(
        '../services/OpenViduClient'
      )
      const { eventBridge } = await import('../services/EventBridge')

      const session = await openViduClient.connect(
        sessionInfo,
        username,
      )

      // 이벤트 브릿지 활성화 (Store와 OpenVidu 이벤트 동기화)
      eventBridge.activate(session)

      set({
        status: 'connected',
        session,
      })

      logger.info('세션 연결 완료', {
        sessionId: sessionInfo.id,
        username,
      })
    } catch (error) {
      logger.error('세션 연결 실패', {
        sessionId: sessionInfo.id,
        username,
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })

      set({
        status: 'error',
        sessionInfo: null,
        currentUsername: null,
      })

      throw error
    }
  },

  disconnect: async () => {
    const currentState = get()

    if (
      currentState.status === 'idle' ||
      currentState.status === 'disconnected'
    ) {
      logger.debug('이미 연결 해제 상태', {
        status: currentState.status,
      })
      return
    }

    logger.info('세션 연결 해제 시작', {
      sessionId: currentState.sessionInfo?.id,
      username: currentState.currentUsername,
    })

    set({ status: 'disconnected' })

    try {
      // 실제 연결 해제 로직 수행 (동적 import)
      const { openViduClient } = await import(
        '../services/OpenViduClient'
      )
      const { eventBridge } = await import('../services/EventBridge')

      eventBridge.deactivate()
      await openViduClient.disconnect()

      set({
        status: 'idle',
        session: null,
        sessionInfo: null,
        currentUsername: null,
      })

      logger.info('세션 연결 해제 완료')
    } catch (error) {
      logger.error('세션 연결 해제 실패', {
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })

      // 실패해도 상태 초기화
      set({
        status: 'idle',
        session: null,
        sessionInfo: null,
        currentUsername: null,
      })
    }
  },

  updateStatus: (status: SessionStatus) => {
    logger.debug('세션 상태 업데이트', {
      from: get().status,
      to: status,
    })
    set({ status })
  },

  clearError: () => {
    const currentState = get()
    if (currentState.status === 'error') {
      logger.debug('에러 상태 클리어')
      set({
        status: 'idle',
        sessionInfo: null,
        currentUsername: null,
      })
    }
  },
})
