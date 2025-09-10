// VideoCall API 응답 타입 정의

// 실제 API 서버 응답 구조
export interface ApiResponse<T = any> {
  message: string
  result: T
  success: boolean
}

// 명세서 기준 응답 구조 (호환성 유지)
export interface ApiResponseLegacy<T = any> {
  code: 'SUCCESS' | 'CREATED' | string
  message: string
  data: T
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
  configInfo: {
    defaultResolution: string
    defaultFrameRate: number
    autoEnableAudio: boolean
    autoEnableVideo: boolean
    chatEnabled: boolean
  }
}

export interface ConfigResponse {
  openviduServerUrl: string
  apiBaseUrl: string
  webSocketUrl: string
  defaultVideoConfig: {
    resolution: string
    frameRate: number
    publishAudio: boolean
    publishVideo: boolean
  }
  supportedBrowsers: string[]
  features: {
    chatEnabled: boolean
    screenShareEnabled: boolean
    recordingEnabled: boolean
    virtualBackgroundEnabled: boolean
  }
}

export interface SessionStatusResponse {
  sessionId: string
  sessionName: string
  isActive: boolean
  participantCount: number
  participants: Array<{
    username: string
    connectionId: string
    joinedAt: string
    isConnected: boolean
  }>
  createdAt: string
}

export interface ChatMessage {
  timestamp: string
  participantId: string
  participantName: string
  message: string
  messageType: 'chat' | 'system'
}

export interface ChatHistoryResponse {
  sessionId: string
  messages: ChatMessage[]
  totalMessages: number
  sessionStartTime: string
  sessionEndTime?: string
  createdAt: string
}

export interface ChatSaveRequest {
  messages: ChatMessage[]
  sessionStartTime: string
  sessionEndTime?: string
}

// API 에러 코드
export enum ApiErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  CHAT_NOT_FOUND = 'CHAT_NOT_FOUND',
  CHAT_SAVE_FAILED = 'CHAT_SAVE_FAILED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

// 공유 자료 관련 타입 (기존 이미지 API 활용)
export interface SharedMaterial {
  id: string
  imageKey: string // S3 key
  fileName: string
  uploadedAt: string
  uploadedBy: string
  fileSize: number
  contentType?: string
}

export interface SharedMaterialsResponse {
  materials: SharedMaterial[]
}

export interface JobSeekerInfo {
  name: string
  position: string
  experience: string
  skills: string[]
  introduction: string
  userId?: number
}

export interface JobSeekerInfoResponse {
  jobSeekerInfo: JobSeekerInfo
}

// 이미지 API 응답 타입 (기존 API 활용)
export interface ImageUploadResponse {
  imageKey: string
  imageUrl: string
  uploadedAt: string
  fileSize: number
}

export interface ImageUrlResponse {
  imageKey: string
  presignedUrl: string
  expiresAt: string
  validFor: string
}

export class VideoCallApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
  ) {
    super(message)
    this.name = 'VideoCallApiError'
  }
}
