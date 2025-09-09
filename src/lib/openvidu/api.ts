import api from '@/lib/http/api'
import {
  ApiResponse,
  QuickJoinResponse,
  SessionConfigResponse,
  SessionStatusResponse,
  ChatHistorySaveRequest,
  ChatHistoryResponse,
  isSuccessResponse,
  ApiErrorCode,
  OPENVIDU_CONSTANTS,
} from '@/components/openvidu/types'
import { createOpenViduLogger } from '@/lib/utils/openviduLogger'
import { featureFlags, getOpenViduConfig } from '@/lib/config/env'

// ============================================================================
// API 응답 정규화 함수
// ============================================================================

/**
 * 서버의 다양한 응답 형태를 표준 ApiResponse 형태로 정규화
 */
function normalizeApiResponse<T>(raw: any): ApiResponse<T> {
  if (!raw || typeof raw !== 'object') {
    return {
      code: 'ERROR',
      message: 'Invalid response',
      result: null,
    }
  }

  const codeRaw =
    raw.code ??
    raw.resultCode ??
    (raw.success === true ? 'OK' : undefined)
  const message = raw.message ?? raw.msg ?? ''
  const hasQuickJoinShape = raw.token && raw.sessionId

  const result =
    raw.result !== undefined
      ? raw.result
      : raw.data !== undefined
        ? raw.data
        : hasQuickJoinShape
          ? raw
          : null

  // SUCCESS -> OK 변환, 미정이면 result 유무로 추론
  const normalizedCode =
    (codeRaw === 'SUCCESS' ? 'OK' : codeRaw) ??
    (result ? 'OK' : 'ERROR')

  // [SUCCESS] 메시지 패턴 감지
  if (!result && message.startsWith('[SUCCESS]')) {
    return { code: 'OK', message, result: raw as T }
  }

  return { code: normalizedCode, message, result }
}

const logger = createOpenViduLogger('Api')

// ============================================================================
// OpenVidu API 서비스 클래스
// ============================================================================

class OpenViduApiService {
  private readonly baseUrl = '/api/video-call'

  /**
   * 공통 API 요청 처리 (디버깅 로그 포함)
   */
  private async request<T>(
    endpoint: string,
    options: {
      method?: string
      data?: any
      headers?: Record<string, string>
    } = {},
  ): Promise<T> {
    const openViduConfig = getOpenViduConfig()

    const requestInfo = {
      url: `${this.baseUrl}${endpoint}`,
      method: options.method || 'GET',
      data: options.data,
      timestamp: new Date().toISOString(),
      sdkVersion: openViduConfig.sdkVersion,
    }

    // v3 특화 헤더 추가
    const headers = {
      'X-OpenVidu-SDK-Version': openViduConfig.sdkVersion,
      'X-OpenVidu-Client-Version': '3.0-v2compatibility',
      ...(options.headers || {}),
    }

    logger.info('API 요청 시작', {
      endpoint,
      method: requestInfo.method,
      hasData: !!requestInfo.data,
      sdkVersion: openViduConfig.sdkVersion,
      features: {
        simulcast: openViduConfig.performance.simulcast,
        dynacast: openViduConfig.performance.dynacast,
        svc: openViduConfig.performance.svc,
      },
    })

    const startTime = performance.now()

    try {
      const response = await api({
        url: requestInfo.url,
        method: requestInfo.method,
        data: requestInfo.data,
        headers,
      })

      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)

      logger.debug('HTTP 응답', {
        status: response.status,
        durMs: duration,
      })

      const raw = response.data
      const apiResponse = normalizeApiResponse<T>(raw)

      if (isSuccessResponse(apiResponse)) {
        logger.info('API 완료', {
          endpoint,
          code: apiResponse.code,
          durMs: duration,
        })
        return apiResponse.result
      } else {
        logger.error('API 에러', {
          endpoint,
          code: apiResponse.code,
          msg: apiResponse.message,
        })
        throw new Error(
          `API Error [${apiResponse.code}]: ${apiResponse.message}`,
        )
      }
    } catch (error: any) {
      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)

      logger.error('요청 실패', {
        endpoint,
        msg: error.message,
        durMs: duration,
        status: error.response?.status,
      })
      throw error
    }
  }

  /**
   * 1. 원클릭 세션 참가
   * POST /api/video-call/quick-join?reservationId={reservationId}
   */
  async quickJoin(reservationId: number): Promise<QuickJoinResponse> {
    logger.debug('세션 참가 시도', { reservationId })

    try {
      const result = await this.request<QuickJoinResponse>(
        `/quick-join?reservationId=${reservationId}`,
        { method: 'POST' },
      )

      logger.info('세션 참가 성공', {
        sid: result.sessionId.substring(0, 8) + '...',
        sessionName: result.sessionName,
        username: result.username,
        isNew: result.isNewSession,
      })

      return result
    } catch (error) {
      logger.error('세션 참가 실패', {
        reservationId,
        msg:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
      throw error
    }
  }

  /**
   * 2. 프론트엔드 설정 정보 조회
   * GET /api/video-call/config
   */
  async getConfig(): Promise<SessionConfigResponse> {
    logger.debug('설정 정보 조회 시작')

    try {
      const result =
        await this.request<SessionConfigResponse>('/config')
      logger.info('설정 정보 조회 성공', {
        featuresCount: Object.keys(result.features || {}).length,
        browsersCount: result.supportedBrowsers?.length || 0,
      })
      return result
    } catch (error) {
      logger.error('설정 정보 조회 실패', {
        msg:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
      throw error
    }
  }

  /**
   * 3. 실시간 세션 상태 조회
   * GET /api/video-call/sessions/{sessionId}/status
   */
  async getSessionStatus(
    sessionId: string,
  ): Promise<SessionStatusResponse> {
    return this.request<SessionStatusResponse>(
      `/sessions/${sessionId}/status`,
    )
  }

  /**
   * 4. 토큰 갱신
   * POST /api/video-call/sessions/{sessionId}/refresh-token
   */
  async refreshToken(sessionId: string): Promise<QuickJoinResponse> {
    return this.request<QuickJoinResponse>(
      `/sessions/${sessionId}/refresh-token`,
      { method: 'POST' },
    )
  }

  /**
   * 5. 자동 재연결
   * POST /api/video-call/sessions/{sessionId}/auto-reconnect?lastConnectionId={connectionId}
   */
  async autoReconnect(
    sessionId: string,
    lastConnectionId?: string,
  ): Promise<QuickJoinResponse> {
    const query = lastConnectionId
      ? `?lastConnectionId=${lastConnectionId}`
      : ''
    return this.request<QuickJoinResponse>(
      `/sessions/${sessionId}/auto-reconnect${query}`,
      { method: 'POST' },
    )
  }

  /**
   * 6. 채팅 히스토리 저장
   * POST /api/video-call/sessions/{sessionId}/chat/save
   */
  async saveChatHistory(
    sessionId: string,
    chatData: ChatHistorySaveRequest,
  ): Promise<void> {
    return this.request<void>(`/sessions/${sessionId}/chat/save`, {
      method: 'POST',
      data: chatData,
    })
  }

  /**
   * 7. 채팅 히스토리 조회
   * GET /api/video-call/sessions/{sessionId}/chat
   */
  async getChatHistory(
    sessionId: string,
  ): Promise<ChatHistoryResponse> {
    return this.request<ChatHistoryResponse>(
      `/sessions/${sessionId}/chat`,
    )
  }

  /**
   * 8. 화면 공유 상태 알림
   * POST /api/video-call/sessions/{sessionId}/screen-share
   */
  async notifyScreenShare(
    sessionId: string,
    isSharing: boolean,
  ): Promise<void> {
    return this.request<void>(`/sessions/${sessionId}/screen-share`, {
      method: 'POST',
      data: { isSharing },
    })
  }

  // ============================================================================
  // OpenVidu v3 특화 API 메소드들
  // ============================================================================

  /**
   * v3: 성능 메트릭스 조회
   * GET /api/video-call/sessions/{sessionId}/metrics
   */
  async getSessionMetrics(sessionId: string): Promise<{
    participantCount: number
    bandwidth: { up: number; down: number }
    quality: { video: string; audio: string }
    latency: number
    reconnections: number
  }> {
    return this.request(`/sessions/${sessionId}/metrics`)
  }

  /**
   * v3: Simulcast 레이어 제어
   * POST /api/video-call/sessions/{sessionId}/simulcast
   */
  async updateSimulcastLayers(
    sessionId: string,
    participantId: string,
    layers: { low: boolean; medium: boolean; high: boolean },
  ): Promise<void> {
    return this.request<void>(`/sessions/${sessionId}/simulcast`, {
      method: 'POST',
      data: { participantId, layers },
    })
  }

  /**
   * v3: 동적 품질 제어 (Dynacast)
   * POST /api/video-call/sessions/{sessionId}/quality
   */
  async updateQualityProfile(
    sessionId: string,
    profile: 'low' | 'medium' | 'high' | 'auto',
  ): Promise<void> {
    return this.request<void>(`/sessions/${sessionId}/quality`, {
      method: 'POST',
      data: { profile },
    })
  }

  /**
   * v3: 네트워크 상태 모니터링
   * GET /api/video-call/sessions/{sessionId}/network
   */
  async getNetworkStatus(sessionId: string): Promise<{
    status: 'excellent' | 'good' | 'poor' | 'disconnected'
    bandwidth: number
    latency: number
    packetLoss: number
    jitter: number
  }> {
    return this.request(`/sessions/${sessionId}/network`)
  }

  /**
   * v3: 고급 세션 설정 업데이트
   * PUT /api/video-call/sessions/{sessionId}/settings
   */
  async updateSessionSettings(
    sessionId: string,
    settings: {
      maxBitrate?: number
      minBitrate?: number
      simulcast?: boolean
      dynacast?: boolean
      svc?: boolean
      adaptiveStream?: boolean
    },
  ): Promise<void> {
    return this.request<void>(`/sessions/${sessionId}/settings`, {
      method: 'PUT',
      data: settings,
    })
  }

  /**
   * v3: 참가자별 미디어 통계
   * GET /api/video-call/sessions/{sessionId}/participants/{participantId}/stats
   */
  async getParticipantStats(
    sessionId: string,
    participantId: string,
  ): Promise<{
    audio: { bitrate: number; packetLoss: number; jitter: number }
    video: {
      bitrate: number
      resolution: string
      fps: number
      packetLoss: number
    }
    network: { rtt: number; availableBandwidth: number }
  }> {
    return this.request(
      `/sessions/${sessionId}/participants/${participantId}/stats`,
    )
  }
}

// ============================================================================
// Test API 서비스 클래스
// ============================================================================

class OpenViduTestApiService {
  private readonly baseUrl = '/api/test/video-call'
  private abortControllers = new Map<string, AbortController>()

  /**
   * 진행 중인 요청 취소
   */
  cancelRequest(key: string) {
    const controller = this.abortControllers.get(key)
    if (controller) {
      logger.debug('요청 취소', { key })
      controller.abort()
      this.abortControllers.delete(key)
    }
  }

  /**
   * 모든 진행 중인 요청 취소
   */
  cancelAllRequests() {
    logger.info('모든 요청 취소', {
      count: this.abortControllers.size,
    })
    this.abortControllers.forEach((controller, key) => {
      controller.abort()
    })
    this.abortControllers.clear()
  }

  /**
   * 공통 API 요청 처리 (Test API용 - 인증 불필요)
   */
  private async request<T>(
    endpoint: string,
    options: { method?: string; data?: any; abortKey?: string } = {},
  ): Promise<T> {
    const requestInfo = {
      url: `${this.baseUrl}${endpoint}`,
      method: options.method || 'GET',
      data: options.data,
      timestamp: new Date().toISOString(),
    }

    // AbortController 설정
    let abortController: AbortController | undefined
    if (options.abortKey) {
      // 기존 요청이 있으면 취소
      this.cancelRequest(options.abortKey)

      // 새로운 AbortController 생성
      abortController = new AbortController()
      this.abortControllers.set(options.abortKey, abortController)
    }

    logger.info('Test API 요청 시작', {
      endpoint,
      method: requestInfo.method,
      hasData: !!requestInfo.data,
      abortKey: options.abortKey || 'none',
    })

    const startTime = performance.now()

    try {
      const response = await api({
        url: requestInfo.url,
        method: requestInfo.method,
        data: requestInfo.data,
        signal: abortController?.signal,
      })

      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)

      logger.debug('Test API 응답', {
        status: response.status,
        durMs: duration,
      })

      const raw = response.data

      // QuickJoin 응답의 구조 디버깅 (보안상 키만 로깅)
      if (endpoint.includes('/quick-join')) {
        logger.debug('QuickJoin API 원시 응답 구조', {
          endpoint,
          topLevelKeys: Object.keys(raw || {}),
          hasResult: 'result' in (raw || {}),
          hasData: 'data' in (raw || {}),
          hasToken: 'token' in (raw || {}),
          hasSessionId: 'sessionId' in (raw || {}),
          resultKeys: raw?.result ? Object.keys(raw.result) : null,
          dataKeys: raw?.data ? Object.keys(raw.data) : null,
        })
      }

      const apiResponse = normalizeApiResponse<T>(raw)

      if (isSuccessResponse(apiResponse)) {
        logger.info('Test API 완료', {
          endpoint,
          code: apiResponse.code,
          durMs: duration,
        })
        return apiResponse.result
      } else {
        logger.error('Test API 에러', {
          endpoint,
          code: apiResponse.code,
          msg: apiResponse.message,
        })
        throw new Error(
          `Test API Error [${apiResponse.code}]: ${apiResponse.message}`,
        )
      }
    } catch (error: any) {
      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)

      // AbortController 정리
      if (options.abortKey) {
        this.abortControllers.delete(options.abortKey)
      }

      // 요청 취소 에러 체크
      if (
        error.name === 'CanceledError' ||
        error.code === 'ERR_CANCELED'
      ) {
        logger.warn('Test API 요청 취소', {
          endpoint,
          abortKey: options.abortKey,
          durMs: duration,
        })
        throw new Error('요청이 취소되었습니다.')
      }

      logger.error('Test API 요청 실패', {
        endpoint,
        msg: error.message,
        durMs: duration,
        status: error.response?.status,
      })
      throw error
    } finally {
      // 성공 시에도 AbortController 정리
      if (options.abortKey) {
        this.abortControllers.delete(options.abortKey)
      }
    }
  }

  /**
   * 테스트 세션 참가 (원클릭)
   * POST /api/test/video-call/quick-join?username={username}&sessionName={sessionName}
   */
  async quickJoin(
    username: string,
    sessionName: string,
  ): Promise<QuickJoinResponse> {
    logger.debug('테스트 세션 참가 시도', { username, sessionName })

    try {
      const result = await this.request<QuickJoinResponse>(
        `/quick-join?username=${encodeURIComponent(username)}&sessionName=${encodeURIComponent(sessionName)}`,
        {
          method: 'POST',
          abortKey: `quickjoin-${username}-${sessionName}`,
        },
      )

      logger.info('테스트 세션 참가 성공', {
        sid: result.sessionId.substring(0, 8) + '...',
        sessionName: result.sessionName,
        username: result.username,
        isNew: result.isNewSession,
      })

      return result
    } catch (error) {
      logger.error('테스트 세션 참가 실패', {
        username,
        sessionName,
        msg:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
      throw error
    }
  }

  /**
   * 테스트 설정 정보 조회
   * GET /api/test/video-call/config
   */
  async getConfig(): Promise<SessionConfigResponse> {
    logger.debug('테스트 설정 정보 조회 시작')

    try {
      const result = await this.request<SessionConfigResponse>(
        '/config',
        {
          abortKey: 'config-test',
        },
      )
      logger.info('테스트 설정 정보 조회 성공', {
        featuresCount: Object.keys(result.features || {}).length,
        browsersCount: result.supportedBrowsers?.length || 0,
      })
      return result
    } catch (error) {
      logger.error('테스트 설정 정보 조회 실패', {
        msg:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
      throw error
    }
  }

  /**
   * 테스트 세션 상태 조회
   * GET /api/test/video-call/sessions/{sessionId}/status
   */
  async getSessionStatus(
    sessionId: string,
  ): Promise<SessionStatusResponse> {
    return this.request<SessionStatusResponse>(
      `/sessions/${sessionId}/status`,
    )
  }

  /**
   * 테스트 토큰 갱신
   * POST /api/test/video-call/sessions/{sessionId}/refresh-token?username={username}
   */
  async refreshToken(
    sessionId: string,
    username: string,
  ): Promise<QuickJoinResponse> {
    logger.debug('테스트 토큰 갱신 시도', { sessionId, username })

    try {
      const result = await this.request<QuickJoinResponse>(
        `/sessions/${sessionId}/refresh-token?username=${encodeURIComponent(username)}`,
        { method: 'POST' },
      )
      logger.info('테스트 토큰 갱신 성공')
      return result
    } catch (error) {
      logger.error('테스트 토큰 갱신 실패', {
        sessionId,
        username,
        msg:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
      throw error
    }
  }

  /**
   * 테스트 자동 재연결
   * POST /api/test/video-call/sessions/{sessionId}/auto-reconnect?username={username}&lastConnectionId={connectionId}
   */
  async autoReconnect(
    sessionId: string,
    username: string,
    lastConnectionId?: string,
  ): Promise<QuickJoinResponse> {
    logger.debug('테스트 자동 재연결 시도', {
      sessionId,
      username,
      lastConnectionId,
    })

    let query = `username=${encodeURIComponent(username)}`
    if (lastConnectionId) {
      query += `&lastConnectionId=${lastConnectionId}`
    }

    try {
      const result = await this.request<QuickJoinResponse>(
        `/sessions/${sessionId}/auto-reconnect?${query}`,
        { method: 'POST' },
      )
      logger.info('테스트 자동 재연결 성공')
      return result
    } catch (error) {
      logger.error('테스트 자동 재연결 실패', {
        sessionId,
        username,
        msg:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
      throw error
    }
  }

  /**
   * 테스트 채팅 히스토리 저장
   * POST /api/test/video-call/sessions/{sessionId}/chat/save
   */
  async saveChatHistory(
    sessionId: string,
    chatData: ChatHistorySaveRequest,
  ): Promise<void> {
    return this.request<void>(`/sessions/${sessionId}/chat/save`, {
      method: 'POST',
      data: chatData,
    })
  }

  /**
   * 테스트 화면 공유 상태 알림
   * POST /api/test/video-call/sessions/{sessionId}/screen-share
   */
  async notifyScreenShare(
    sessionId: string,
    isSharing: boolean,
  ): Promise<void> {
    return this.request<void>(`/sessions/${sessionId}/screen-share`, {
      method: 'POST',
      data: { isSharing },
    })
  }

  // ============================================================================
  // Test API v3 특화 메소드들
  // ============================================================================

  /**
   * 테스트: 세션 메트릭스 조회 (시뮬레이션 데이터)
   */
  async getSessionMetrics(sessionId: string) {
    // 테스트 환경에서는 시뮬레이션 데이터 반환
    return this.request(`/sessions/${sessionId}/metrics`)
  }

  /**
   * 테스트: 네트워크 상태 시뮬레이션
   */
  async simulateNetworkCondition(
    sessionId: string,
    condition: 'excellent' | 'good' | 'poor' | 'disconnected',
  ): Promise<void> {
    return this.request<void>(
      `/sessions/${sessionId}/network/simulate`,
      {
        method: 'POST',
        data: { condition },
      },
    )
  }

  /**
   * 테스트: 품질 프로파일 테스트
   */
  async testQualityProfile(
    sessionId: string,
    profile: 'low' | 'medium' | 'high',
  ): Promise<void> {
    return this.request<void>(`/sessions/${sessionId}/quality/test`, {
      method: 'POST',
      data: { profile },
    })
  }
}

// ============================================================================
// API 서비스 인스턴스들 (싱글톤)
// ============================================================================

export const openViduApi = new OpenViduApiService()
export const openViduTestApi = new OpenViduTestApiService()

// ============================================================================
// 에러 처리 유틸리티
// ============================================================================

export class OpenViduApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    public message: string,
    public details?: any,
  ) {
    super(message)
    this.name = 'OpenViduApiError'
  }
}

/**
 * v3 확장 에러 분석 및 복구 제안
 */
export function analyzeV3Error(error: any): {
  category:
    | 'network'
    | 'media'
    | 'session'
    | 'permission'
    | 'system'
    | 'unknown'
  severity: 'low' | 'medium' | 'high' | 'critical'
  recoveryAction?: string
  requiresReconnect: boolean
} {
  const errorName = error.name || ''
  const errorMessage = error.message || ''
  const errorCode = (error as any)?.code || ''

  // LiveKit/v3 특화 에러 패턴 분석
  if (errorName.includes('ICE') || errorMessage.includes('network')) {
    return {
      category: 'network',
      severity: 'high',
      recoveryAction: '네트워크 연결을 확인하고 재연결을 시도하세요.',
      requiresReconnect: true,
    }
  }

  if (
    errorName.includes('Media') ||
    errorMessage.includes('camera') ||
    errorMessage.includes('microphone')
  ) {
    return {
      category: 'media',
      severity: 'medium',
      recoveryAction:
        '미디어 장치 권한을 확인하고 브라우저를 새로고침하세요.',
      requiresReconnect: false,
    }
  }

  if (errorCode.includes('TOKEN') || errorMessage.includes('token')) {
    return {
      category: 'session',
      severity: 'high',
      recoveryAction: '세션 토큰을 갱신하거나 다시 참가하세요.',
      requiresReconnect: true,
    }
  }

  if (
    errorMessage.includes('permission') ||
    errorMessage.includes('denied')
  ) {
    return {
      category: 'permission',
      severity: 'medium',
      recoveryAction:
        '브라우저 설정에서 카메라와 마이크 권한을 허용하세요.',
      requiresReconnect: false,
    }
  }

  return {
    category: 'unknown',
    severity: 'medium',
    requiresReconnect: false,
  }
}

/**
 * API 에러를 한국어 메시지로 변환 (v3 개선 버전)
 */
export function getKoreanErrorMessage(error: any): string {
  logger.debug('에러 메시지 변환', {
    name: error.name,
    message: error.message,
    isOpenViduApiError: error instanceof OpenViduApiError,
  })

  // v3 에러 분석 수행
  const analysis = analyzeV3Error(error)
  logger.debug('v3 에러 분석', analysis)

  let koreanMessage: string

  if (error instanceof OpenViduApiError) {
    const errorMessages: Record<ApiErrorCode, string> = {
      [ApiErrorCode.BAD_REQUEST]: '잘못된 요청입니다.',
      [ApiErrorCode.UNAUTHORIZED]: '인증이 필요합니다.',
      [ApiErrorCode.FORBIDDEN]: '권한이 없습니다.',
      [ApiErrorCode.NOT_FOUND]: '리소스를 찾을 수 없습니다.',
      [ApiErrorCode.INTERNAL_SERVER_ERROR]:
        '서버 오류가 발생했습니다.',
      [ApiErrorCode.SESSION_NOT_FOUND]: '세션을 찾을 수 없습니다.',
      [ApiErrorCode.SESSION_CREATION_FAILED]:
        '세션 생성에 실패했습니다.',
      [ApiErrorCode.SESSION_CONNECT_FAILED]:
        '세션 연결에 실패했습니다.',
      [ApiErrorCode.PARTICIPANT_NOT_FOUND]:
        '참가자를 찾을 수 없습니다.',
      [ApiErrorCode.TOKEN_EXPIRED]: '토큰이 만료되었습니다.',
      [ApiErrorCode.TOKEN_REFRESH_FAILED]:
        '토큰 갱신에 실패했습니다.',
      [ApiErrorCode.AUTO_RECONNECT_FAILED]:
        '자동 재연결에 실패했습니다.',
      [ApiErrorCode.OPENVIDU_CONNECTION_FAILED]:
        'OpenVidu 연결에 실패했습니다.',
      [ApiErrorCode.CHAT_NOT_FOUND]: '채팅을 찾을 수 없습니다.',
      [ApiErrorCode.CHAT_SAVE_FAILED]: '채팅 저장에 실패했습니다.',
    }

    koreanMessage = errorMessages[error.code] || error.message

    // 복구 제안 추가
    if (analysis.recoveryAction) {
      koreanMessage += ` ${analysis.recoveryAction}`
    }

    logger.debug('API 에러 매핑', {
      code: error.code,
      originalMessage: error.message,
      koreanMessage,
      category: analysis.category,
      severity: analysis.severity,
    })
  } else {
    // v3 특화 에러 메시지
    const v3ErrorMessages = {
      network:
        '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해 주세요.',
      media:
        '미디어 장치 접근에 실패했습니다. 카메라와 마이크 권한을 확인해 주세요.',
      session:
        '세션 연결에 문제가 있습니다. 잠시 후 다시 시도해 주세요.',
      permission: '브라우저에서 미디어 장치 접근이 차단되었습니다.',
      system: '시스템 오류가 발생했습니다.',
      unknown: '알 수 없는 오류가 발생했습니다.',
    }

    koreanMessage = v3ErrorMessages[analysis.category]
    if (analysis.recoveryAction) {
      koreanMessage += ` ${analysis.recoveryAction}`
    }

    logger.debug('v3 에러 처리', {
      originalMessage: error.message,
      koreanMessage,
      analysis,
    })
  }

  return koreanMessage
}

// ============================================================================
// 네비게이션 유틸리티 (개발용)
// ============================================================================

export const openViduNavigation = {
  /**
   * 홈페이지로 이동
   */
  goToHome: () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  },

  /**
   * 개발용: 테스트 페이지로 이동
   */
  goToTestPage: () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/video-call-legacy/create'
    }
  },
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * OpenVidu 서버 URL 가져오기
 */
export function getOpenViduServerUrl(): string {
  return OPENVIDU_CONSTANTS.SERVER_URL
}

/**
 * 세션 상태 폴링을 위한 유틸리티
 */
export function createSessionStatusPoller(
  sessionId: string,
  callback: (status: SessionStatusResponse) => void,
  interval: number = OPENVIDU_CONSTANTS.STATUS_CHECK_INTERVAL,
): () => void {
  const pollStatus = async () => {
    try {
      const status = await openViduApi.getSessionStatus(sessionId)
      callback(status)
    } catch (error) {
      logger.error('세션 상태 조회 실패', {
        msg:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
    }
  }

  const intervalId = setInterval(pollStatus, interval)

  // 초기 호출
  pollStatus()

  // cleanup 함수 반환
  return () => clearInterval(intervalId)
}
