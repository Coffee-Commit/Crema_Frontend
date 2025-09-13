'use client'

import type {
  Session,
  Publisher as _Publisher,
  Subscriber as _Subscriber,
} from 'openvidu-browser'

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
      // 자기 스트림인 경우 구독/추가하지 않음 (중복 표시 방지)
      if (
        event.stream.connection.connectionId ===
        this.session?.connection?.connectionId
      ) {
        logger.debug('자기 스트림 감지됨: 구독/참가자 추가 스킵', {
          connectionId: event.stream.connection.connectionId,
        })
        return
      }

      logger.info('스트림 생성 이벤트', {
        streamId: event.stream.streamId,
        connectionId: event.stream.connection.connectionId,
        hasAudio: event.stream.hasAudio,
        hasVideo: event.stream.hasVideo,
        typeOfVideo: event.stream.typeOfVideo,
      })

      const myConnectionId = this.session?.connection?.connectionId
      const streamConnId = event.stream.connection.connectionId
      const isLocalCalculated = myConnectionId === streamConnId
      logger.debug('streamCreated 판별', {
        myConnectionId,
        streamConnId,
        isLocalCalculated,
      })

      // 참가자 객체 생성 (초기엔 MediaStream은 비워두고, 구독 완료 후 갱신)
      const participant: Participant = {
        id: event.stream.connection.connectionId,
        connectionId: event.stream.connection.connectionId,
        nickname: event.stream.connection.data || 'Unknown User',
        isLocal: isLocalCalculated,
        streams: {
          camera: undefined,
          screen: undefined,
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
      try {
        const size = useVideoCallStore.getState().participants.size
        logger.debug('참가자 추가 후 현재 수', { size })
      } catch {}

      // 자동 구독 및 구독 후 MediaStream 갱신
      try {
        const subscriber = this.session!.subscribe(
          event.stream,
          undefined,
        )

        const connectionId = event.stream.connection.connectionId

        const updateStreams = () => {
          try {
            const mediaStream = subscriber.stream.getMediaStream()

            const prev = useVideoCallStore
              .getState()
              .participants.get(connectionId)

            const nextStreams = {
              ...(prev?.streams || {}),
              ...(event.stream.typeOfVideo === 'SCREEN'
                ? { screen: mediaStream }
                : { camera: mediaStream }),
            }

            useVideoCallStore
              .getState()
              .updateParticipant(connectionId, {
                streams: nextStreams,
                audioEnabled: event.stream.hasAudio,
                videoEnabled: event.stream.hasVideo,
                isScreenSharing:
                  event.stream.typeOfVideo === 'SCREEN',
              })

            logger.debug('구독 후 스트림 갱신', {
              connectionId,
              typeOfVideo: event.stream.typeOfVideo,
              videoTracks:
                mediaStream?.getVideoTracks?.().length || 0,
              audioTracks:
                mediaStream?.getAudioTracks?.().length || 0,
            })
          } catch (e) {
            logger.warn('구독 후 스트림 갱신 실패', {
              connectionId,
              error: e instanceof Error ? e.message : String(e),
            })
          }
        }

        // 비디오 요소 생성/플레이 시점에 스트림 갱신
        // OpenVidu 동적 이벤트
        subscriber.on('videoElementCreated', updateStreams)
        // OpenVidu 동적 이벤트
        subscriber.on('streamPlaying', updateStreams)

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
      try {
        const size = useVideoCallStore.getState().participants.size
        logger.debug('참가자 제거 후 현재 수', { size })
      } catch {}
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
      this.handleSignal({
        type: event.type || '',
        data: event.data,
        from: { connectionId: event.from?.connectionId || '' },
      })
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
        'networkQualityLevelChanged' as const,
        (event: {
          connection: { connectionId: string }
          newValue: number
        }) => {
          logger.debug('네트워크 품질 변경', {
            connectionId: event.connection.connectionId,
            level: event.newValue,
          })

          // 네트워크 품질 정보 업데이트
          const quality: NetworkQuality = {
            level: event.newValue,
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

  private handleSignal(event: {
    type: string
    data: string | undefined
    from: { connectionId: string }
  }): void {
    const { type, data, from } = event

    logger.debug('신호 수신', {
      type,
      from: from?.connectionId,
      dataLength: data?.length,
    })

    if (!data) {
      logger.warn('신호 데이터가 없음', { type })
      return
    }

    try {
      switch (type) {
        case 'signal:chat':
          this.handleChatMessage(data, from)
          break

        case 'signal:notification':
          this.handleNotification(data, from)
          break

        case 'signal:file-share':
          // 파일 공유 신호는 페이지 단에서 처리하는 경우가 있어 노이즈 로그 방지
          try {
            const parsed = JSON.parse(data)
            logger.debug('파일 공유 신호 수신', {
              id: parsed?.id,
              name: parsed?.name,
              sizeBytes: parsed?.sizeBytes,
            })
          } catch {
            logger.debug('파일 공유 신호(파싱 실패)', {
              length: data?.length,
            })
          }
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

  private handleChatMessage(
    data: string,
    from: { connectionId?: string },
  ): void {
    try {
      const messageData = JSON.parse(data)

      // 자기 자신이 보낸 신호는 로컬 낙관적 추가가 이미 있으므로 무시하여 에코 방지
      try {
        const myConn =
          useVideoCallStore.getState().session?.connection
            ?.connectionId
        if (
          from?.connectionId &&
          myConn &&
          from.connectionId === myConn
        ) {
          logger.debug('자기 신호(chat) 에코 무시', {
            messageId: messageData?.id,
          })
          return
        }
      } catch {}

      const chatMessage: ChatMessage = {
        id:
          messageData.id ||
          `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        senderId: from?.connectionId || 'unknown',
        senderName: messageData.senderName || 'Unknown User',
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

  private handleNotification(
    data: string,
    _from: { connectionId?: string },
  ): void {
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
