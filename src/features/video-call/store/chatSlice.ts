import type { Session as _Session } from 'openvidu-browser'
import { StateCreator } from 'zustand'

import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

import type { ChatSlice, ChatMessage } from '../types'
import { VIDEO_CALL_CONSTANTS } from '../types'

// VideoCallStore 타입 임시 정의 (순환 참조 방지)
type VideoCallStore = ChatSlice & {
  localParticipantId: string | null
  currentUsername: string | null
  // 실제 Store에는 SessionSlice가 병합되어 있으며, 여기서 타입만 확장해 접근합니다.
  session: _Session | null
}

const logger = createOpenViduLogger('ChatSlice')

export const createChatSlice: StateCreator<
  VideoCallStore,
  [],
  [],
  ChatSlice
> = (set, get) => ({
  // ============================================================================
  // 상태
  // ============================================================================

  messages: [],
  unreadCount: 0,

  // ============================================================================
  // 액션
  // ============================================================================

  addMessage: (message: ChatMessage) => {
    const currentState = get()

    // 중복 메시지 방지
    const isDuplicate = currentState.messages.some(
      (m) => m.id === message.id,
    )
    if (isDuplicate) {
      logger.debug('중복 메시지 추가 시도', { messageId: message.id })
      return
    }

    logger.debug('채팅 메시지 추가', {
      messageId: message.id,
      senderName: message.senderName,
      type: message.type,
      contentLength: message.content.length,
    })

    set((state) => ({
      messages: [...state.messages, message],
      // 시스템 메시지가 아닌 경우 읽지 않음 카운트 증가
      unreadCount:
        message.type === 'user'
          ? state.unreadCount + 1
          : state.unreadCount,
    }))
  },

  sendMessage: async (content: string) => {
    // 빈 메시지 또는 공백만 있는 메시지 방지
    const trimmedContent = content.trim()
    if (!trimmedContent) {
      logger.warn('빈 메시지 전송 시도')
      return
    }

    // 메시지 길이 제한
    if (
      trimmedContent.length >
      VIDEO_CALL_CONSTANTS.CHAT_MESSAGE_MAX_LENGTH
    ) {
      logger.warn('메시지 길이 초과', {
        length: trimmedContent.length,
        limit: VIDEO_CALL_CONSTANTS.CHAT_MESSAGE_MAX_LENGTH,
      })
      throw new Error(
        `메시지는 ${VIDEO_CALL_CONSTANTS.CHAT_MESSAGE_MAX_LENGTH}자를 초과할 수 없습니다.`,
      )
    }

    logger.info('채팅 메시지 전송 시도', {
      contentLength: trimmedContent.length,
    })

    let pendingMessageId: string | null = null
    try {
      // 메시지 ID 생성 (타임스탬프 + 랜덤)
      const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      pendingMessageId = messageId

      // 현재 사용자 정보를 store에서 가져오기
      const state = get()
      const currentUser = state.localParticipantId ?? 'local'
      const currentUsername = state.currentUsername ?? 'Me'

      // 로컬 메시지 객체 생성
      const localMessage: ChatMessage = {
        id: messageId,
        senderId: currentUser,
        senderName: currentUsername,
        content: trimmedContent,
        timestamp: new Date(),
        type: 'user',
      }

      // 로컬에 먼저 추가 (낙관적 업데이트)
      get().addMessage(localMessage)

      // 실제 OpenVidu 세션을 통해 시그널 전송
      const session = state.session
      if (!session) {
        // 롤백 처리
        set((s) => ({
          messages: s.messages.filter((m) => m.id !== messageId),
          unreadCount: s.unreadCount > 0 ? s.unreadCount - 1 : 0,
        }))
        throw new Error(
          '세션이 준비되지 않았습니다. 연결 상태를 확인해주세요.',
        )
      }

      const payload = {
        id: messageId,
        message: trimmedContent,
        timestamp: localMessage.timestamp.toISOString(),
        // EventBridge는 senderName을 사용하므로 명시적으로 포함
        senderName: currentUsername,
      }

      await session.signal({
        type: 'chat',
        data: JSON.stringify(payload),
      })

      logger.info('채팅 메시지 전송 완료', { messageId })
    } catch (error) {
      logger.error('채팅 메시지 전송 실패', {
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })

      // 전송 실패시 로컬 메시지 제거 (rollback)
      // 참고: 현재 unreadCount는 사용자 메시지에도 증가하므로, 최소한의 보정만 수행합니다.
      try {
        const idToRemove = pendingMessageId
        if (idToRemove) {
          set((s) => ({
            messages: s.messages.filter((m) => m.id !== idToRemove),
            unreadCount: s.unreadCount > 0 ? s.unreadCount - 1 : 0,
          }))
        }
      } catch {
        // noop - 롤백 보조 실패는 무시
      }

      throw error
    }
  },

  markAllAsRead: () => {
    const currentState = get()

    if (currentState.unreadCount === 0) {
      return
    }

    logger.debug('모든 채팅 메시지를 읽음으로 표시', {
      unreadCount: currentState.unreadCount,
    })

    set({ unreadCount: 0 })
  },

  clearMessages: () => {
    const currentState = get()

    if (currentState.messages.length === 0) {
      return
    }

    logger.info('채팅 메시지 전체 삭제', {
      messageCount: currentState.messages.length,
    })

    set({
      messages: [],
      unreadCount: 0,
    })
  },

  // ============================================================================
  // 내부 헬퍼 메서드
  // ============================================================================

  addSystemMessage: (content: string) => {
    const systemMessage: ChatMessage = {
      id: `system-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderId: 'system',
      senderName: 'System',
      content,
      timestamp: new Date(),
      type: 'system',
    }

    logger.debug('시스템 메시지 추가', { content })
    get().addMessage(systemMessage)
  },

  addNotificationMessage: (content: string) => {
    const notificationMessage: ChatMessage = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderId: 'system',
      senderName: 'System',
      content,
      timestamp: new Date(),
      type: 'notification',
    }

    logger.debug('알림 메시지 추가', { content })
    get().addMessage(notificationMessage)
  },
})
