'use client'

import api from '@/lib/http/api'
import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

import type {
  ApiResponse,
  QuickJoinResponse,
  ConfigResponse,
  SessionStatusResponse,
  ChatHistoryResponse,
  ChatSaveRequest,
} from '../types/api.types'
import { VideoCallApiError } from '../types/api.types'

const logger = createOpenViduLogger('VideoCallApiService')

export interface QuickJoinParams {
  username: string
  sessionName: string
  reservationId?: number
}

export class VideoCallApiService {
  private isTestMode: boolean
  private baseUrl: string

  constructor() {
    // 현재 경로를 기반으로 테스트 모드 판단
    this.isTestMode = this.detectTestMode()
    this.baseUrl = this.isTestMode
      ? '/api/test/video-call'
      : '/api/video-call'

    logger.info('VideoCallApiService 초기화', {
      isTestMode: this.isTestMode,
      baseUrl: this.baseUrl,
      currentPath:
        typeof window !== 'undefined'
          ? window.location.pathname
          : 'SSR',
    })
  }

  /**
   * 현재 경로를 분석하여 테스트 모드 여부 판단
   */
  private detectTestMode(): boolean {
    if (typeof window === 'undefined') {
      // SSR 환경에서는 기본적으로 실사용 모드
      return false
    }

    const pathname = window.location.pathname
    const isTestroom =
      pathname.includes('/testroom') ||
      pathname.includes('/test-') ||
      pathname.includes('test')

    logger.debug('테스트 모드 감지', {
      pathname,
      isTestroom,
      searchParams: window.location.search,
    })

    return isTestroom
  }

  /**
   * 원클릭 세션 참가 API
   */
  async quickJoin(
    params: QuickJoinParams,
  ): Promise<QuickJoinResponse> {
    logger.info('Quick Join API 호출', {
      username: params.username,
      sessionName: params.sessionName,
      mode: this.isTestMode ? 'TEST' : 'PROD',
    })

    try {
      if (this.isTestMode) {
        // 테스트 API: 쿼리 파라미터로 전송
        const queryParams = new URLSearchParams({
          username: params.username,
          sessionName: params.sessionName,
        })

        const response = await api.post<
          ApiResponse<QuickJoinResponse>
        >(`${this.baseUrl}/quick-join?${queryParams.toString()}`)

        logger.info('테스트 API Quick Join 성공', {
          sessionId: response.data.result.sessionId,
          serverUrl: response.data.result.openviduServerUrl,
        })

        return response.data.result
      } else {
        // 정규 API: 인증 헤더와 body로 전송
        const requestBody = params.reservationId
          ? { reservationId: params.reservationId }
          : {}

        const response = await api.post<
          ApiResponse<QuickJoinResponse>
        >(`${this.baseUrl}/quick-join`, requestBody)

        logger.info('정규 API Quick Join 성공', {
          sessionId: response.data.result.sessionId,
        })

        return response.data.result
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        'Quick Join 실패'
      const errorCode = error?.response?.data?.code || 'UNKNOWN_ERROR'
      const statusCode = error?.response?.status

      logger.error('Quick Join API 실패', {
        error: errorMessage,
        code: errorCode,
        statusCode,
        isTestMode: this.isTestMode,
      })

      throw new VideoCallApiError(errorCode, errorMessage, statusCode)
    }
  }

  /**
   * 프론트엔드 연결 정보 조회 API
   */
  async getConfig(): Promise<ConfigResponse> {
    logger.debug('Config API 호출', { isTestMode: this.isTestMode })

    try {
      const response = await api.get<ApiResponse<ConfigResponse>>(
        `${this.baseUrl}/config`,
      )

      logger.info('Config API 성공', {
        serverUrl: response.data.result.openviduServerUrl,
      })

      return response.data.result
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        'Config 조회 실패'
      const errorCode = error?.response?.data?.code || 'UNKNOWN_ERROR'
      const statusCode = error?.response?.status

      logger.error('Config API 실패', {
        error: errorMessage,
        code: errorCode,
        statusCode,
        isTestMode: this.isTestMode,
      })

      throw new VideoCallApiError(errorCode, errorMessage, statusCode)
    }
  }

  /**
   * 세션 상태 조회 API
   */
  async getSessionStatus(
    sessionId: string,
  ): Promise<SessionStatusResponse> {
    logger.debug('Session Status API 호출', {
      sessionId,
      isTestMode: this.isTestMode,
    })

    try {
      const response = await api.get<
        ApiResponse<SessionStatusResponse>
      >(`${this.baseUrl}/sessions/${sessionId}/status`)

      logger.info('Session Status API 성공', {
        sessionId,
        isActive: response.data.result.isActive,
        participantCount: response.data.result.participantCount,
      })

      return response.data.result
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        '세션 상태 조회 실패'
      const errorCode = error?.response?.data?.code || 'UNKNOWN_ERROR'
      const statusCode = error?.response?.status

      logger.error('Session Status API 실패', {
        sessionId,
        error: errorMessage,
        code: errorCode,
        statusCode,
        isTestMode: this.isTestMode,
      })

      throw new VideoCallApiError(errorCode, errorMessage, statusCode)
    }
  }

  /**
   * 토큰 갱신 API
   */
  async refreshToken(
    sessionId: string,
    username?: string,
  ): Promise<QuickJoinResponse> {
    logger.info('Refresh Token API 호출', {
      sessionId,
      isTestMode: this.isTestMode,
    })

    try {
      if (this.isTestMode) {
        // 테스트 API: username을 쿼리 파라미터로 전송
        if (!username) {
          throw new Error('테스트 모드에서는 username이 필요합니다')
        }

        const queryParams = new URLSearchParams({ username })
        const response = await api.post<
          ApiResponse<QuickJoinResponse>
        >(
          `${this.baseUrl}/sessions/${sessionId}/refresh-token?${queryParams.toString()}`,
        )

        logger.info('테스트 API 토큰 갱신 성공', { sessionId })
        return response.data.result
      } else {
        // 정규 API: 인증 헤더 사용
        const response = await api.post<
          ApiResponse<QuickJoinResponse>
        >(`${this.baseUrl}/sessions/${sessionId}/refresh-token`)

        logger.info('정규 API 토큰 갱신 성공', { sessionId })
        return response.data.result
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        '토큰 갱신 실패'
      const errorCode = error?.response?.data?.code || 'UNKNOWN_ERROR'
      const statusCode = error?.response?.status

      logger.error('Refresh Token API 실패', {
        sessionId,
        error: errorMessage,
        code: errorCode,
        statusCode,
        isTestMode: this.isTestMode,
      })

      throw new VideoCallApiError(errorCode, errorMessage, statusCode)
    }
  }

  /**
   * 자동 재연결 API
   */
  async autoReconnect(
    sessionId: string,
    username?: string,
    lastConnectionId?: string,
  ): Promise<QuickJoinResponse> {
    logger.info('Auto Reconnect API 호출', {
      sessionId,
      lastConnectionId: lastConnectionId ? '[HIDDEN]' : undefined,
      isTestMode: this.isTestMode,
    })

    try {
      if (this.isTestMode) {
        // 테스트 API: 쿼리 파라미터로 전송
        if (!username) {
          throw new Error('테스트 모드에서는 username이 필요합니다')
        }

        const queryParams = new URLSearchParams({ username })
        if (lastConnectionId) {
          queryParams.append('lastConnectionId', lastConnectionId)
        }

        const response = await api.post<
          ApiResponse<QuickJoinResponse>
        >(
          `${this.baseUrl}/sessions/${sessionId}/auto-reconnect?${queryParams.toString()}`,
        )

        logger.info('테스트 API 자동 재연결 성공', { sessionId })
        return response.data.result
      } else {
        // 정규 API: form-urlencoded 방식
        const params = new URLSearchParams()
        if (lastConnectionId) {
          params.append('lastConnectionId', lastConnectionId)
        }

        const response = await api.post<
          ApiResponse<QuickJoinResponse>
        >(
          `${this.baseUrl}/sessions/${sessionId}/auto-reconnect`,
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )

        logger.info('정규 API 자동 재연결 성공', { sessionId })
        return response.data.result
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        '자동 재연결 실패'
      const errorCode = error?.response?.data?.code || 'UNKNOWN_ERROR'
      const statusCode = error?.response?.status

      logger.error('Auto Reconnect API 실패', {
        sessionId,
        error: errorMessage,
        code: errorCode,
        statusCode,
        isTestMode: this.isTestMode,
      })

      throw new VideoCallApiError(errorCode, errorMessage, statusCode)
    }
  }

  /**
   * 채팅 기록 저장 API
   */
  async saveChatHistory(
    sessionId: string,
    chatData: ChatSaveRequest,
  ): Promise<void> {
    logger.info('채팅 기록 저장 API 호출', {
      sessionId,
      messageCount: chatData.messages.length,
      isTestMode: this.isTestMode,
    })

    try {
      await api.post<ApiResponse<null>>(
        `${this.baseUrl}/chat/${sessionId}/save`,
        chatData,
      )

      logger.info('채팅 기록 저장 성공', {
        sessionId,
        messageCount: chatData.messages.length,
      })
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        '채팅 기록 저장 실패'
      const errorCode = error?.response?.data?.code || 'UNKNOWN_ERROR'
      const statusCode = error?.response?.status

      logger.error('채팅 기록 저장 API 실패', {
        sessionId,
        error: errorMessage,
        code: errorCode,
        statusCode,
        isTestMode: this.isTestMode,
      })

      throw new VideoCallApiError(errorCode, errorMessage, statusCode)
    }
  }

  /**
   * 채팅 기록 조회 API
   */
  async getChatHistory(
    sessionId: string,
  ): Promise<ChatHistoryResponse> {
    logger.debug('채팅 기록 조회 API 호출', {
      sessionId,
      isTestMode: this.isTestMode,
    })

    try {
      const response = await api.get<
        ApiResponse<ChatHistoryResponse>
      >(`${this.baseUrl}/chat/${sessionId}/history`)

      logger.info('채팅 기록 조회 성공', {
        sessionId,
        messageCount: response.data.result.totalMessages,
      })

      return response.data.result
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        '채팅 기록 조회 실패'
      const errorCode = error?.response?.data?.code || 'UNKNOWN_ERROR'
      const statusCode = error?.response?.status

      logger.error('채팅 기록 조회 API 실패', {
        sessionId,
        error: errorMessage,
        code: errorCode,
        statusCode,
        isTestMode: this.isTestMode,
      })

      throw new VideoCallApiError(errorCode, errorMessage, statusCode)
    }
  }

  /**
   * 현재 테스트 모드 여부 반환
   */
  getIsTestMode(): boolean {
    return this.isTestMode
  }

  /**
   * 현재 사용 중인 API 베이스 URL 반환
   */
  getBaseUrl(): string {
    return this.baseUrl
  }
}

// 싱글톤 인스턴스
export const videoCallApiService = new VideoCallApiService()
