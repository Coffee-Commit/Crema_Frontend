// OpenVidu 관련 공통 타입 정의

// OpenVidu SDK 타입 재정의 (any 타입 대체용)
export interface StreamEvent {
  stream: {
    streamId: string
    connection: {
      connectionId: string
    }
    hasAudio: boolean
    hasVideo: boolean
    typeOfVideo: string
    videoDimensions?: {
      width: number
      height: number
    }
  }
  target: unknown
  type: string
}

export interface ConnectionEvent {
  connection: {
    connectionId: string
    data: string
    role: string
    serverData: string
    token: string
  }
  target: unknown
  type: string
}

export interface PublisherSpeakingEvent {
  connection: {
    connectionId: string
  }
  streamId: string
  target: unknown
  type: string
}

export interface SessionDisconnectedEvent {
  reason: string
  target: unknown
  type: string
}

export interface StreamPropertyChangedEvent {
  changedProperty: string
  newValue: unknown
  oldValue: unknown
  reason: string
  stream: {
    streamId: string
    connection: {
      connectionId: string
    }
  }
  target: unknown
  type: string
}

export interface PublisherVideoQualityEvent {
  newQuality: string
  oldQuality: string
  reason: string
  target: unknown
  type: string
}

export interface RecordingEvent {
  id: string
  name: string
  outputMode: string
  status: string
  target: unknown
  type: string
}

// Network quality 관련 타입
export interface NetworkQualityLevel {
  level: number // 0-5 scale
  description:
    | 'excellent'
    | 'good'
    | 'poor'
    | 'bad'
    | 'critical'
    | 'disconnected'
}

export interface WebRTCStats {
  audio?: {
    bytesReceived?: number
    bytesSent?: number
    packetsLost?: number
    packetsReceived?: number
    packetsSent?: number
    jitter?: number
    roundTripTime?: number
  }
  video?: {
    bytesReceived?: number
    bytesSent?: number
    packetsLost?: number
    packetsReceived?: number
    packetsSent?: number
    frameRate?: number
    resolution?: {
      width: number
      height: number
    }
  }
}

// Event handler 타입
export type EventHandler<T = unknown> = (event: T) => void

// Publisher/Subscriber 관련 타입
export interface PublisherProperties {
  audioSource?: boolean | string
  videoSource?: boolean | string
  publishAudio?: boolean
  publishVideo?: boolean
  resolution?: string
  frameRate?: number
  insertMode?: 'APPEND' | 'AFTER' | 'BEFORE' | 'PREPEND' | 'REPLACE'
  mirror?: boolean
}

export interface SubscriberProperties {
  insertMode?: 'APPEND' | 'AFTER' | 'BEFORE' | 'PREPEND' | 'REPLACE'
  subscribeToAudio?: boolean
  subscribeToVideo?: boolean
}

// Device 관련 타입
export interface VideoDevice extends MediaDeviceInfo {
  deviceId: string
  groupId: string
  kind: 'videoinput'
  label: string
}

export interface AudioDevice extends MediaDeviceInfo {
  deviceId: string
  groupId: string
  kind: 'audioinput'
  label: string
}

// 에러 타입
export interface OpenViduError extends Error {
  code?: number
  name: string
  message: string
}

// 화면 공유 관련 타입
export interface ScreenShareConstraints {
  video: boolean | MediaTrackConstraints
  audio?: boolean | MediaTrackConstraints
}

export interface MediaStreamTrackSettings {
  width?: number
  height?: number
  frameRate?: number
  aspectRatio?: number
  deviceId?: string
  groupId?: string
}

// Unknown 타입 유틸리티
export type SafeAny = unknown
export type EventData = Record<string, unknown>
export type GenericCallback = (...args: unknown[]) => void
