import { StreamManager } from 'openvidu-browser'
import { logger } from '@/lib/utils/logger'

// OpenVidu 관련 유틸리티 함수들

/**
 * 연결 데이터에서 닉네임 추출
 */
export const getNicknameFromConnectionData = (
  data: string,
): string => {
  try {
    const parsed = JSON.parse(data)
    return parsed.nickname || '익명'
  } catch {
    return '익명'
  }
}

/**
 * 스트림 매니저에서 닉네임 추출
 */
export const getNicknameFromStreamManager = (
  streamManager: StreamManager,
): string => {
  if (streamManager.stream?.connection?.data) {
    return getNicknameFromConnectionData(
      streamManager.stream.connection.data,
    )
  }
  return '익명'
}

/**
 * 고유한 세션 ID 생성
 */
export const generateSessionId = (): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `session-${timestamp}-${random}`
}

/**
 * 채팅 메시지 시간 포맷팅
 */
export const formatMessageTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 1분 미만
  if (diff < 60000) {
    return '방금'
  }

  // 1시간 미만
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}분 전`
  }

  // 같은 날
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 다른 날
  return date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * 비디오 해상도 옵션
 */
export const VIDEO_RESOLUTIONS = {
  '480p': '640x480',
  '720p': '1280x720',
  '1080p': '1920x1080',
} as const

/**
 * OpenVidu 오류 메시지 한국어 변환
 */
export const getKoreanErrorMessage = (error: any): string => {
  const errorCode = error?.name || error?.code || 'UNKNOWN_ERROR'

  const errorMessages: Record<string, string> = {
    DEVICE_ACCESS_DENIED: '카메라 또는 마이크 접근이 거부되었습니다.',
    DEVICE_ALREADY_IN_USE:
      '다른 애플리케이션에서 장치를 사용 중입니다.',
    SCREEN_CAPTURE_DENIED: '화면 공유가 거부되었습니다.',
    NO_INPUT_SOURCE_SET: '입력 장치를 찾을 수 없습니다.',
    GENERIC_ERROR: '알 수 없는 오류가 발생했습니다.',
    CONNECTION_ERROR: '연결에 실패했습니다.',
    SESSION_NOT_FOUND: '세션을 찾을 수 없습니다.',
    TOKEN_INVALID: '유효하지 않은 토큰입니다.',
    UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
  }

  return errorMessages[errorCode] || errorMessages['UNKNOWN_ERROR']
}

/**
 * 미디어 장치 권한 확인
 */
export const checkMediaPermissions = async (): Promise<{
  audio: boolean
  video: boolean
}> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    })

    // 스트림 즉시 중지
    stream.getTracks().forEach((track) => track.stop())

    return { audio: true, video: true }
  } catch (error: any) {
    logger.warn('미디어 권한 확인 실패:', error)

    // 개별 권한 확인
    let audio = false
    let video = false

    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })
      audioStream.getTracks().forEach((track) => track.stop())
      audio = true
    } catch {}

    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      })
      videoStream.getTracks().forEach((track) => track.stop())
      video = true
    } catch {}

    return { audio, video }
  }
}

/**
 * 브라우저 지원 여부 확인
 */
export const checkBrowserSupport = (): {
  webRTC: boolean
  getUserMedia: boolean
  getDisplayMedia: boolean
} => {
  return {
    webRTC: !!window.RTCPeerConnection,
    getUserMedia: !!navigator.mediaDevices?.getUserMedia,
    getDisplayMedia: !!navigator.mediaDevices?.getDisplayMedia,
  }
}
