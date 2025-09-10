/**
 * 개선된 채팅 관리 시스템
 * OpenVidu v3 / LiveKit 방식의 신뢰성 있는 메시지 전송
 */

import type { Session, SignalEvent } from 'openvidu-browser'

import type { ChatMessage } from '@/components/openvidu/types'
import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

const logger = createOpenViduLogger('ChatManager')

// 채팅 설정 상수
export const CHAT_CONFIG = {
  MAX_MESSAGE_SIZE: 1024, // 1KB - OpenVidu 신호 크기 제한
  MAX_CHUNK_SIZE: 800, // 청킹을 위한 안전한 크기
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1초
  DUPLICATE_WINDOW: 5000, // 5초 내 중복 감지
  RATE_LIMIT: 10, // 10초당 최대 메시지 수
  RATE_WINDOW: 10000, // 10초
  BUFFER_TIMEOUT: 60000, // 60초 - 불완전한 버퍼 타임아웃
  MAX_BUFFERS: 100, // 최대 버퍼 수
} as const

export interface ChatManagerConfig {
  maxMessageSize?: number
  maxChunkSize?: number
  retryAttempts?: number
  retryDelay?: number
  enableChunking?: boolean
  enableOrdering?: boolean
  enableDeduplication?: boolean
}

export interface ChatMessageChunk {
  id: string
  messageId: string
  chunkIndex: number
  totalChunks: number
  data: string
  timestamp: number
}

export interface PendingMessage {
  id: string
  content: string
  attempts: number
  timestamp: Date
  resolve: (success: boolean) => void
}

export interface MessageBuffer {
  messageId: string
  chunks: Map<number, ChatMessageChunk>
  totalChunks: number
  receivedChunks: number
  createdAt: Date
}

/**
 * 채팅 관리자 클래스
 */
export class ChatManager {
  private config: Required<ChatManagerConfig>
  private messageQueue: PendingMessage[] = []
  private sending = false
  private recentMessages = new Map<string, number>() // 중복 방지
  private messageBuffers = new Map<string, MessageBuffer>() // 청킹된 메시지 버퍼
  private messageHistory: string[] = [] // 순서 보장을 위한 히스토리
  private rateLimitCounter = 0
  private rateLimitWindow = Date.now()
  private bufferCleanupInterval: number | null = null

  constructor(
    private session: Session,
    private username: string,
    private onMessageReceived: (message: ChatMessage) => void,
    config: ChatManagerConfig = {},
  ) {
    this.config = {
      maxMessageSize:
        config.maxMessageSize ?? CHAT_CONFIG.MAX_MESSAGE_SIZE,
      maxChunkSize: config.maxChunkSize ?? CHAT_CONFIG.MAX_CHUNK_SIZE,
      retryAttempts:
        config.retryAttempts ?? CHAT_CONFIG.RETRY_ATTEMPTS,
      retryDelay: config.retryDelay ?? CHAT_CONFIG.RETRY_DELAY,
      enableChunking: config.enableChunking ?? true,
      enableOrdering: config.enableOrdering ?? true,
      enableDeduplication: config.enableDeduplication ?? true,
    }

    this.setupSignalHandlers()
    this.startBufferCleanup()

    logger.info('채팅 관리자 초기화', {
      config: this.config,
      username: this.username,
    })
  }

  /**
   * 메시지 전송
   */
  async sendMessage(content: string): Promise<boolean> {
    const trimmed = content.trim()
    if (!trimmed) {
      logger.warn('빈 메시지 전송 시도 무시')
      return false
    }

    // 속도 제한 확인
    if (!this.checkRateLimit()) {
      logger.warn('채팅 속도 제한 초과')
      throw new Error(
        '메시지를 너무 빠르게 보내고 있습니다. 잠시 후 다시 시도해주세요.',
      )
    }

    // 메시지 크기 확인 (UTF-8 바이트 기준)
    const messageSize = new TextEncoder().encode(trimmed).length
    if (messageSize > this.config.maxMessageSize) {
      if (this.config.enableChunking) {
        return this.sendChunkedMessage(trimmed)
      } else {
        logger.warn('메시지 크기 초과', {
          size: messageSize,
          limit: this.config.maxMessageSize,
        })
        throw new Error(
          `메시지가 너무 큽니다. 최대 ${this.config.maxMessageSize}바이트까지 가능합니다.`,
        )
      }
    }

    return this.sendSingleMessage(trimmed)
  }

  /**
   * 단일 메시지 전송
   */
  private async sendSingleMessage(content: string): Promise<boolean> {
    const messageId = this.generateMessageId()

    return new Promise((resolve) => {
      const pendingMessage: PendingMessage = {
        id: messageId,
        content,
        attempts: 0,
        timestamp: new Date(),
        resolve,
      }

      this.messageQueue.push(pendingMessage)
      this.processQueue()
    })
  }

  /**
   * 청킹된 메시지 전송
   */
  private async sendChunkedMessage(
    content: string,
  ): Promise<boolean> {
    const messageId = this.generateMessageId()
    const chunks = this.chunkMessage(content, messageId)

    logger.info('메시지 청킹', {
      messageId,
      totalChunks: chunks.length,
      originalSize: content.length,
    })

    // 모든 청크 전송
    const results = await Promise.allSettled(
      chunks.map((chunk) => this.sendChunk(chunk)),
    )

    const successCount = results.filter(
      (r) => r.status === 'fulfilled' && r.value,
    ).length
    const success = successCount === chunks.length

    if (success) {
      logger.info('청킹된 메시지 전송 완료', { messageId })
    } else {
      logger.error('청킹된 메시지 전송 실패', {
        messageId,
        successCount,
        totalChunks: chunks.length,
      })
    }

    return success
  }

  /**
   * 메시지를 청크로 분할
   */
  private chunkMessage(
    content: string,
    messageId: string,
  ): ChatMessageChunk[] {
    const encoder = new TextEncoder()
    const bytes = encoder.encode(content)
    const chunks: ChatMessageChunk[] = []
    const chunkSize = this.config.maxChunkSize
    const totalChunks = Math.ceil(bytes.length / chunkSize)

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, bytes.length)
      const chunkBytes = bytes.slice(start, end)
      const chunkData = new TextDecoder().decode(chunkBytes)

      chunks.push({
        id: this.generateChunkId(),
        messageId,
        chunkIndex: i,
        totalChunks,
        data: chunkData,
        timestamp: Date.now(),
      })
    }

    return chunks
  }

  /**
   * 청크 전송
   */
  private async sendChunk(chunk: ChatMessageChunk): Promise<boolean> {
    return new Promise((resolve) => {
      const chunkData = JSON.stringify(chunk)

      this.session
        .signal({
          data: chunkData,
          type: 'chat-chunk',
        })
        .then(() => {
          logger.debug('청크 전송 성공', {
            messageId: chunk.messageId,
            chunkIndex: chunk.chunkIndex,
          })
          resolve(true)
        })
        .catch((error) => {
          logger.error('청크 전송 실패', {
            messageId: chunk.messageId,
            chunkIndex: chunk.chunkIndex,
            error,
          })
          resolve(false)
        })
    })
  }

  /**
   * 메시지 큐 처리
   */
  private async processQueue(): Promise<void> {
    if (this.sending || this.messageQueue.length === 0) return

    this.sending = true

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue[0]
      const success = await this.attemptSend(message)

      if (success) {
        this.messageQueue.shift()
        message.resolve(true)
      } else {
        message.attempts++

        if (message.attempts >= this.config.retryAttempts) {
          this.messageQueue.shift()
          message.resolve(false)
          logger.error('메시지 전송 최종 실패', {
            messageId: message.id,
            attempts: message.attempts,
          })
        } else {
          logger.warn('메시지 재전송 대기', {
            messageId: message.id,
            attempt: message.attempts,
          })
          await this.delay(this.config.retryDelay * message.attempts)
        }
      }
    }

    this.sending = false
  }

  /**
   * 메시지 전송 시도
   */
  private async attemptSend(
    message: PendingMessage,
  ): Promise<boolean> {
    try {
      const signalData = JSON.stringify({
        id: message.id,
        message: message.content,
        timestamp: message.timestamp.toISOString(),
        username: this.username,
      })

      await this.session.signal({
        data: signalData,
        type: 'chat',
      })

      logger.debug('메시지 전송 성공', { messageId: message.id })
      return true
    } catch (error) {
      logger.warn('메시지 전송 실패', {
        messageId: message.id,
        attempt: message.attempts + 1,
        error,
      })
      return false
    }
  }

  /**
   * 신호 핸들러 설정
   */
  private setupSignalHandlers(): void {
    // 일반 채팅 메시지
    this.session.on('signal:chat', (event: SignalEvent) => {
      try {
        const data = JSON.parse(event.data || '{}')
        // 런타임 검증
        if (this.isValidChatData(data)) {
          this.handleReceivedMessage(data, event.from)
        } else {
          logger.warn('유효하지 않은 채팅 데이터', { data })
        }
      } catch (error) {
        logger.warn('채팅 메시지 파싱 실패', {
          error,
          data: event.data,
        })
      }
    })

    // 청킹된 메시지
    this.session.on('signal:chat-chunk', (event: SignalEvent) => {
      try {
        const chunk: ChatMessageChunk = JSON.parse(event.data || '{}')
        // 런타임 검증
        if (this.isValidChunkData(chunk)) {
          this.handleReceivedChunk(chunk, event.from)
        } else {
          logger.warn('유효하지 않은 청크 데이터', { chunk })
        }
      } catch (error) {
        logger.warn('채팅 청크 파싱 실패', {
          error,
          data: event.data,
        })
      }
    })
  }

  /**
   * 수신된 메시지 처리
   */
  private handleReceivedMessage(data: any, from: any): void {
    // 중복 메시지 확인
    if (
      this.config.enableDeduplication &&
      this.isDuplicateMessage(data.id)
    ) {
      logger.debug('중복 메시지 무시', { messageId: data.id })
      return
    }

    // 안전한 connection.data 파싱
    let participantData: any = {}
    try {
      if (from?.data) {
        // '%/%' 구분자 처리
        const parts = from.data.split('%/%')
        if (parts.length === 1) {
          // 순수 JSON 또는 문자열
          const trimmed = parts[0].trim()
          if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            participantData = JSON.parse(trimmed)
          } else {
            participantData = { nickname: trimmed, username: trimmed }
          }
        } else {
          // 레거시 혼합 포맷
          const jsonPart = parts[1]?.trim()
          if (
            jsonPart &&
            jsonPart.startsWith('{') &&
            jsonPart.endsWith('}')
          ) {
            participantData = JSON.parse(jsonPart)
          } else {
            participantData = {
              nickname: parts[0],
              username: parts[0],
            }
          }
        }
      }
    } catch (error) {
      logger.debug('참가자 데이터 파싱 실패, 기본값 사용', {
        error,
        raw: from?.data,
      })
      participantData = { nickname: '사용자', username: '사용자' }
    }

    const nickname =
      participantData.nickname ||
      participantData.username ||
      data.username ||
      '익명'

    const chatMessage: ChatMessage = {
      id: data.id,
      nickname,
      message: data.message,
      timestamp: new Date(data.timestamp),
      type: 'user',
    }

    // 순서 보장
    if (this.config.enableOrdering) {
      this.addToMessageHistory(data.id)
    }

    this.onMessageReceived(chatMessage)

    logger.debug('채팅 메시지 수신', {
      messageId: data.id,
      from: nickname,
      length: data.message.length,
    })
  }

  /**
   * 수신된 청크 처리
   */
  private handleReceivedChunk(
    chunk: ChatMessageChunk,
    from: any,
  ): void {
    const { messageId, chunkIndex, totalChunks } = chunk

    // 버퍼 확인/생성
    if (!this.messageBuffers.has(messageId)) {
      // 버퍼 수 제한 체크
      if (this.messageBuffers.size >= CHAT_CONFIG.MAX_BUFFERS) {
        this.evictOldestBuffer()
      }

      this.messageBuffers.set(messageId, {
        messageId,
        chunks: new Map(),
        totalChunks,
        receivedChunks: 0,
        createdAt: new Date(),
      })
    }

    const buffer = this.messageBuffers.get(messageId)!

    // 청크 저장
    if (!buffer.chunks.has(chunkIndex)) {
      buffer.chunks.set(chunkIndex, chunk)
      buffer.receivedChunks++
    }

    logger.debug('채팅 청크 수신', {
      messageId,
      chunkIndex,
      totalChunks,
      receivedChunks: buffer.receivedChunks,
    })

    // 모든 청크 수신 완료시 메시지 조립
    if (buffer.receivedChunks === totalChunks) {
      this.assembleChunkedMessage(buffer, from)
      this.messageBuffers.delete(messageId)
    }
  }

  /**
   * 청킹된 메시지 조립
   */
  private assembleChunkedMessage(
    buffer: MessageBuffer,
    from: any,
  ): void {
    const sortedChunks = Array.from(buffer.chunks.values()).sort(
      (a, b) => a.chunkIndex - b.chunkIndex,
    )

    const fullMessage = sortedChunks
      .map((chunk) => chunk.data)
      .join('')

    // 안전한 connection.data 파싱 (assembleChunkedMessage)
    let participantData: any = {}
    try {
      if (from?.data) {
        // '%/%' 구분자 처리
        const parts = from.data.split('%/%')
        if (parts.length === 1) {
          const trimmed = parts[0].trim()
          if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            participantData = JSON.parse(trimmed)
          } else {
            participantData = { nickname: trimmed, username: trimmed }
          }
        } else {
          const jsonPart = parts[1]?.trim()
          if (
            jsonPart &&
            jsonPart.startsWith('{') &&
            jsonPart.endsWith('}')
          ) {
            participantData = JSON.parse(jsonPart)
          } else {
            participantData = {
              nickname: parts[0],
              username: parts[0],
            }
          }
        }
      }
    } catch (error) {
      logger.debug('청킹 메시지 참가자 데이터 파싱 실패', {
        error,
        raw: from?.data,
      })
      participantData = { nickname: '사용자', username: '사용자' }
    }

    const nickname =
      participantData.nickname || participantData.username || '익명'

    const chatMessage: ChatMessage = {
      id: buffer.messageId,
      nickname,
      message: fullMessage,
      timestamp: new Date(sortedChunks[0].timestamp),
      type: 'user',
    }

    this.onMessageReceived(chatMessage)

    logger.info('청킹된 메시지 조립 완료', {
      messageId: buffer.messageId,
      from: nickname,
      totalChunks: buffer.totalChunks,
      finalLength: fullMessage.length,
    })
  }

  /**
   * 속도 제한 확인
   */
  private checkRateLimit(): boolean {
    const now = Date.now()

    // 새로운 윈도우 시작
    if (now - this.rateLimitWindow > CHAT_CONFIG.RATE_WINDOW) {
      this.rateLimitCounter = 0
      this.rateLimitWindow = now
    }

    if (this.rateLimitCounter >= CHAT_CONFIG.RATE_LIMIT) {
      return false
    }

    this.rateLimitCounter++
    return true
  }

  /**
   * 중복 메시지 확인
   */
  private isDuplicateMessage(messageId: string): boolean {
    const now = Date.now()
    const existing = this.recentMessages.get(messageId)

    if (existing && now - existing < CHAT_CONFIG.DUPLICATE_WINDOW) {
      return true
    }

    this.recentMessages.set(messageId, now)

    // 오래된 항목 정리
    for (const [id, timestamp] of this.recentMessages) {
      if (now - timestamp > CHAT_CONFIG.DUPLICATE_WINDOW) {
        this.recentMessages.delete(id)
      }
    }

    return false
  }

  /**
   * 메시지 히스토리에 추가
   */
  private addToMessageHistory(messageId: string): void {
    this.messageHistory.push(messageId)

    // 히스토리 크기 제한 (최근 100개)
    if (this.messageHistory.length > 100) {
      this.messageHistory = this.messageHistory.slice(-100)
    }
  }

  /**
   * 유틸리티 메소드들
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateChunkId(): string {
    return `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * 버퍼 정리 시작
   */
  private startBufferCleanup(): void {
    this.bufferCleanupInterval = window.setInterval(() => {
      this.cleanupExpiredBuffers()
    }, CHAT_CONFIG.BUFFER_TIMEOUT / 2) // 30초마다 정리
  }

  /**
   * 만료된 버퍼 정리
   */
  private cleanupExpiredBuffers(): void {
    const now = Date.now()
    const expiredBuffers: string[] = []

    for (const [messageId, buffer] of this.messageBuffers) {
      if (
        now - buffer.createdAt.getTime() >
        CHAT_CONFIG.BUFFER_TIMEOUT
      ) {
        expiredBuffers.push(messageId)
      }
    }

    for (const messageId of expiredBuffers) {
      this.messageBuffers.delete(messageId)
      logger.debug('만료된 버퍼 제거', { messageId })
    }

    if (expiredBuffers.length > 0) {
      logger.info('버퍼 정리 완료', {
        removedCount: expiredBuffers.length,
      })
    }
  }

  /**
   * 가장 오래된 버퍼 제거 (LRU)
   */
  private evictOldestBuffer(): void {
    let oldestMessageId: string | null = null
    let oldestTime = Infinity

    for (const [messageId, buffer] of this.messageBuffers) {
      if (buffer.createdAt.getTime() < oldestTime) {
        oldestTime = buffer.createdAt.getTime()
        oldestMessageId = messageId
      }
    }

    if (oldestMessageId) {
      this.messageBuffers.delete(oldestMessageId)
      logger.debug('최대 용량 초과로 오래된 버퍼 제거', {
        messageId: oldestMessageId,
      })
    }
  }

  /**
   * 정리
   */
  cleanup(): void {
    if (this.bufferCleanupInterval) {
      clearInterval(this.bufferCleanupInterval)
      this.bufferCleanupInterval = null
    }

    this.messageQueue.length = 0
    this.messageBuffers.clear()
    this.recentMessages.clear()
    this.messageHistory.length = 0

    logger.info('채팅 관리자 정리 완료')
  }

  /**
   * 런타임 데이터 검증 유틸리티
   */
  private isValidChatData(data: any): boolean {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.id === 'string' &&
      typeof data.message === 'string' &&
      typeof data.timestamp === 'string' &&
      typeof data.username === 'string'
    )
  }

  private isValidChunkData(chunk: any): boolean {
    return (
      typeof chunk === 'object' &&
      chunk !== null &&
      typeof chunk.id === 'string' &&
      typeof chunk.messageId === 'string' &&
      typeof chunk.chunkIndex === 'number' &&
      typeof chunk.totalChunks === 'number' &&
      typeof chunk.data === 'string' &&
      typeof chunk.timestamp === 'number'
    )
  }

  /**
   * 상태 정보 반환
   */
  getStatus() {
    return {
      queueLength: this.messageQueue.length,
      pendingBuffers: this.messageBuffers.size,
      recentMessages: this.recentMessages.size,
      historyLength: this.messageHistory.length,
      rateLimitCounter: this.rateLimitCounter,
      sending: this.sending,
    }
  }
}
