import { useEffect, useRef } from 'react'

import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

const logger = createOpenViduLogger('Environment')

/**
 * 컴포넌트 마운트 시 환경 정보를 로깅하는 훅 (1회만 실행)
 */
export function useEnvironmentInfo(): {
  hasVideoDevice?: boolean
} | null {
  const hasLogged = useRef(false)
  const infoRef = useRef<{ hasVideoDevice?: boolean } | null>(null)

  useEffect(() => {
    // 이미 로깅했거나 서버 사이드인 경우 스킵
    if (hasLogged.current || typeof window === 'undefined') {
      return
    }

    hasLogged.current = true

    const logEnvironmentInfo = async () => {
      try {
        logger.debug('환경 정보 로깅 시작')

        // 기본 브라우저 정보
        const userAgent = navigator.userAgent
        const browserInfo = getBrowserInfo(userAgent)

        // 화면 정보
        const screenInfo = {
          width: screen.width,
          height: screen.height,
          availWidth: screen.availWidth,
          availHeight: screen.availHeight,
          colorDepth: screen.colorDepth,
          pixelDepth: screen.pixelDepth,
        }

        // WebRTC 지원 확인
        const webRtcSupport = {
          RTCPeerConnection: !!window.RTCPeerConnection,
          getUserMedia: !!(
            navigator.mediaDevices &&
            navigator.mediaDevices.getUserMedia
          ),
          getDisplayMedia: !!(
            navigator.mediaDevices &&
            navigator.mediaDevices.getDisplayMedia
          ),
        }

        // 미디어 장치 정보 확인 (권한 요청 없이)
        let deviceInfo = {
          audioInputCount: 0,
          videoInputCount: 0,
          audioOutputCount: 0,
          hasPermission: false,
        }

        try {
          const devices =
            await navigator.mediaDevices.enumerateDevices()
          deviceInfo = {
            audioInputCount: devices.filter(
              (d) => d.kind === 'audioinput',
            ).length,
            videoInputCount: devices.filter(
              (d) => d.kind === 'videoinput',
            ).length,
            audioOutputCount: devices.filter(
              (d) => d.kind === 'audiooutput',
            ).length,
            hasPermission: devices.some((d) => d.label !== ''),
          }
          // 간단한 요약 정보 저장
          infoRef.current = {
            hasVideoDevice: deviceInfo.videoInputCount > 0,
          }
        } catch (error) {
          logger.warn('미디어 장치 정보 조회 실패', {
            error:
              error instanceof Error
                ? error.message
                : '알 수 없는 오류',
          })
          infoRef.current = { hasVideoDevice: true }
        }

        // 네트워크 정보 (Connection API 지원하는 경우)
        const connectionInfo = getConnectionInfo()

        logger.info('환경 정보', {
          browser: browserInfo,
          screen: screenInfo,
          webRtcSupport,
          devices: deviceInfo,
          connection: connectionInfo,
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        logger.error('환경 정보 로깅 실패', {
          error:
            error instanceof Error
              ? error.message
              : '알 수 없는 오류',
        })
      }
    }

    logEnvironmentInfo()
  }, [])

  // SSR에서는 null, 클라이언트에서는 effect 결과(또는 기본값) 반환
  return typeof window === 'undefined' ? null : infoRef.current
}

// 브라우저 정보 파싱
function getBrowserInfo(userAgent: string) {
  const browserRegexes = [
    { name: 'Chrome', regex: /Chrome\/(\d+)/ },
    { name: 'Firefox', regex: /Firefox\/(\d+)/ },
    { name: 'Safari', regex: /Safari\/(\d+)/ },
    { name: 'Edge', regex: /Edg\/(\d+)/ },
    { name: 'Opera', regex: /Opera\/(\d+)/ },
  ]

  for (const browser of browserRegexes) {
    const match = userAgent.match(browser.regex)
    if (match) {
      return {
        name: browser.name,
        version: match[1],
        userAgent: userAgent.substring(0, 100) + '...', // 로그 크기 제한
      }
    }
  }

  return {
    name: 'Unknown',
    version: 'Unknown',
    userAgent: userAgent.substring(0, 100) + '...',
  }
}

// 네트워크 연결 정보
function getConnectionInfo() {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
    }
  }

  return null
}
