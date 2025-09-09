/**
 * OpenVidu SDK 어댑터 기본 인터페이스
 * 다양한 SDK 버전 간 호환성을 위한 추상화 레이어
 */

import type {
  Session,
  Publisher,
  Subscriber,
  ConnectionEvent,
  StreamEvent,
  SignalEvent,
} from 'openvidu-browser'

// 어댑터 공통 타입 정의
export interface AdapterPublisherConfig {
  audioSource?: boolean | string
  videoSource?: boolean | string
  publishAudio: boolean
  publishVideo: boolean
  resolution: string
  frameRate: number
  mirror?: boolean
  insertMode?: string
}

export interface AdapterSessionConfig {
  simulcast?: boolean
  dynacast?: boolean
  svc?: boolean
  reconnectAttempts?: number
}

// v3 성능 최적화 관련 타입들
export interface SimulcastLayer {
  rid: string // 'low' | 'medium' | 'high'
  resolution: string
  frameRate: number
  bitrate: number
  enabled: boolean
}

export interface QualityProfile {
  name: 'low' | 'medium' | 'high' | 'auto'
  videoProfile: {
    resolution: string
    frameRate: number
    bitrate: number
  }
  adaptiveVideo: boolean
  simulcast: boolean
  dynacast: boolean
}

export interface NetworkQualityInfo {
  level: number // 1-5 (1: poor, 5: excellent)
  latency: number
  jitter: number
  packetLoss: number
  bandwidth: {
    upload: number
    download: number
  }
}

export interface AdapterEventHandlers {
  onConnectionCreated?: (event: ConnectionEvent) => void
  onConnectionDestroyed?: (event: ConnectionEvent) => void
  onStreamCreated?: (event: StreamEvent) => void
  onStreamDestroyed?: (event: StreamEvent) => void
  onSignal?: (event: SignalEvent) => void
  onSessionDisconnected?: (event: any) => void
  onReconnecting?: () => void
  onReconnected?: () => void
  onException?: (exception: any) => void
}

/**
 * OpenVidu SDK 어댑터 인터페이스
 */
export interface OpenViduSdkAdapter {
  /**
   * SDK 버전 정보
   */
  readonly version: string
  readonly compatibility: 'v2' | 'v3'

  /**
   * 세션 관리
   */
  createSession(): Session
  connectSession(
    session: Session,
    token: string,
    connectionData?: string,
  ): Promise<void>
  disconnectSession(session: Session): void

  /**
   * Publisher 관리
   */
  createPublisher(
    session: Session,
    config: AdapterPublisherConfig,
  ): Promise<Publisher>
  publishStream(session: Session, publisher: Publisher): Promise<void>
  unpublishStream(
    session: Session,
    publisher: Publisher,
  ): Promise<void>

  /**
   * 미디어 제어
   */
  toggleAudio(publisher: Publisher, enabled: boolean): void
  toggleVideo(publisher: Publisher, enabled: boolean): void

  /**
   * 화면 공유
   */
  createScreenPublisher(
    session: Session,
    config?: Partial<AdapterPublisherConfig>,
  ): Promise<Publisher>

  /**
   * 신호/채팅
   */
  sendSignal(
    session: Session,
    type: string,
    data: string,
  ): Promise<void>

  /**
   * 이벤트 핸들러 설정
   */
  setupEventHandlers(
    session: Session,
    handlers: AdapterEventHandlers,
  ): void

  /**
   * v3 성능 최적화 기능들 (v2compatibility에서는 no-op으로 구현)
   */

  /**
   * Simulcast 레이어 제어
   */
  enableSimulcast?(
    publisher: Publisher,
    layers: SimulcastLayer[],
  ): Promise<void>
  disableSimulcast?(publisher: Publisher): Promise<void>
  updateSimulcastLayers?(
    publisher: Publisher,
    layers: Partial<SimulcastLayer>[],
  ): Promise<void>

  /**
   * Dynacast (동적 캐스팅) 제어
   */
  enableDynacast?(session: Session): Promise<void>
  disableDynacast?(session: Session): Promise<void>

  /**
   * 품질 프로파일 관리
   */
  setQualityProfile?(
    session: Session,
    profile: QualityProfile,
  ): Promise<void>
  getQualityProfile?(session: Session): QualityProfile | null

  /**
   * 자동 품질 조정
   */
  enableAdaptiveVideo?(
    publisher: Publisher,
    enabled: boolean,
  ): Promise<void>

  /**
   * 네트워크 품질 모니터링
   */
  getNetworkQuality?(
    session: Session,
  ): Promise<NetworkQualityInfo | null>
  onNetworkQualityChanged?(
    callback: (quality: NetworkQualityInfo) => void,
  ): void

  /**
   * SVC (Scalable Video Coding) 제어
   */
  enableSVC?(publisher: Publisher, layers: number): Promise<void>
  disableSVC?(publisher: Publisher): Promise<void>

  /**
   * 정리
   */
  cleanup(): void
}

/**
 * 어댑터 팩토리 인터페이스
 */
export interface AdapterFactory {
  createAdapter(
    sdkVersion: 'v2compatibility' | 'v3native',
  ): OpenViduSdkAdapter
  getSupportedVersions(): string[]
}

/**
 * 어댑터 에러 클래스
 */
export class AdapterError extends Error {
  constructor(
    public readonly adapterType: string,
    public readonly originalError: any,
    message: string,
  ) {
    super(`[${adapterType}] ${message}`)
    this.name = 'AdapterError'
  }
}

/**
 * 성능 메트릭스 인터페이스
 */
export interface PerformanceMetrics {
  connectionTime: number
  publishTime: number
  subscribeTime: number
  reconnectCount: number
  errorCount: number
  lastUpdate: Date
}

/**
 * 어댑터 상태 인터페이스
 */
export interface AdapterState {
  isInitialized: boolean
  isConnected: boolean
  activeConnections: number
  metrics: PerformanceMetrics
}
