'use client'

import {
  OpenVidu,
  Session,
  Publisher,
  Subscriber,
} from 'openvidu-browser'

import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

import type {
  OpenViduClientInterface,
  SessionInfo,
  PublisherOptions,
  EventHandlers,
  NetworkQuality,
  Participant,
} from '../types'
import { MEDIA_CONSTRAINTS as _MEDIA_CONSTRAINTS } from '../types'

const logger = createOpenViduLogger('OpenViduClient')

export class OpenViduClient implements OpenViduClientInterface {
  private openVidu: OpenVidu | null = null
  private session: Session | null = null
  private publisher: Publisher | null = null
  private subscribers: Map<string, Subscriber> = new Map()
  private eventHandlers: EventHandlers = {}

  constructor() {
    logger.debug('OpenViduClient 인스턴스 생성')
  }

  // ============================================================================
  // 초기화 및 연결
  // ============================================================================

  async init(): Promise<void> {
    if (this.openVidu) {
      logger.debug('이미 초기화됨')
      return
    }

    try {
      this.openVidu = new OpenVidu()

      // OpenVidu 로그 레벨 설정 (개발 환경에서만)
      if (process.env.NODE_ENV === 'development') {
        this.openVidu.enableProdMode()
      }

      logger.info('OpenVidu 클라이언트 초기화 완료')
    } catch (error) {
      logger.error('OpenVidu 클라이언트 초기화 실패', {
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
      throw error
    }
  }

  async connect(
    sessionInfo: SessionInfo,
    username: string,
  ): Promise<Session> {
    if (!this.openVidu) {
      await this.init()
    }

    if (this.session) {
      logger.warn('이미 세션에 연결됨')
      return this.session
    }

    try {
      logger.info('OpenVidu 세션 연결 시작', {
        sessionId: sessionInfo.id,
        username,
        serverUrl: sessionInfo.serverUrl,
      })

      // 세션 생성
      this.session = this.openVidu!.initSession()

      // 이벤트 리스너 등록
      this.setupEventListeners()

      // 세션 연결
      await this.session.connect(sessionInfo.token, {
        clientData: username,
      })

      logger.info('OpenVidu 세션 연결 완료', {
        sessionId: sessionInfo.id,
        connectionId: this.session.connection.connectionId,
      })

      return this.session
    } catch (error) {
      logger.error('OpenVidu 세션 연결 실패', {
        sessionId: sessionInfo.id,
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })

      this.session = null
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (!this.session) {
      logger.debug('연결된 세션이 없음')
      return
    }

    try {
      logger.info('OpenVidu 세션 연결 해제 시작')

      // Publisher 정리
      if (this.publisher) {
        await this.unpublish(this.publisher)
      }

      // Subscribers 정리
      this.subscribers.clear()

      // 세션 연결 해제
      await this.session.disconnect()
      this.session = null

      logger.info('OpenVidu 세션 연결 해제 완료')
    } catch (error) {
      logger.error('OpenVidu 세션 연결 해제 실패', {
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })

      // 실패해도 상태는 초기화
      this.session = null
      throw error
    }
  }

  // ============================================================================
  // Publisher 관리
  // ============================================================================

  async publish(options: PublisherOptions = {}): Promise<Publisher> {
    if (!this.session) {
      throw new Error('세션에 연결되어 있지 않습니다')
    }

    if (this.publisher) {
      logger.warn('이미 Publisher가 활성화됨')
      return this.publisher
    }

    try {
      logger.info(
        'Publisher 생성 시작',
        options as Record<string, unknown>,
      )

      const publisherOptions = {
        audioSource: options.audioSource ?? true,
        videoSource: options.videoSource ?? true,
        publishAudio: options.publishAudio ?? true,
        publishVideo: options.publishVideo ?? true,
        resolution: options.resolution ?? '1280x720',
        frameRate: options.frameRate ?? 30,
        insertMode: 'APPEND' as const,
        mirror: false,
      }

      this.publisher = await this.openVidu!.initPublisherAsync(
        undefined, // targetElement (나중에 설정)
        publisherOptions,
      )

      // 세션에 게시
      await this.session.publish(this.publisher)

      logger.info('Publisher 생성 및 게시 완료', {
        streamId: this.publisher.stream?.streamId,
        hasAudio: this.publisher.stream?.hasAudio,
        hasVideo: this.publisher.stream?.hasVideo,
      })

      return this.publisher
    } catch (error) {
      logger.error('Publisher 생성 실패', {
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })

      this.publisher = null
      throw error
    }
  }

  async unpublish(publisher: Publisher): Promise<void> {
    if (!this.session) {
      logger.warn('세션에 연결되어 있지 않음')
      return
    }

    try {
      logger.info('Publisher 게시 해제 시작')

      await this.session.unpublish(publisher)

      if (publisher === this.publisher) {
        this.publisher = null
      }

      logger.info('Publisher 게시 해제 완료')
    } catch (error) {
      logger.error('Publisher 게시 해제 실패', {
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
      throw error
    }
  }

  // ============================================================================
  // 이벤트 관리
  // ============================================================================

  subscribeToEvents(handlers: EventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers }
    logger.debug('이벤트 핸들러 등록', {
      handlerCount: Object.keys(handlers).length,
    })
  }

  private setupEventListeners(): void {
    if (!this.session) return

    // 참가자 연결
    this.session.on('connectionCreated', (event) => {
      logger.info('참가자 연결됨', {
        connectionId: event.connection.connectionId,
        clientData: event.connection.data,
      })
    })

    // 참가자 연결 해제
    this.session.on('connectionDestroyed', (event) => {
      logger.info('참가자 연결 해제됨', {
        connectionId: event.connection.connectionId,
      })
    })

    // 스트림 생성
    this.session.on('streamCreated', (event) => {
      logger.info('스트림 생성됨', {
        streamId: event.stream.streamId,
        connectionId: event.stream.connection.connectionId,
        hasAudio: event.stream.hasAudio,
        hasVideo: event.stream.hasVideo,
      })

      // 자동 구독
      const subscriber = this.session!.subscribe(
        event.stream,
        undefined,
      )
      this.subscribers.set(event.stream.streamId, subscriber)

      // 참가자 정보 구성
      const participant: Participant = {
        id: event.stream.connection.connectionId,
        connectionId: event.stream.connection.connectionId,
        nickname: event.stream.connection.data || 'Unknown',
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

      this.eventHandlers.onParticipantJoined?.(participant)
    })

    // 스트림 제거
    this.session.on('streamDestroyed', (event) => {
      logger.info('스트림 제거됨', {
        streamId: event.stream.streamId,
        connectionId: event.stream.connection.connectionId,
      })

      this.subscribers.delete(event.stream.streamId)
      this.eventHandlers.onParticipantLeft?.(
        event.stream.connection.connectionId,
      )
    })

    // 시그널 수신 (채팅 메시지)
    this.session.on('signal', (event) => {
      if (event.type === 'signal:chat') {
        try {
          const messageData = JSON.parse(event.data || '{}')
          this.eventHandlers.onChatMessage?.(messageData)
        } catch (error) {
          logger.warn('채팅 메시지 파싱 실패', {
            data: event.data,
            error:
              error instanceof Error
                ? error.message
                : '알 수 없는 오류',
          })
        }
      }
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

      this.eventHandlers.onError?.(error)
    })
  }

  // ============================================================================
  // 네트워크 통계
  // ============================================================================

  async getNetworkStats(): Promise<NetworkQuality> {
    if (!this.session || !this.publisher) {
      throw new Error(
        '세션 또는 Publisher가 활성화되어 있지 않습니다',
      )
    }

    try {
      // WebRTC stats API를 사용하여 네트워크 통계 수집
      // 실제 구현에서는 WebRTC getStats API를 사용
      // const stats = await this.publisher.stream?.getMediaStream()?.getTracks()[0]?.getStats()

      // 임시 데이터 반환 (실제로는 WebRTC stats에서 계산)
      const networkQuality: NetworkQuality = {
        level: 4, // 0-4 (4가 최고)
        latency: 50, // ms
        jitter: 2, // ms
        packetLoss: 0.01, // 0-1 (백분율)
        bandwidth: {
          upload: 1000, // kbps
          download: 1500, // kbps
        },
      }

      return networkQuality
    } catch (error) {
      logger.error('네트워크 통계 수집 실패', {
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
      throw error
    }
  }

  // ============================================================================
  // Getter 메서드
  // ============================================================================

  getSession(): Session | null {
    return this.session
  }

  getPublisher(): Publisher | null {
    return this.publisher
  }

  getSubscribers(): Map<string, Subscriber> {
    return new Map(this.subscribers)
  }

  isConnected(): boolean {
    return this.session !== null
  }
}

// 싱글톤 인스턴스
export const openViduClient = new OpenViduClient()
