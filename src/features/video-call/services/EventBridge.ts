'use client'

import type { Session, Publisher, Subscriber } from 'openvidu-browser'

import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

import { useVideoCallStore } from '../store'
import type {
  ChatMessage,
  Participant,
  NetworkQuality,
} from '../types'

const logger = createOpenViduLogger('EventBridge')

/**
 * OpenVidu 이벤트를 Store 액션으로 매핑하는 브릿지 클래스
 */
export class EventBridge {
  private session: Session | null = null
  private isActive = false

  constructor() {
    logger.debug('EventBridge 인스턴스 생성')
  }

  // ============================================================================
  // 이벤트 브릿지 활성화/비활성화
  // ============================================================================

  activate(session: Session): void {
    if (this.isActive && this.session === session) {
      logger.debug('EventBridge 이미 활성화됨')
      return
    }

    this.deactivate()
    this.session = session
    this.isActive = true

    this.setupEventListeners()
    logger.info('EventBridge 활성화됨')
  }

  deactivate(): void {
    if (!this.isActive) {
      return
    }

    if (this.session) {
      this.removeEventListeners()
      this.session = null
    }

    this.isActive = false
    logger.info('EventBridge 비활성화됨')
  }

  // ============================================================================
  // OpenVidu 이벤트 리스너 설정
  // ============================================================================

  private setupEventListeners(): void {
    if (!this.session) return

    // 연결 생성 (참가자 입장)
    this.session.on('connectionCreated', (event) => {
      logger.info('참가자 연결 이벤트', {
        connectionId: event.connection.connectionId,
        clientData: event.connection.data,
      })

      // 연결만으로는 참가자를 추가하지 않고, 스트림이 생성될 때 추가
    })

    // 연결 해제 (참가자 퇴장)
    this.session.on('connectionDestroyed', (event) => {
      logger.info('참가자 연결 해제 이벤트', {
        connectionId: event.connection.connectionId,
      })

      // Store에서 참가자 제거
      useVideoCallStore
        .getState()
        .removeParticipant(event.connection.connectionId)
    })

    // 스트림 생성 (참가자의 미디어 스트림 생성)
    this.session.on('streamCreated', (event) => {
      logger.info('스트림 생성 이벤트', {
        streamId: event.stream.streamId,
        connectionId: event.stream.connection.connectionId,
        hasAudio: event.stream.hasAudio,
        hasVideo: event.stream.hasVideo,
        typeOfVideo: event.stream.typeOfVideo,
      })

      // 참가자 객체 생성
      const participant: Participant = {
        id: event.stream.connection.connectionId,
        connectionId: event.stream.connection.connectionId,
        nickname: event.stream.connection.data || 'Unknown User',
        isLocal: false,
        streams: {
          camera: event.stream.getMediaStream(),
        },
        audioLevel: 0,
        speaking: false,
        audioEnabled: event.stream.hasAudio,
        videoEnabled: event.stream.hasVideo,
        isScreenSharing: event.stream.typeOfVideo === 'SCREEN',
        joinedAt: new Date(),
      }

      // Store에 참가자 추가
      useVideoCallStore.getState().addParticipant(participant)

      // 자동 구독
      try {
        const subscriber = this.session!.subscribe(
          event.stream,
          undefined,
        )
        logger.debug('스트림 구독 완료', {
          streamId: event.stream.streamId,
        })
      } catch (error) {
        logger.error('스트림 구독 실패', {
          streamId: event.stream.streamId,
          error:
            error instanceof Error
              ? error.message
              : '알 수 없는 오류',
        })
      }
    })

    // 스트림 제거
    this.session.on('streamDestroyed', (event) => {
      logger.info('스트림 제거 이벤트', {
        streamId: event.stream.streamId,
        connectionId: event.stream.connection.connectionId,
      })

      // Store에서 참가자 제거
      useVideoCallStore
        .getState()
        .removeParticipant(event.stream.connection.connectionId)
    })

    // 스트림 속성 변경 (음소거/비디오 끄기 등)
    this.session.on('streamPropertyChanged', (event) => {
      logger.debug('스트림 속성 변경 이벤트', {
        streamId: event.stream.streamId,
        property: event.changedProperty,
        newValue: event.newValue,
        oldValue: event.oldValue,
      })

      const connectionId = event.stream.connection.connectionId
      const updates: Partial<Participant> = {}

      // 오디오 활성화 상태 변경
      if (event.changedProperty === 'audioActive') {
        updates.audioEnabled = event.newValue === 'true'
      }
      // 비디오 활성화 상태 변경
      else if (event.changedProperty === 'videoActive') {
        updates.videoEnabled = event.newValue === 'true'
      }
      // 비디오 차원 변경 (해상도 변경)
      else if (event.changedProperty === 'videoDimensions') {
        logger.debug('비디오 해상도 변경', {
          connectionId,
          newDimensions: event.newValue,
        })
      }

      if (Object.keys(updates).length > 0) {
        useVideoCallStore
          .getState()
          .updateParticipant(connectionId, updates)
      }
    })

    // 발화 감지 이벤트
    this.session.on('publisherStartSpeaking', (event) => {
      logger.debug('발화 시작 이벤트', {
        streamId: event.streamId,
        connectionId: event.connection.connectionId,
      })

      useVideoCallStore
        .getState()
        .setSpeaking(event.connection.connectionId, true)
    })

    this.session.on('publisherStopSpeaking', (event) => {
      logger.debug('발화 종료 이벤트', {
        streamId: event.streamId,
        connectionId: event.connection.connectionId,
      })

      useVideoCallStore
        .getState()
        .setSpeaking(event.connection.connectionId, false)
    })

    // 신호 수신 (채팅, 커스텀 메시지)
    this.session.on('signal', (event) => {
      this.handleSignal(event)
    })

    // 세션 연결 해제
    this.session.on('sessionDisconnected', (event) => {
      logger.info('세션 연결 해제 이벤트', {
        reason: event.reason,
      })

      // Store 상태 업데이트
      useVideoCallStore.getState().updateStatus('disconnected')
    })

    // 재연결 시도
    this.session.on('reconnecting', () => {
      logger.info('재연결 시도 시작')
      useVideoCallStore.getState().updateStatus('reconnecting')
    })

    this.session.on('reconnected', () => {
      logger.info('재연결 성공')
      useVideoCallStore.getState().updateStatus('connected')
    })

    // 예외 처리
    this.session.on('exception', (exception) => {
      logger.error('OpenVidu 예외 발생', {
        name: exception.name,
        message: exception.message,
      })

      const error = {
        code: exception.name,
        message: exception.message,
        type: 'connection' as const,
        recoverable: true,
      }

      useVideoCallStore.getState().setError(error)
    })

    // 네트워크 품질 변경
    if ('networkQualityLevelChanged' in this.session) {
      this.session.on(
        'networkQualityLevelChanged' as any,
        (event: any) => {
          logger.debug('네트워크 품질 변경', {
            connectionId: event.connection.connectionId,
            level: event.newValue,
          })

          // 네트워크 품질 정보 업데이트
          const quality: NetworkQuality = {
            level: parseInt(event.newValue),
            latency: 0, // 실제 구현에서는 측정된 값 사용
            jitter: 0,
            packetLoss: 0,
            bandwidth: { upload: 0, download: 0 },
          }

          useVideoCallStore
            .getState()
            .updateParticipantStats(
              event.connection.connectionId,
              quality,
            )
        },
      )
    }
  }

  private removeEventListeners(): void {
    if (!this.session) return

    // 모든 이벤트 리스너 제거
    this.session.off('connectionCreated')
    this.session.off('connectionDestroyed')
    this.session.off('streamCreated')
    this.session.off('streamDestroyed')
    this.session.off('streamPropertyChanged')
    this.session.off('publisherStartSpeaking')
    this.session.off('publisherStopSpeaking')
    this.session.off('signal')
    this.session.off('sessionDisconnected')
    this.session.off('reconnecting')
    this.session.off('reconnected')
    this.session.off('exception')

    logger.debug('OpenVidu 이벤트 리스너 제거 완료')
  }

  // ============================================================================
  // 신호 처리
  // ============================================================================

  private handleSignal(event: any): void {
    const { type, data, from } = event

    logger.debug('신호 수신', {
      type,
      from: from?.connectionId,
      dataLength: data?.length,
    })

    try {
      switch (type) {
        case 'signal:chat':
          this.handleChatMessage(data, from)
          break

        case 'signal:notification':
          this.handleNotification(data, from)
          break

        default:
          logger.debug('알 수 없는 신호 타입', { type })
      }
    } catch (error) {
      logger.error('신호 처리 실패', {
        type,
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
    }
  }

  private handleChatMessage(data: string, from: any): void {
    try {
      const messageData = JSON.parse(data)

      const chatMessage: ChatMessage = {
        id:
          messageData.id ||
          `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        senderId: from?.connectionId || 'unknown',
        senderName: from?.data || 'Unknown User',
        content: messageData.message || messageData.content || '',
        timestamp: messageData.timestamp
          ? new Date(messageData.timestamp)
          : new Date(),
        type: 'user',
      }

      logger.debug('채팅 메시지 처리', {
        messageId: chatMessage.id,
        senderId: chatMessage.senderId,
        senderName: chatMessage.senderName,
      })

      useVideoCallStore.getState().addMessage(chatMessage)
    } catch (error) {
      logger.error('채팅 메시지 파싱 실패', {
        data,
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
    }
  }

  private handleNotification(data: string, from: any): void {
    try {
      const notificationData = JSON.parse(data)

      const notificationMessage: ChatMessage = {
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        senderId: 'system',
        senderName: 'System',
        content:
          notificationData.message || notificationData.content || '',
        timestamp: new Date(),
        type: 'notification',
      }

      logger.debug('알림 메시지 처리', {
        content: notificationMessage.content,
      })

      useVideoCallStore.getState().addMessage(notificationMessage)
    } catch (error) {
      logger.error('알림 메시지 파싱 실패', {
        data,
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
    }
  }

  // ============================================================================
  // 유틸리티 메서드
  // ============================================================================

  isActivated(): boolean {
    return this.isActive
  }

  getSession(): Session | null {
    return this.session
  }
}

// 싱글톤 인스턴스
export const eventBridge = new EventBridge()
