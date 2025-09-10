/**
 * OpenVidu 클라이언트 전용 유틸리티
 * SSR 환경에서 OpenVidu 코드 실행 방지
 */

import { featureFlags } from '@/lib/config/env'

/**
 * 브라우저 환경 확인
 */
export const isBrowser = typeof window !== 'undefined'

/**
 * SSR 안전 가드
 * 서버 환경에서 호출시 에러 발생
 */
export function assertBrowserOnly(functionName: string) {
  if (!isBrowser) {
    throw new Error(
      `${functionName}은 브라우저 환경에서만 실행 가능합니다.`,
    )
  }
}

/**
 * 동적 OpenVidu 어댑터 임포트
 * 클라이언트에서만 실행되도록 보장
 */
export async function createOpenViduAdapterDynamic() {
  assertBrowserOnly('createOpenViduAdapterDynamic')

  try {
    const { createDefaultAdapter } = await import('./adapters')
    return createDefaultAdapter()
  } catch (error) {
    console.error('OpenVidu 어댑터 동적 로드 실패:', error)
    throw new Error('OpenVidu 어댑터를 로드할 수 없습니다.')
  }
}

/**
 * 웹 환경 호환성 확인
 */
export function checkWebRTCSupport(): {
  webRTC: boolean
  getUserMedia: boolean
  getDisplayMedia: boolean
  errors: string[]
} {
  const result = {
    webRTC: false,
    getUserMedia: false,
    getDisplayMedia: false,
    errors: [] as string[],
  }

  if (!isBrowser) {
    result.errors.push('브라우저 환경이 아님')
    return result
  }

  // WebRTC 지원 확인
  if (typeof window.RTCPeerConnection !== 'undefined') {
    result.webRTC = true
  } else {
    result.errors.push('WebRTC 미지원')
  }

  // getUserMedia 지원 확인
  if (
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function'
  ) {
    result.getUserMedia = true
  } else {
    result.errors.push('getUserMedia 미지원')
  }

  // getDisplayMedia 지원 확인 (화면 공유)
  if (
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getDisplayMedia === 'function'
  ) {
    result.getDisplayMedia = true
  } else {
    result.errors.push('화면 공유 미지원')
  }

  return result
}

/**
 * 미디어 장치 접근 권한 요청 (클라이언트 전용)
 */
export async function requestMediaPermissions(): Promise<{
  audio: boolean
  video: boolean
  errors: string[]
}> {
  assertBrowserOnly('requestMediaPermissions')

  const result = {
    audio: false,
    video: false,
    errors: [] as string[],
  }

  try {
    // 미디어 장치 권한 요청
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    })

    result.audio = true
    result.video = true

    // 즉시 스트림 중지
    stream.getTracks().forEach((track) => track.stop())
  } catch (error: unknown) {
    console.warn('미디어 권한 요청 실패:', error)

    // 개별 권한 확인
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })
      result.audio = true
      audioStream.getTracks().forEach((track) => track.stop())
    } catch (_audioError) {
      result.errors.push('오디오 접근 거부')
    }

    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      })
      result.video = true
      videoStream.getTracks().forEach((track) => track.stop())
    } catch (_videoError) {
      result.errors.push('비디오 접근 거부')
    }
  }

  return result
}

/**
 * 환경 정보 수집 (클라이언트 전용)
 */
export function getEnvironmentInfo() {
  assertBrowserOnly('getEnvironmentInfo')

  const userAgent = navigator.userAgent
  const browser = (() => {
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Unknown'
  })()

  return {
    browser,
    platform: navigator.platform,
    language: navigator.language,
    online: navigator.onLine,
    cookieEnabled: navigator.cookieEnabled,
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
    },
    window: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    webRTC: checkWebRTCSupport(),
    timestamp: new Date().toISOString(),
  }
}

/**
 * 개발 모드에서만 실행되는 디버깅 유틸리티
 */
if (isBrowser && featureFlags.debugMode) {
  // 전역 디버깅 함수 등록
  ;(window as Window & { openViduDebug?: unknown }).openViduDebug = {
    checkSupport: checkWebRTCSupport,
    requestPermissions: requestMediaPermissions,
    getEnvInfo: getEnvironmentInfo,
    featureFlags,
  }

  console.log('🔧 OpenVidu 디버깅 도구 활성화: window.openViduDebug')
}
