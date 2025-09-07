import { StateCreator } from 'zustand'
import type { ChatSlice, ChatMessage } from '../types'
import { createOpenViduLogger } from '@/lib/utils/openviduLogger'
import { VIDEO_CALL_CONSTANTS } from '../types'

const logger = createOpenViduLogger('ChatSlice')

export const createChatSlice: StateCreator<
  ChatSlice,
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
    const isDuplicate = currentState.messages.some(m => m.id === message.id)
    if (isDuplicate) {
      logger.warn('중복 메시지 추가 시도', { messageId: message.id })
      return
    }

    logger.debug('채팅 메시지 추가', {
      messageId: message.id,
      senderName: message.senderName,
      type: message.type,
      contentLength: message.content.length
    })

    set((state) => ({
      messages: [...state.messages, message],
      // 시스템 메시지가 아닌 경우 읽지 않음 카운트 증가
      unreadCount: message.type === 'user' 
        ? state.unreadCount + 1 
        : state.unreadCount
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
    if (trimmedContent.length > VIDEO_CALL_CONSTANTS.CHAT_MESSAGE_MAX_LENGTH) {
      logger.warn('메시지 길이 초과', { 
        length: trimmedContent.length,
        limit: VIDEO_CALL_CONSTANTS.CHAT_MESSAGE_MAX_LENGTH
      })
      throw new Error(`메시지는 ${VIDEO_CALL_CONSTANTS.CHAT_MESSAGE_MAX_LENGTH}자를 초과할 수 없습니다.`)
    }

    logger.info('채팅 메시지 전송 시도', { 
      contentLength: trimmedContent.length 
    })

    try {
      // 메시지 ID 생성 (타임스탬프 + 랜덤)
      const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // 현재 사용자 정보 (실제 구현에서는 session에서 가져옴)
      // TODO: 실제 사용자 정보 가져오기
      const currentUser = 'current-user' // 임시
      const currentUsername = 'User' // 임시

      // 로컬 메시지 객체 생성
      const localMessage: ChatMessage = {
        id: messageId,
        senderId: currentUser,
        senderName: currentUsername,
        content: trimmedContent,
        timestamp: new Date(),
        type: 'user'
      }

      // 로컬에 먼저 추가 (낙관적 업데이트)
      get().addMessage(localMessage)

      // TODO: 실제 채팅 서비스를 통해 다른 참가자들에게 전송
      // await chatService.sendMessage(trimmedContent)
      
      logger.info('채팅 메시지 전송 완료', { messageId })
      
    } catch (error) {
      logger.error('채팅 메시지 전송 실패', {
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
      
      // 전송 실패시 로컬 메시지 제거 (rollback)
      // 실제 구현에서는 메시지 상태를 'failed'로 변경할 수도 있음
      throw error
    }
  },

  markAllAsRead: () => {
    const currentState = get()
    
    if (currentState.unreadCount === 0) {
      return
    }

    logger.debug('모든 채팅 메시지를 읽음으로 표시', { 
      unreadCount: currentState.unreadCount 
    })

    set({ unreadCount: 0 })
  },

  clearMessages: () => {
    const currentState = get()
    
    if (currentState.messages.length === 0) {
      return
    }

    logger.info('채팅 메시지 전체 삭제', { 
      messageCount: currentState.messages.length 
    })

    set({ 
      messages: [],
      unreadCount: 0
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
      type: 'system'
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
      type: 'notification'
    }
    
    logger.debug('알림 메시지 추가', { content })
    get().addMessage(notificationMessage)
  }
})