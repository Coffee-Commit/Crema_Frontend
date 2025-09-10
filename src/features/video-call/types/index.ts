// ============================================================================
// 비디오콜 Feature 타입 정의
// ============================================================================

import type {
  Session,
  Publisher,
  Subscriber as _Subscriber,
  StreamManager as _StreamManager,
  OpenViduError as _OpenViduError,
} from 'openvidu-browser'

// ============================================================================
// 기본 도메인 타입
// ============================================================================

export interface Participant {
  id: string
  connectionId: string
  nickname: string
  isLocal: boolean
  streams: {
    camera?: MediaStream
    screen?: MediaStream
  }
  audioLevel: number
  speaking: boolean
  audioEnabled: boolean
  videoEnabled: boolean
  isScreenSharing: boolean
  joinedAt: Date
}

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: Date
  type: 'user' | 'system' | 'notification'
}

// ============================================================================
// 세션 상태 타입
// ============================================================================

export type SessionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error'

export interface SessionInfo {
  id: string
  name: string
  token: string
  serverUrl: string
  reservationId?: number
}

// ============================================================================
// 미디어 디바이스 타입
// ============================================================================

export interface MediaDevice {
  deviceId: string
  label: string
  kind: 'audioinput' | 'videoinput' | 'audiooutput'
}

export interface MediaSettings {
  audioEnabled: boolean
  videoEnabled: boolean
  selectedAudioInput?: string
  selectedVideoInput?: string
  selectedAudioOutput?: string
  screenSharing: boolean
}

// ============================================================================
// 네트워크 품질 타입
// ============================================================================

export interface NetworkQuality {
  level: number // 0-4 (4가 최고)
  latency: number // ms
  jitter: number // ms
  packetLoss: number // 0-1 (백분율)
  bandwidth: {
    upload: number // kbps
    download: number // kbps
  }
}

// ============================================================================
// 에러 타입
// ============================================================================

export interface VideoCallError {
  code: string
  message: string
  type: 'connection' | 'permission' | 'device' | 'network' | 'unknown'
  recoverable: boolean
}

// ============================================================================
// UI 상태 타입
// ============================================================================

export type SidebarTab =
  | 'chat'
  | 'participants'
  | 'settings'
  | 'network'

export interface UIState {
  activeTab: SidebarTab
  sidebarVisible: boolean
  fullscreenMode: boolean
  pinnedParticipantId?: string
  layoutMode: 'grid' | 'speaker' | 'sidebar'
}

// ============================================================================
// Store 슬라이스 타입들
// ============================================================================

export interface SessionSlice {
  // 상태
  status: SessionStatus
  session: Session | null
  sessionInfo: SessionInfo | null
  currentUsername: string | null
  joinSequence: number

  // 액션
  connect: (
    sessionInfo: SessionInfo,
    username: string,
  ) => Promise<void>
  disconnect: () => Promise<void>
  updateStatus: (status: SessionStatus) => void
  clearError: () => void
}

export interface ParticipantsSlice {
  // 상태
  participants: Map<string, Participant>
  localParticipantId: string | null
  pinnedParticipantId: string | null

  // 액션
  addParticipant: (participant: Participant) => void
  updateParticipant: (
    id: string,
    updates: Partial<Participant>,
  ) => void
  removeParticipant: (id: string) => void
  pinParticipant: (id: string | null) => void
  setSpeaking: (id: string, speaking: boolean) => void
}

export interface MediaSlice {
  // 상태
  publisher: Publisher | null
  settings: MediaSettings
  availableDevices: MediaDevice[]
  screenPublisher: Publisher | null

  // 액션
  updateSettings: (updates: Partial<MediaSettings>) => void
  toggleAudio: () => Promise<void>
  toggleVideo: () => Promise<void>
  toggleScreenShare: () => Promise<void>
  updateDevices: () => Promise<void>
  selectDevice: (
    kind: MediaDevice['kind'],
    deviceId: string,
  ) => Promise<void>
}

export interface ChatSlice {
  // 상태
  messages: ChatMessage[]
  unreadCount: number

  // 액션
  addMessage: (message: ChatMessage) => void
  sendMessage: (content: string) => Promise<void>
  markAllAsRead: () => void
  clearMessages: () => void
}

export interface UISlice {
  // 상태
  ui: UIState
  loading: boolean
  error: VideoCallError | null

  // 액션
  setActiveTab: (tab: SidebarTab) => void
  toggleSidebar: () => void
  toggleFullscreen: () => void
  setLayoutMode: (mode: UIState['layoutMode']) => void
  setError: (error: VideoCallError | null) => void
  setLoading: (loading: boolean) => void
}

export interface NetworkSlice {
  // 상태
  quality: NetworkQuality | null
  connectionStats: Map<string, NetworkQuality>
  monitoring: boolean

  // 액션
  updateQuality: (quality: NetworkQuality) => void
  updateParticipantStats: (
    participantId: string,
    stats: NetworkQuality,
  ) => void
  startMonitoring: () => void
  stopMonitoring: () => void
}

// ============================================================================
// 서비스 인터페이스 타입
// ============================================================================

export interface OpenViduClientInterface {
  init: () => Promise<void>
  connect: (
    sessionInfo: SessionInfo,
    username: string,
  ) => Promise<Session>
  disconnect: () => Promise<void>
  publish: (options?: PublisherOptions) => Promise<Publisher>
  unpublish: (publisher: Publisher) => Promise<void>
  subscribeToEvents: (handlers: EventHandlers) => void
  getNetworkStats: () => Promise<NetworkQuality>
}

export interface PublisherOptions {
  audioSource?: string | boolean
  videoSource?: string | boolean
  publishAudio?: boolean
  publishVideo?: boolean
  resolution?: string
  frameRate?: number
}

export interface EventHandlers {
  onParticipantJoined?: (participant: Participant) => void
  onParticipantLeft?: (participantId: string) => void
  onStreamCreated?: (
    participant: Participant,
    stream: MediaStream,
  ) => void
  onStreamDestroyed?: (participantId: string) => void
  onChatMessage?: (message: ChatMessage) => void
  onNetworkQualityChanged?: (quality: NetworkQuality) => void
  onError?: (error: VideoCallError) => void
}

// ============================================================================
// 컴포넌트 Props 타입
// ============================================================================

export interface ControlButtonProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  loading?: boolean
  disabled?: boolean
  destructive?: boolean
  onClick: () => void
  tooltip?: string
}

export interface ControlConfig {
  id: string
  label: string
  icon: React.ReactNode
  type: 'toggle' | 'action'
  active?: boolean
  loading?: boolean
  disabled?: boolean
  destructive?: boolean
  action: () => void | Promise<void>
  tooltip?: string
}

// ============================================================================
// 유틸리티 타입
// ============================================================================

export type AsyncAction<T = void> = () => Promise<T>
export type OptionalId<T> = Omit<T, 'id'> & { id?: string }

// 타입 가드
export const isParticipantLocal = (
  participant: Participant,
): boolean => participant.isLocal

export const isValidChatMessage = (
  message: unknown,
): message is ChatMessage =>
  typeof message === 'object' &&
  message !== null &&
  typeof (message as Record<string, unknown>).id === 'string' &&
  typeof (message as Record<string, unknown>).content === 'string' &&
  typeof (message as Record<string, unknown>).senderName === 'string'

// ============================================================================
// 상수
// ============================================================================

export const VIDEO_CALL_CONSTANTS = {
  MAX_PARTICIPANTS: 6,
  CHAT_MESSAGE_MAX_LENGTH: 500,
  RECONNECT_ATTEMPTS: 3,
  NETWORK_CHECK_INTERVAL: 5000,
  SPEAKING_THRESHOLD: 0.1,
} as const

export const MEDIA_CONSTRAINTS = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
  },
} as const
