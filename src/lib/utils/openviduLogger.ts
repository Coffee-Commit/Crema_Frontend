/**
 * OpenVidu 전용 로거 시스템
 * - 환경별 로그 레벨 차등화
 * - 민감정보 자동 마스킹
 * - localStorage를 통한 디버그 토글
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
type LogData = Record<string, unknown>

/**
 * OpenVidu 로거 생성 함수
 * @param namespace - 로그 영역 구분자 (예: Room, Store, Event 등)
 */
export const createOpenViduLogger = (namespace: string) => {
  const isDebugEnabled = () => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('ov:debug') === '1'
  }

  const isDevelopment = process.env.NODE_ENV === 'development'

  const shouldLog = (level: LogLevel): boolean => {
    // 프로덕션에서는 warn, error만 출력
    if (!isDevelopment && !isDebugEnabled()) {
      return level === 'warn' || level === 'error'
    }

    // 개발환경이거나 디버그 모드면 모든 레벨 출력
    return true
  }

  return {
    debug: (msg: string, data?: LogData) => {
      if (shouldLog('debug')) {
        console.log(formatLog('debug', namespace, msg, data))
      }
    },
    info: (msg: string, data?: LogData) => {
      if (shouldLog('info')) {
        console.log(formatLog('info', namespace, msg, data))
      }
    },
    warn: (msg: string, data?: LogData) => {
      if (shouldLog('warn')) {
        console.warn(formatLog('warn', namespace, msg, data))
      }
    },
    error: (msg: string, data?: LogData) => {
      if (shouldLog('error')) {
        console.error(formatLog('error', namespace, msg, data))
      }
    },
    // 시간 측정용 헬퍼
    measure: async <T>(
      fn: () => Promise<T>,
      operation: string,
    ): Promise<T> => {
      const startTime = Date.now()
      const logger = createOpenViduLogger(namespace)

      try {
        logger.info('작업 시작', { op: operation })
        const result = await fn()
        logger.info('작업 완료', {
          op: operation,
          status: 'ok',
          durMs: Date.now() - startTime,
        })
        return result
      } catch (error) {
        logger.error('작업 실패', {
          op: operation,
          status: 'fail',
          durMs: Date.now() - startTime,
          code: (error as Error & { code?: string })?.code,
          msg:
            error instanceof Error
              ? error.message
              : '알 수 없는 오류',
        })
        throw error
      }
    },
  }
}

/**
 * 로그 포맷팅
 * 형식: lvl=레벨 src=OpenVidu area=네임스페이스 msg="메시지" [키=값...]
 */
function formatLog(
  level: string,
  area: string,
  msg: string,
  data?: LogData,
): string {
  const timestamp = new Date().toISOString()
  const base = `[${timestamp}] lvl=${level} src=OpenVidu area=${area} msg="${msg}"`

  if (!data || Object.keys(data).length === 0) {
    return base
  }

  // 데이터 필드를 키=값 형식으로 변환
  const fields = Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      const redactedValue = redact(key, value)
      return `${key}=${formatValue(redactedValue)}`
    })
    .join(' ')

  return fields ? `${base} ${fields}` : base
}

/**
 * 값 포맷팅
 */
function formatValue(value: unknown): string {
  if (typeof value === 'string') {
    // 공백이나 특수문자가 있으면 따옴표로 감싸기
    return value.includes(' ') || value.includes('=')
      ? `"${value}"`
      : value
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

/**
 * 민감정보 마스킹
 */
function redact(key: string, value: unknown): unknown {
  // 정확한 키 매칭을 위한 민감 필드 목록 (소문자 기준 비교)
  const exactSensitiveKeys = [
    'token',
    'sessiontoken',
    'accesstoken',
    'refreshtoken',
    'password',
    'secret',
    'apikey',
    'privatekey',
    'authorization',
    'auth',
  ]
  const exactSensitiveKeySet = new Set(exactSensitiveKeys)

  // 부분 매칭을 위한 패턴 (단어 경계 검사)
  const sensitivePatternsWords = ['url', 'ip', 'address', 'email']

  const lowerKey = key.toLowerCase()

  // 정확한 키 매칭 검사 (대소문자 무시)
  if (exactSensitiveKeySet.has(lowerKey)) {
    if (typeof value === 'string' && value.length > 0) {
      return value.length > 10
        ? value.substring(0, 10) + '...'
        : '[REDACTED]'
    }
    return '[REDACTED]'
  }

  // 단어 경계 패턴 검사 (IP, URL 등)
  const hasWordBoundaryMatch = sensitivePatternsWords.some(
    (pattern) => {
      const regex = new RegExp(`\\b${pattern}\\b`, 'i')
      return regex.test(lowerKey)
    },
  )

  if (hasWordBoundaryMatch) {
    if (typeof value === 'string' && value.length > 0) {
      return value.length > 15
        ? value.substring(0, 15) + '...'
        : value
    }
    return value
  }

  // connectionId, sessionId 등 긴 ID는 앞 8자만 표시
  if (
    (lowerKey === 'connectionid' ||
      lowerKey === 'sessionid' ||
      lowerKey === 'sid' ||
      lowerKey === 'cid') &&
    typeof value === 'string' &&
    value.length > 20
  ) {
    return value.substring(0, 8) + '...'
  }

  return value
}

/**
 * 디버그 모드 토글 헬퍼
 */
export const toggleOpenViduDebug = (enable?: boolean) => {
  if (typeof window === 'undefined') return

  const newValue =
    enable !== undefined
      ? enable
      : localStorage.getItem('ov:debug') !== '1'

  if (newValue) {
    localStorage.setItem('ov:debug', '1')
    console.log('[OpenVidu] 디버그 모드 활성화됨')
  } else {
    localStorage.removeItem('ov:debug')
    console.log('[OpenVidu] 디버그 모드 비활성화됨')
  }
}

// 전역에서 쉽게 토글할 수 있도록 window 객체에 추가
if (typeof window !== 'undefined') {
  ;(
    window as typeof window & {
      toggleOpenViduDebug: typeof toggleOpenViduDebug
    }
  ).toggleOpenViduDebug = toggleOpenViduDebug
}
