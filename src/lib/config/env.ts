/**
 * 환경 변수 및 피처 플래그 관리
 * OpenVidu v3 마이그레이션을 위한 안전장치 포함
 */

// OpenVidu SDK 버전 타입
export type OpenViduSdkVersion = 'v2compatibility' | 'v3native'

// 피처 플래그 타입
export interface FeatureFlags {
  openviduSdkVersion: OpenViduSdkVersion
  enableSimulcast: boolean
  enableDynacast: boolean
  enableSvc: boolean
  debugMode: boolean
  useNewCameraComponents: boolean
}

// 기본 설정값
const defaultFeatures: FeatureFlags = {
  openviduSdkVersion: 'v2compatibility', // 안전한 기본값
  enableSimulcast: false,
  enableDynacast: false,
  enableSvc: false,
  debugMode: process.env.NODE_ENV === 'development',
  // 기본값은 true (새 구현 기본 사용)
  useNewCameraComponents: true,
}

/**
 * 환경변수에서 피처 플래그 로드
 */
function loadFeatureFlags(): FeatureFlags {
  const features: FeatureFlags = { ...defaultFeatures }

  // OpenVidu SDK 버전 선택
  const ovSdk = process.env.NEXT_PUBLIC_OV_SDK?.toLowerCase()
  if (ovSdk === 'v3native' || ovSdk === 'v3') {
    features.openviduSdkVersion = 'v3native'
  }

  // 성능 최적화 기능들
  features.enableSimulcast =
    process.env.NEXT_PUBLIC_OV_SIMULCAST === 'true'
  features.enableDynacast =
    process.env.NEXT_PUBLIC_OV_DYNACAST === 'true'
  features.enableSvc = process.env.NEXT_PUBLIC_OV_SVC === 'true'

  // 디버그 모드 강제 설정
  if (process.env.NEXT_PUBLIC_DEBUG_MODE !== undefined) {
    features.debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true'
  }

  // 새 카메라 컴포넌트 사용 여부 (기본 ON, 환경변수 정의 시에만 덮어쓰기)
  if (process.env.NEXT_PUBLIC_NEW_CAMERA !== undefined) {
    features.useNewCameraComponents =
      process.env.NEXT_PUBLIC_NEW_CAMERA === 'true'
  }

  return features
}

// 싱글톤 피처 플래그 인스턴스
export const featureFlags = loadFeatureFlags()

/**
 * 개발 전용: 런타임에서 피처 플래그 토글 (브라우저 콘솔에서 사용)
 */
if (typeof window !== 'undefined' && featureFlags.debugMode) {
  ;(
    window as Window & { toggleOpenViduSdk?: () => void }
  ).toggleOpenViduSdk = () => {
    const current = featureFlags.openviduSdkVersion
    const newVersion: OpenViduSdkVersion =
      current === 'v2compatibility' ? 'v3native' : 'v2compatibility'
    featureFlags.openviduSdkVersion = newVersion
    console.log(
      `🔄 OpenVidu SDK 버전 변경: ${current} → ${newVersion}`,
    )
    console.log('페이지를 새로고침하여 변경사항을 적용하세요.')
  }

  console.log('🚀 OpenVidu Feature Flags:', featureFlags)
  console.log('💡 런타임 토글: window.toggleOpenViduSdk()')
}

/**
 * SDK 버전별 설정 반환
 */
export function getOpenViduConfig() {
  return {
    sdkVersion: featureFlags.openviduSdkVersion,
    performance: {
      simulcast: featureFlags.enableSimulcast,
      dynacast: featureFlags.enableDynacast,
      svc: featureFlags.enableSvc,
    },
    debug: featureFlags.debugMode,
  }
}

/**
 * 로그 레벨 결정
 */
export function getLogLevel(): 'debug' | 'info' | 'warn' | 'error' {
  if (featureFlags.debugMode) return 'debug'
  if (process.env.NODE_ENV === 'development') return 'info'
  return 'warn'
}

/**
 * API 엔드포인트 설정
 */
export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 10000,
  retryAttempts: 3,
}

/**
 * OpenVidu 서버 설정
 */
export const openViduServerConfig = {
  url:
    process.env.NEXT_PUBLIC_OPENVIDU_URL ||
    'https://openvidu.csy2025.store',
  secret: process.env.OPENVIDU_SECRET || '', // 서버에서만 사용
}

/**
 * 클라이언트 ICE 서버 설정
 * codex 권장: 올바른 RTCIceServer 형식 사용
 */
export type ClientIceServer = {
  urls: string | string[]
  username?: string
  credential?: string
}

export function getClientIceServers(): ClientIceServer[] {
  // 환경변수로 클라이언트 ICE 서버 강제 사용 여부 결정
  const forceClientIce =
    process.env.NEXT_PUBLIC_OV_FORCE_CLIENT_ICE === 'true'

  if (!forceClientIce) {
    console.log(
      '🔧 클라이언트 ICE 서버 비활성화. OpenVidu 서버 제공 ICE 서버 사용',
    )
    return []
  }

  const turnHost = process.env.NEXT_PUBLIC_TURN_HOST // IP 또는 도메인
  const turnUser = process.env.NEXT_PUBLIC_TURN_USERNAME
  const turnPass = process.env.NEXT_PUBLIC_TURN_PASSWORD
  const turnDomain = process.env.NEXT_PUBLIC_TURN_DOMAIN // FQDN for TURNS

  const iceServers: ClientIceServer[] = []

  // Google Public STUN (fallback)
  iceServers.push({ urls: 'stun:stun.l.google.com:19302' })

  if (turnHost && turnUser && turnPass) {
    // STUN 서버 (자체 호스트)
    iceServers.push({ urls: `stun:${turnHost}:3478` })

    // TURN UDP/TCP 서버
    iceServers.push({
      urls: [
        `turn:${turnHost}:3478?transport=udp`,
        `turn:${turnHost}:3478?transport=tcp`,
      ],
      username: turnUser,
      credential: turnPass,
    })

    console.log(
      `🔧 TURN 서버 설정: ${turnHost} (사용자: ${turnUser})`,
    )
  }

  // TURNS (TLS) - 방화벽 환경 대응
  if (turnDomain && turnUser && turnPass) {
    iceServers.push({
      urls: `turns:${turnDomain}:443?transport=tcp`,
      username: turnUser,
      credential: turnPass,
    })

    console.log(`🔧 TURNS TLS 서버 설정: ${turnDomain}:443`)
  }

  if (iceServers.length === 1) {
    // Google STUN만 있는 경우
    console.warn(
      '⚠️ TURN 서버 설정이 없습니다. NAT/방화벽 환경에서 연결 실패 가능성 높음',
    )
    console.log(
      '환경변수 설정: NEXT_PUBLIC_TURN_HOST, NEXT_PUBLIC_TURN_USERNAME, NEXT_PUBLIC_TURN_PASSWORD',
    )
  }

  console.log(`🔧 총 ${iceServers.length}개 ICE 서버 설정 완료`, {
    servers: iceServers.map((s) => ({
      urls: s.urls,
      hasCredentials: !!(s.username && s.credential),
    })),
  })

  return iceServers
}
