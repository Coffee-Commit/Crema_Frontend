/**
 * OpenVidu v2 어댑터 구현
 * openvidu-browser 패키지 사용
 */

import {
  OpenVidu,
  Session,
  Publisher,
  ConnectionEvent as _ConnectionEvent,
  StreamEvent as _StreamEvent,
  SignalEvent as _SignalEvent,
} from 'openvidu-browser'

import { featureFlags, getClientIceServers } from '@/lib/config/env'
import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

import type {
  OpenViduSdkAdapter,
  AdapterPublisherConfig,
  AdapterEventHandlers,
  AdapterError as _AdapterError,
  PerformanceMetrics,
  AdapterState,
  SimulcastLayer,
  QualityProfile,
  NetworkQualityInfo,
} from './base'

const logger = createOpenViduLogger('V2CompatAdapter')

/**
 * OpenVidu v2 Compatibility 어댑터
 */
export class OpenViduV2CompatibilityAdapter
  implements OpenViduSdkAdapter
{
  readonly version = '3.x-v2compatibility'
  readonly compatibility = 'v2' as const

  private openViduInstance: OpenVidu | null = null
  private state: AdapterState
  private startTimes: Map<string, number> = new Map()

  constructor() {
    this.state = {
      isInitialized: false,
      isConnected: false,
      activeConnections: 0,
      metrics: {
        connectionTime: 0,
        publishTime: 0,
        subscribeTime: 0,
        reconnectCount: 0,
        errorCount: 0,
        lastUpdate: new Date(),
      },
    }

    this.initialize()
  }

  private initialize() {
    try {
      this.openViduInstance = new OpenVidu()

      // 클라이언트 ICE 서버 설정 (테스트용)
      const clientIceServers = getClientIceServers()

      // ICE 고급 설정 - codex 권장사항 반영
      const advancedConfig: Record<string, unknown> = {
        // ICE 연결 끊김 예외 시간 조정 (기본값 4000ms → 8000ms)
        iceConnectionDisconnectedExceptionTimeout: 8000,
      }

      // ICE 서버 override가 있으면 추가
      if (clientIceServers.length > 0) {
        advancedConfig.iceServers = clientIceServers

        // 진단용: TURN relay 강제 사용 (환경변수로 제어)
        if (process.env.NEXT_PUBLIC_FORCE_RELAY === 'true') {
          advancedConfig.iceTransportPolicy = 'relay'
          logger.info(
            '🔧 TURN relay 강제 사용 모드 활성화 - NAT/방화벽 환경 대응',
          )
        }

        // codex 권장: ICE candidate 수집 강화
        advancedConfig.iceCandidatePoolSize = 10
      }

      this.openViduInstance.setAdvancedConfiguration(advancedConfig)

      logger.info('🔧 OpenVidu ICE 고급 설정 적용', {
        iceTimeout:
          advancedConfig.iceConnectionDisconnectedExceptionTimeout,
        clientIceOverride: clientIceServers.length > 0,
        forceRelay: advancedConfig.iceTransportPolicy === 'relay',
        serverCount: clientIceServers.length,
      })

      if (clientIceServers.length > 0) {
        logger.info('🔧 클라이언트 ICE 서버 상세', {
          servers: clientIceServers.map((s) => ({
            urls: s.urls,
            hasCredentials: !!(s.username && s.credential),
          })),
        })
      }

      this.state.isInitialized = true

      logger.info('v2 Compatibility 어댑터 초기화 완료', {
        version: this.version,
        clientIceOverride: clientIceServers.length > 0,
        features: {
          simulcast: featureFlags.enableSimulcast,
          dynacast: featureFlags.enableDynacast,
          svc: featureFlags.enableSvc,
        },
      })
    } catch (error) {
      logger.error('어댑터 초기화 실패', { error })
      this.handleError('initialization', error)
    }
  }

  createSession(): Session {
    if (!this.openViduInstance) {
      throw new Error('OpenVidu 인스턴스가 초기화되지 않았습니다.')
    }

    try {
      const session = this.openViduInstance.initSession()
      logger.debug('세션 생성 완료')
      return session
    } catch (error) {
      this.handleError('createSession', error)
      throw error
    }
  }

  async connectSession(
    session: Session,
    token: string,
    connectionData?: string,
  ): Promise<void> {
    const startTime = performance.now()

    // 🔍 토큰 디버깅 코드 (v2 WebSocket URL 토큰 확인용) - 보안상 디버그 모드에서만
    if (featureFlags.debugMode) {
      console.log('🔍 [TOKEN DEBUG]', {
        tokenType: typeof token,
        len: String(token).length,
        dots: (String(token).match(/\./g) || []).length,
        startsWithBearer: String(token).startsWith('Bearer '),
        firstChars: String(token).substring(0, 50) + '...',
        lastChars:
          '...' + String(token).substring(String(token).length - 50),
        // fullToken: String(token) // 보안상 제거 - 토큰 전체 내용 로깅 금지
      })
    }

    // codex 권장: ICE 이벤트 리스너 추가 (세션 연결 전에 설정)
    this.setupIceEventListeners(session)

    try {
      await session.connect(token, connectionData)

      const duration = performance.now() - startTime
      this.state.metrics.connectionTime = duration
      this.state.isConnected = true
      this.state.activeConnections++
      this.updateMetrics()

      logger.info('세션 연결 완료', { durMs: Math.round(duration) })
    } catch (error) {
      this.handleError('connectSession', error)
      throw error
    }
  }

  /**
   * codex 권장: ICE 연결 디버깅을 위한 상세 이벤트 리스너 설정
   */
  private setupIceEventListeners(session: Session): void {
    // Publisher가 생성될 때 WebRTC 이벤트 리스너 추가
    session.on('streamCreated', (event) => {
      const stream = event.stream
      if (stream.isLocal()) {
        // 로컬 스트림 (Publisher)
        this.setupWebRTCEventListeners(
          stream as unknown as {
            streamId: string
            webRtcPeer?: { pc?: RTCPeerConnection }
          },
        )
      }
    })
  }

  /**
   * WebRTC PeerConnection 레벨의 ICE 이벤트 상세 로깅
   */
  private setupWebRTCEventListeners(stream: {
    streamId: string
    webRtcPeer?: { pc?: RTCPeerConnection }
  }): void {
    try {
      const webRtcPeer = stream.webRtcPeer
      if (!webRtcPeer || !webRtcPeer.pc) return

      const pc = webRtcPeer.pc as RTCPeerConnection

      logger.info('🔧 WebRTC 이벤트 리스너 설정 완료', {
        streamId: stream.streamId,
      })

      // codex 권장: ICE candidate error 로깅
      pc.addEventListener('icecandidateerror', (event) => {
        logger.error('❌ ICE Candidate Error', {
          errorCode: event.errorCode,
          errorText: event.errorText,
          url: event.url,
          timestamp: new Date().toISOString(),
        })
      })

      // ICE gathering state 변화 로깅
      pc.addEventListener('icegatheringstatechange', () => {
        logger.info('🔄 ICE Gathering State Changed', {
          state: pc.iceGatheringState,
          timestamp: new Date().toISOString(),
        })
      })

      // ICE connection state 변화 상세 로깅
      pc.addEventListener('iceconnectionstatechange', () => {
        logger.info('🔄 ICE Connection State Changed', {
          state: pc.iceConnectionState,
          timestamp: new Date().toISOString(),
        })

        // 연결 실패 시 상세 정보 수집
        if (
          pc.iceConnectionState === 'failed' ||
          pc.iceConnectionState === 'disconnected'
        ) {
          this.logIceCandidateStats(pc)
        }
      })

      // Connection state 변화 로깅
      pc.addEventListener('connectionstatechange', () => {
        logger.info('🔄 Connection State Changed', {
          state: pc.connectionState,
          timestamp: new Date().toISOString(),
        })
      })

      // ICE candidate 수집 로깅 (codex 권장)
      pc.addEventListener('icecandidate', (event) => {
        if (event.candidate) {
          logger.debug('🧊 ICE Candidate', {
            type: event.candidate.type,
            protocol: event.candidate.protocol,
            address: event.candidate.address || 'N/A',
            port: event.candidate.port || 'N/A',
            priority: event.candidate.priority,
            foundation: event.candidate.foundation,
            component: event.candidate.component,
            timestamp: new Date().toISOString(),
          })
        } else {
          logger.info('🧊 ICE Candidate 수집 완료', {
            timestamp: new Date().toISOString(),
          })
        }
      })
    } catch (error) {
      logger.warn('WebRTC 이벤트 리스너 설정 실패', { error })
    }
  }

  /**
   * codex 권장: ICE candidate 통계 및 실패 원인 분석
   */
  private async logIceCandidateStats(
    pc: RTCPeerConnection,
  ): Promise<void> {
    try {
      const stats = await pc.getStats()
      const candidates: Array<{
        id: string
        type: string
        candidateType?: string
        protocol?: string
        address?: string
        port?: number
        priority?: number
      }> = []
      const candidatePairs: Array<{
        id: string
        localCandidateId?: string
        remoteCandidateId?: string
        state?: string
        nominated?: boolean
        writable?: boolean
        readable?: boolean
        bytesSent?: number
        bytesReceived?: number
        currentRoundTripTime?: number
        availableOutgoingBitrate?: number
      }> = []

      stats.forEach((report) => {
        if (
          report.type === 'local-candidate' ||
          report.type === 'remote-candidate'
        ) {
          candidates.push({
            id: report.id,
            type: report.type,
            candidateType: report.candidateType,
            protocol: report.protocol,
            address: report.address,
            port: report.port,
            priority: report.priority,
          })
        } else if (report.type === 'candidate-pair') {
          candidatePairs.push({
            id: report.id,
            state: report.state,
            nominated: report.nominated,
            writable: report.writable,
            readable: report.readable,
            bytesSent: report.bytesSent,
            bytesReceived: report.bytesReceived,
            currentRoundTripTime: report.currentRoundTripTime,
            availableOutgoingBitrate: report.availableOutgoingBitrate,
          })
        }
      })

      logger.error('📊 ICE Connection Failed - 상세 분석', {
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        totalCandidates: candidates.length,
        candidatesByType: candidates.reduce(
          (acc: Record<string, number>, c) => {
            const key = `${c.type}_${c.candidateType}`
            acc[key] = (acc[key] || 0) + 1
            return acc
          },
          {},
        ),
        candidatePairs: candidatePairs.length,
        successfulPairs: candidatePairs.filter(
          (p) => p.state === 'succeeded',
        ).length,
        failedPairs: candidatePairs.filter(
          (p) => p.state === 'failed',
        ).length,
        timestamp: new Date().toISOString(),
      })

      // TURN candidate가 없으면 경고
      const turnCandidates = candidates.filter(
        (c) => c.candidateType === 'relay',
      )
      if (turnCandidates.length === 0) {
        logger.warn(
          '⚠️ TURN relay candidate가 없습니다. TURN 서버 설정을 확인하세요.',
          {
            availableCandidateTypes: [
              ...new Set(candidates.map((c) => c.candidateType)),
            ],
          },
        )
      }
    } catch (error) {
      logger.error('ICE 통계 수집 실패', { error })
    }
  }

  disconnectSession(session: Session): void {
    try {
      // WebSocket 상태 확인 후 안전한 연결 해제
      const ws = (
        session as unknown as {
          openvidu?: { openviduWS?: { webSocket?: WebSocket } }
        }
      )?.openvidu?.openviduWS?.webSocket
      const wsOpen = ws && ws.readyState === WebSocket.OPEN

      if (wsOpen && typeof session.disconnect === 'function') {
        logger.debug('WebSocket 열림 상태, 정상 연결 해제 시도')
        session.disconnect()
        logger.info('세션 연결 해제 완료')
      } else {
        logger.debug('WebSocket 닫힘 또는 세션 무효, 상태만 정리')
      }

      // 상태는 항상 업데이트 (WebSocket 상태와 관계없이)
      this.state.isConnected = false
      this.state.activeConnections = Math.max(
        0,
        this.state.activeConnections - 1,
      )
      this.updateMetrics()
    } catch (error) {
      // leaveRoom timeout 등은 debug 레벨로 처리 (unmount 시점에서 정상)
      if (
        error instanceof Error &&
        error.message.includes('leaveRoom')
      ) {
        logger.debug('세션 연결 해제 중 leaveRoom 오류 (무시)', {
          msg: error.message,
        })
      } else {
        this.handleError('disconnectSession', error)
      }

      // 오류 발생 시에도 상태는 정리
      this.state.isConnected = false
      this.state.activeConnections = Math.max(
        0,
        this.state.activeConnections - 1,
      )
      this.updateMetrics()
    }
  }

  async createPublisher(
    session: Session,
    config: AdapterPublisherConfig,
  ): Promise<Publisher> {
    const startTime = performance.now()

    try {
      if (!this.openViduInstance) {
        throw new Error('OpenVidu 인스턴스가 없습니다.')
      }

      // 미디어 장치 사전 확인
      const actualConfig = { ...config }

      try {
        const devices =
          await navigator.mediaDevices.enumerateDevices()
        const hasVideoInput = devices.some(
          (device) => device.kind === 'videoinput',
        )
        const hasAudioInput = devices.some(
          (device) => device.kind === 'audioinput',
        )

        logger.debug('미디어 장치 확인', {
          hasVideoInput,
          hasAudioInput,
          videoInputCount: devices.filter(
            (d) => d.kind === 'videoinput',
          ).length,
          audioInputCount: devices.filter(
            (d) => d.kind === 'audioinput',
          ).length,
        })

        // 비디오 장치가 없으면 오디오 전용으로 폴백
        if (!hasVideoInput && config.publishVideo) {
          logger.warn('비디오 장치 없음, 오디오 전용으로 폴백')
          actualConfig.publishVideo = false
          actualConfig.videoSource = false
        }

        // 오디오 장치가 없으면 비디오 전용으로 폴백
        if (!hasAudioInput && config.publishAudio) {
          logger.warn('오디오 장치 없음, 비디오 전용으로 폴백')
          actualConfig.publishAudio = false
          actualConfig.audioSource = false
        }
      } catch (deviceError) {
        logger.warn('미디어 장치 열거 실패, 기본 설정 유지', {
          deviceError,
        })
      }

      // v2 호환성 설정 변환
      const publisherOptions = {
        audioSource: actualConfig.audioSource,
        videoSource: actualConfig.videoSource,
        publishAudio: actualConfig.publishAudio,
        publishVideo: actualConfig.publishVideo,
        resolution: actualConfig.resolution,
        frameRate: actualConfig.frameRate,
        insertMode: actualConfig.insertMode || 'APPEND',
        mirror:
          actualConfig.mirror !== undefined
            ? actualConfig.mirror
            : false,
      }

      // v3 성능 기능이 활성화된 경우 추가 설정
      if (featureFlags.enableSimulcast && actualConfig.publishVideo) {
        ;(
          publisherOptions as unknown as { simulcast?: boolean }
        ).simulcast = true
      }

      // Publisher 초기화 시도 (에러 발생시 재시도)
      let publisher: Publisher
      try {
        publisher = this.openViduInstance.initPublisher(
          undefined,
          publisherOptions,
        )
      } catch (initError: unknown) {
        // 비디오 장치 관련 에러인 경우 오디오 전용으로 재시도
        if (
          (initError as Error)?.name ===
            'INPUT_VIDEO_DEVICE_NOT_FOUND' ||
          (initError as Error)?.message?.includes('NotFoundError') ||
          (initError as Error)?.message?.includes(
            'Requested device not found',
          )
        ) {
          logger.warn('비디오 장치 에러로 인한 오디오 전용 재시도', {
            errorName: (initError as Error).name,
            errorMessage: (initError as Error).message,
          })

          const audioOnlyOptions = {
            ...publisherOptions,
            publishVideo: false,
            videoSource: false,
          }

          publisher = this.openViduInstance.initPublisher(
            undefined,
            audioOnlyOptions,
          )
        } else {
          throw initError
        }
      }

      const duration = performance.now() - startTime
      logger.debug('Publisher 생성 완료', {
        durMs: Math.round(duration),
        publishAudio: actualConfig.publishAudio,
        publishVideo: actualConfig.publishVideo,
      })

      return publisher
    } catch (error) {
      this.handleError('createPublisher', error)
      throw error
    }
  }

  async publishStream(
    session: Session,
    publisher: Publisher,
  ): Promise<void> {
    const startTime = performance.now()

    try {
      await session.publish(publisher)

      const duration = performance.now() - startTime
      this.state.metrics.publishTime = duration
      this.updateMetrics()

      logger.debug('스트림 발행 완료', {
        durMs: Math.round(duration),
      })
    } catch (error) {
      this.handleError('publishStream', error)
      throw error
    }
  }

  async unpublishStream(
    session: Session,
    publisher: Publisher,
  ): Promise<void> {
    try {
      await session.unpublish(publisher)
      logger.debug('스트림 발행 해제 완료')
    } catch (error) {
      this.handleError('unpublishStream', error)
      throw error
    }
  }

  toggleAudio(publisher: Publisher, enabled: boolean): void {
    try {
      publisher.publishAudio(enabled)
      logger.debug('오디오 토글', { enabled })
    } catch (error) {
      this.handleError('toggleAudio', error)
    }
  }

  toggleVideo(publisher: Publisher, enabled: boolean): void {
    try {
      publisher.publishVideo(enabled)
      logger.debug('비디오 토글', { enabled })
    } catch (error) {
      this.handleError('toggleVideo', error)
    }
  }

  async createScreenPublisher(
    session: Session,
    config?: Partial<AdapterPublisherConfig>,
  ): Promise<Publisher> {
    try {
      if (!this.openViduInstance) {
        throw new Error('OpenVidu 인스턴스가 없습니다.')
      }

      const screenConfig = {
        videoSource: 'screen',
        publishAudio:
          config?.publishAudio !== undefined
            ? config.publishAudio
            : false,
        publishVideo: true,
        ...config,
      }

      const screenPublisher = this.openViduInstance.initPublisher(
        undefined,
        screenConfig,
      )
      logger.debug('화면 공유 Publisher 생성 완료')

      return screenPublisher
    } catch (error) {
      this.handleError('createScreenPublisher', error)
      throw error
    }
  }

  async sendSignal(
    session: Session,
    type: string,
    data: string,
  ): Promise<void> {
    try {
      await session.signal({
        data: data,
        type: type,
      })
      logger.debug('신호 전송 완료', { type })
    } catch (error) {
      this.handleError('sendSignal', error)
      throw error
    }
  }

  setupEventHandlers(
    session: Session,
    handlers: AdapterEventHandlers,
  ): void {
    try {
      // 연결 이벤트
      if (handlers.onConnectionCreated) {
        session.on('connectionCreated', handlers.onConnectionCreated)
      }

      if (handlers.onConnectionDestroyed) {
        session.on(
          'connectionDestroyed',
          handlers.onConnectionDestroyed,
        )
      }

      // 스트림 이벤트
      if (handlers.onStreamCreated) {
        session.on('streamCreated', handlers.onStreamCreated)
      }

      if (handlers.onStreamDestroyed) {
        session.on('streamDestroyed', handlers.onStreamDestroyed)
      }

      // 신호 이벤트
      if (handlers.onSignal) {
        session.on('signal:chat', handlers.onSignal)
      }

      // 세션 이벤트
      if (handlers.onSessionDisconnected) {
        session.on(
          'sessionDisconnected',
          handlers.onSessionDisconnected,
        )
      }

      // 재연결 이벤트
      if (handlers.onReconnecting) {
        session.on('reconnecting', handlers.onReconnecting)
      }

      if (handlers.onReconnected) {
        session.on('reconnected', () => {
          this.state.metrics.reconnectCount++
          this.updateMetrics()
          handlers.onReconnected?.()
        })
      }

      // 예외 이벤트
      if (handlers.onException) {
        session.on('exception', (exception) => {
          this.state.metrics.errorCount++
          this.updateMetrics()
          handlers.onException?.(exception)
        })
      }

      logger.debug('이벤트 핸들러 설정 완료')
    } catch (error) {
      this.handleError('setupEventHandlers', error)
    }
  }

  cleanup(): void {
    try {
      this.openViduInstance = null
      this.state.isInitialized = false
      this.state.isConnected = false
      this.state.activeConnections = 0
      this.startTimes.clear()

      logger.info('어댑터 정리 완료')
    } catch (error) {
      this.handleError('cleanup', error)
    }
  }

  // 상태 정보 접근자
  getState(): AdapterState {
    return { ...this.state }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.state.metrics }
  }

  private handleError(operation: string, error: unknown): void {
    this.state.metrics.errorCount++
    this.updateMetrics()

    logger.error(`${operation} 실패`, {
      msg: error instanceof Error ? error.message : '알 수 없는 오류',
      code: (error as Error & { code?: string })?.code,
    })
  }

  private updateMetrics(): void {
    this.state.metrics.lastUpdate = new Date()
  }

  // ========================================================================
  // v3 성능 최적화 기능들 (v2compatibility에서는 no-op으로 구현)
  // ========================================================================

  /**
   * Simulcast 기능들 (v2에서는 지원하지 않음)
   */
  async enableSimulcast(
    publisher: Publisher,
    layers: SimulcastLayer[],
  ): Promise<void> {
    logger.warn('Simulcast는 v2 호환 모드에서 지원하지 않습니다', {
      layerCount: layers.length,
    })
    // no-op: v2에서는 자동으로 단일 레이어만 전송
  }

  async disableSimulcast(_publisher: Publisher): Promise<void> {
    logger.debug('Simulcast 비활성화 (v2에서는 no-op)')
    // no-op: 이미 단일 레이어만 사용
  }

  async updateSimulcastLayers(
    _publisher: Publisher,
    _layers: Partial<SimulcastLayer>[],
  ): Promise<void> {
    logger.warn(
      'Simulcast 레이어 업데이트는 v2 호환 모드에서 지원하지 않습니다',
    )
    // no-op
  }

  /**
   * Dynacast 기능들 (v2에서는 기본 동작)
   */
  async enableDynacast(_session: Session): Promise<void> {
    logger.debug('Dynacast 활성화 (v2에서는 기본 동작)')
    // no-op: v2에서는 기본적으로 adaptive 동작
  }

  async disableDynacast(_session: Session): Promise<void> {
    logger.debug('Dynacast 비활성화 (v2에서는 no-op)')
    // no-op
  }

  /**
   * 품질 프로파일 관리 (v2에서는 제한적 지원)
   */
  async setQualityProfile(
    session: Session,
    profile: QualityProfile,
  ): Promise<void> {
    logger.info('품질 프로파일 설정 시뮬레이션', {
      profile: profile.name,
      resolution: profile.videoProfile.resolution,
      bitrate: profile.videoProfile.bitrate,
    })

    // v2에서는 Publisher 생성 시에만 품질 설정 가능
    // 런타임 변경은 제한적이므로 로그만 남김
  }

  getQualityProfile(_session: Session): QualityProfile | null {
    // v2에서는 현재 품질 정보를 정확히 추적하기 어려우므로 기본값 반환
    return {
      name: 'medium',
      videoProfile: {
        resolution: '1280x720',
        frameRate: 30,
        bitrate: 800,
      },
      adaptiveVideo: true,
      simulcast: false,
      dynacast: true,
    }
  }

  /**
   * 자동 품질 조정 (v2에서는 제한적 지원)
   */
  async enableAdaptiveVideo(
    publisher: Publisher,
    enabled: boolean,
  ): Promise<void> {
    logger.info('적응형 비디오 설정', { enabled })
    // v2에서는 네트워크 상황에 따라 자동 조정되지만 세밀한 제어는 불가능
  }

  /**
   * 네트워크 품질 모니터링 (v2에서는 시뮬레이션)
   */
  async getNetworkQuality(
    _session: Session,
  ): Promise<NetworkQualityInfo | null> {
    // v2에서는 WebRTC stats API로 대략적인 품질 정보만 제공
    try {
      return {
        level: 4, // 임시 값 - 실제로는 WebRTC stats 분석 필요
        latency: 50,
        jitter: 10,
        packetLoss: 0.1,
        bandwidth: {
          upload: 1000,
          download: 1500,
        },
      }
    } catch (error) {
      logger.error('네트워크 품질 조회 실패', { error })
      return null
    }
  }

  onNetworkQualityChanged(
    _callback: (quality: NetworkQualityInfo) => void,
  ): void {
    logger.debug('네트워크 품질 변경 모니터링 설정')
    // v2에서는 주기적으로 체크하는 방식으로 구현 가능하지만 여기서는 no-op
  }

  /**
   * SVC 기능들 (v2에서는 지원하지 않음)
   */
  async enableSVC(
    publisher: Publisher,
    layers: number,
  ): Promise<void> {
    logger.warn('SVC는 v2 호환 모드에서 지원하지 않습니다', {
      layers,
    })
    // no-op: SVC는 v3의 LiveKit에서만 지원
  }

  async disableSVC(_publisher: Publisher): Promise<void> {
    logger.debug('SVC 비활성화 (v2에서는 no-op)')
    // no-op
  }
}
