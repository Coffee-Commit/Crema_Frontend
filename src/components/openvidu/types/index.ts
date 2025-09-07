import {
  Session,
  Publisher,
  Subscriber,
  StreamManager,
  OpenViduError,
} from 'openvidu-browser'
import type { ChatManager } from '@/lib/openvidu/chatManager'

// ============================================================================
// 공통 API 응답 구조
// ============================================================================

export interface ApiResponse<T = any> {
  code: string
  message: string
  result: T | null
}

export interface SuccessResponse<T> extends ApiResponse<T> {
  code: 'OK'
  result: T
}

export interface ErrorResponse extends ApiResponse<null> {
  code: string
  result: null
}

// ============================================================================
// API 에러 코드
// ============================================================================

export enum ApiErrorCode {
  // 일반 에러
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',

  // OpenVidu 관련 에러
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  SESSION_CREATION_FAILED = 'SESSION_CREATION_EXCEPTION',
  SESSION_CONNECT_FAILED = 'SESSION_CONNECT_FAILED',
  PARTICIPANT_NOT_FOUND = 'PARTICIPANT_NOT_FOUND',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED',
  AUTO_RECONNECT_FAILED = 'AUTO_RECONNECT_FAILED',
  OPENVIDU_CONNECTION_FAILED = 'OPENVIDU_CONNECTION_EXCEPTION',

  // 채팅 관련 에러
  CHAT_NOT_FOUND = 'CHAT_NOT_FOUND',
  CHAT_SAVE_FAILED = 'CHAT_SAVE_FAILED',
}

// ============================================================================
// 세션 참가 관련 타입
// ============================================================================

export interface QuickJoinRequest {
  // 현재는 빈 객체, 추후 필요한 필드 추가 예정
}

export interface QuickJoinResponse {
  sessionId: string
  sessionName: string
  username: string
  token: string
  openviduServerUrl: string
  apiBaseUrl: string
  webSocketUrl: string
  isNewSession: boolean
  isTokenRefresh: boolean
  isReconnection: boolean
  configInfo: VideoCallConfigInfo
}

export interface VideoCallConfigInfo {
  defaultResolution: string
  defaultFrameRate: number
  autoEnableAudio: boolean
  autoEnableVideo: boolean
  chatEnabled: boolean
}

// ============================================================================
// 세션 설정 관련 타입
// ============================================================================

export interface SessionConfigResponse {
  openviduServerUrl: string
  apiBaseUrl: string
  webSocketUrl: string
  defaultVideoConfig: VideoConfig
  supportedBrowsers: string[]
  features: VideoCallFeatures
}

export interface VideoConfig {
  resolution: string
  frameRate: number
  publishAudio: boolean
  publishVideo: boolean
}

export interface VideoCallFeatures {
  chatEnabled: boolean
  screenShareEnabled: boolean
  recordingEnabled: boolean
  virtualBackgroundEnabled: boolean
}

// ============================================================================
// 세션 상태 관련 타입
// ============================================================================

export interface SessionStatusResponse {
  sessionId: string
  sessionName: string
  isActive: boolean
  participantCount: number
  participants: ParticipantInfo[]
  createdAt: string
}

export interface ParticipantInfo {
  username: string
  connectionId: string
  joinedAt: string
  isConnected: boolean
}

// ============================================================================
// 채팅 관련 타입
// ============================================================================

export interface ChatMessageDto {
  id?: string
  username: string
  message: string
  timestamp: string
  type?: ChatMessageType
}

export enum ChatMessageType {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  NOTIFICATION = 'NOTIFICATION',
}

export interface ChatHistorySaveRequest {
  messages: ChatMessageDto[]
  sessionStartTime: string
  sessionEndTime: string
}

export interface ChatHistoryResponse {
  sessionId: string
  messages: ChatMessageDto[]
  totalCount: number
}

// ============================================================================
// OpenVidu 클라이언트 관련 타입 (기존 유지, 일부 수정)
// ============================================================================

export interface Participant {
  connectionId: string
  nickname: string
  streamManager: StreamManager
  audioEnabled: boolean
  videoEnabled: boolean
  isScreenSharing: boolean
}

// ChatMessage는 ChatMessageDto로 대체되지만 클라이언트에서 사용할 내부 타입으로 유지
export interface ChatMessage {
  id: string
  nickname: string
  message: string
  timestamp: Date
  type: 'user' | 'system'
}

// ============================================================================
// Zustand Store 관련 타입
// ============================================================================

export interface VideoCallState {
  // OpenVidu 세션 상태
  session: Session | null
  publisher: Publisher | null
  participants: Map<string, Participant>

  // 연결 상태
  isConnected: boolean
  isPublishing: boolean
  isScreenSharing: boolean
  isJoining: boolean // 조인 진행 중 플래그

  // 세션 정보
  currentSessionId: string | null
  currentReservationId: number | null // 기존 호환성을 위해 유지
  currentUsername: string | null
  currentSessionName: string | null
  sessionConfig: SessionConfigResponse | null
  username: string | null
  selfConnectionId: string | null // 로컬 연결 ID 추적
  joinSequence: number // 조인 시퀀스 번호 (HMR/중복 방지)

  // 미디어 상태
  audioEnabled: boolean
  videoEnabled: boolean
  
  // 화면공유 상태 (replaceTrack 방식)
  isScreenSharingToggling: boolean // 화면공유 토글 중 플래그
  screenPublisher: Publisher | null // 화면공유 전용 Publisher (replaceTrack 방식에서는 null)
  originalVideoTrack: MediaStreamTrack | null // replaceTrack 복원용 원본 비디오 트랙
  originalPublisher: Publisher | null // Publisher 교체 복원용 (사용되지 않음)

  // 채팅
  chatMessages: ChatMessage[]
  chatManager: ChatManager | null

  // UI 상태
  loading: boolean
  configLoading: boolean
  error: string | null

  // API 호출 추적
  apiCallCount: {
    config: number
    quickJoin: number
  }

  // LiveKit 방식 상태 추가
  connectionState:
    | 'disconnected'
    | 'connecting'
    | 'connected'
    | 'reconnecting'
    | 'failed'
  participantStates: Map<
    string,
    {
      connectionId: string
      isConnected: boolean
      lastSeen: Date
      reconnectAttempts: number
      mediaState: { audio: boolean; video: boolean }
    }
  >
  networkQuality: { level: number; latency: number } | null
}

export interface VideoCallActions {
  // 세션 관리
  joinSessionByReservation: (reservationId: number) => Promise<void>
  joinTestSession: (
    username: string,
    sessionName: string,
  ) => Promise<void>
  leaveSession: () => Promise<void>

  // 미디어 제어
  toggleAudio: () => void
  toggleVideo: () => void
  startScreenShare: () => Promise<void>
  stopScreenShare: () => Promise<void>
  toggleScreenShare: () => Promise<void>

  // 채팅
  sendChatMessage: (message: string) => Promise<void>

  // 유틸리티
  refreshToken: () => Promise<void>
  autoReconnect: () => Promise<void>
  clearError: () => void

  // LiveKit 방식 상태 관리
  updateConnectionState: (
    state:
      | 'disconnected'
      | 'connecting'
      | 'connected'
      | 'reconnecting'
      | 'failed',
  ) => void
  updateParticipantState: (
    connectionId: string,
    updates: Partial<{
      isConnected: boolean
      mediaState: { audio: boolean; video: boolean }
      reconnectAttempts: number
    }>,
  ) => void
  updateNetworkQuality: (quality: {
    level: number
    latency: number
  }) => void
  handleReconnection: () => Promise<void>

  // v3 성능 최적화 기능들
  setQualityProfile: (
    profile: 'low' | 'medium' | 'high' | 'auto',
  ) => Promise<void>
  toggleSimulcast: (enabled: boolean) => Promise<void>
  toggleDynacast: (enabled: boolean) => Promise<void>
  startNetworkQualityMonitoring: () => Promise<void>
  getCurrentNetworkQuality: () => Promise<{
    level: number
    latency: number
    jitter: number
    packetLoss: number
    bandwidth: { upload: number; download: number }
  } | null>
  toggleAdaptiveVideo: (enabled: boolean) => Promise<void>
}

export type OpenViduStore = VideoCallState & VideoCallActions

// ============================================================================
// 상수 및 유틸리티 타입
// ============================================================================

import { openViduServerConfig, featureFlags } from '@/lib/config/env'

export const OPENVIDU_CONSTANTS = {
  DEFAULT_RESOLUTION: '1280x720',
  DEFAULT_FRAME_RATE: 30,
  MAX_PARTICIPANTS: 6,
  TOKEN_EXPIRY_MINUTES: 60,
  RECONNECT_ATTEMPTS: 3,
  STATUS_CHECK_INTERVAL: 30000,
  SERVER_URL: openViduServerConfig.url,
} as const

// v3 성능 최적화 상수
export const OPENVIDU_V3_FEATURES = {
  SIMULCAST_ENABLED: featureFlags.enableSimulcast,
  DYNACAST_ENABLED: featureFlags.enableDynacast,
  SVC_ENABLED: featureFlags.enableSvc,
  QUALITY_PROFILES: {
    LOW: { resolution: '640x480', frameRate: 15, bitrate: 300 },
    MEDIUM: { resolution: '1280x720', frameRate: 24, bitrate: 800 },
    HIGH: { resolution: '1920x1080', frameRate: 30, bitrate: 1500 },
  },
} as const

export const VIDEO_RESOLUTIONS = {
  '480p': '640x480',
  '720p': '1280x720',
  '1080p': '1920x1080',
} as const

export type VideoResolution =
  (typeof VIDEO_RESOLUTIONS)[keyof typeof VIDEO_RESOLUTIONS]
export type ISODateString = string

// ============================================================================
// 타입 가드 함수
// ============================================================================

export function isSuccessResponse<T>(
  response: ApiResponse<T>,
): response is SuccessResponse<T> {
  return (
    (response.code === 'OK' || response.code === 'SUCCESS') &&
    response.result !== null
  )
}

export function isErrorResponse(
  response: ApiResponse<any>,
): response is ErrorResponse {
  return response.code !== 'OK' || response.result === null
}

// ============================================================================
// 유틸리티 타입
// ============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>
export type CreateRequest<T> = Omit<
  T,
  'id' | 'createdAt' | 'modifiedAt'
>
export type UpdateRequest<T> = Partial<
  Omit<T, 'id' | 'createdAt'>
> & { id: number }
