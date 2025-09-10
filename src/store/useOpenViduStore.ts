'use client'

import type { Session, Publisher } from 'openvidu-browser'
import type { ConnectionEvent, StreamEvent } from 'openvidu-browser'
import { create } from 'zustand'

// 클라이언트 전용 어댑터 사용
import {
  OpenViduStore,
  Participant,
  ChatMessage,
  ChatMessageType,
  QuickJoinResponse,
  SessionConfigResponse,
  OPENVIDU_CONSTANTS,
  OPENVIDU_V3_FEATURES,
} from '@/components/openvidu/types'
import { featureFlags } from '@/lib/config/env'
import type {
  OpenViduSdkAdapter,
  AdapterEventHandlers,
} from '@/lib/openvidu/adapters'
import {
  openViduApi,
  openViduTestApi,
  getKoreanErrorMessage,
} from '@/lib/openvidu/api'
import { ChatManager } from '@/lib/openvidu/chatManager'
import {
  createOpenViduAdapterDynamic,
  assertBrowserOnly,
  isBrowser,
} from '@/lib/openvidu/client-only'
import { getPublisherMediaStream } from '@/lib/openvidu/utils'
import { createOpenViduLogger } from '@/lib/utils/openviduLogger'
import type { ScreenShareContext } from '@/shared/openvidu/replaceVideoTrack'

// ============================================================================
// 세션 종료 유틸리티
// ============================================================================

/**
 * 안전한 connection.data 파싱 (메타데이터 파싱 오류 방지)
 */
const safeParseConnectionData = (
  raw?: string,
): { nickname?: string; username?: string; raw?: string } => {
  if (!raw) return {}

  try {
    // '%/%' 구분자가 있는 경우 분리 처리
    const parts = raw.split('%/%')

    if (parts.length === 1) {
      // 순수 JSON만 있는 경우
      const trimmed = parts[0].trim()
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        return JSON.parse(trimmed)
      }
      // JSON이 아닌 순수 문자열
      return { nickname: trimmed, username: trimmed, raw }
    } else {
      // 레거시 혼합 포맷 처리: "prefix%/%{json}"
      const jsonPart = parts[1]?.trim()
      if (
        jsonPart &&
        jsonPart.startsWith('{') &&
        jsonPart.endsWith('}')
      ) {
        return JSON.parse(jsonPart)
      }
      // JSON 파싱 실패시 첫 번째 부분을 문자열로 사용
      return { nickname: parts[0], username: parts[0], raw }
    }
  } catch (error) {
    // 최후의 안전망: 원본 문자열을 그대로 사용
    logger.debug('connection.data 파싱 실패, 원본 사용', {
      raw,
      error,
    })
    return { nickname: raw, username: raw, raw }
  }
}

/**
 * Promise에 타임아웃 적용
 */
const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number = 5000,
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error('Operation timeout')),
        timeoutMs,
      ),
    ),
  ])
}

/**
 * 세션 종료 상태 추적용 (중복 호출 방지)
 */
let isLeavingSession = false

/**
 * 현재 활성 조인 시퀀스 (글로벌)
 */
let currentJoinSeq = 0

// ============================================================================
// 싱글톤 Promise 캐시 (중복 API 호출 방지)
// ============================================================================
let configPromise: Promise<SessionConfigResponse> | null = null
let quickJoinPromise: Promise<QuickJoinResponse> | null = null
let activeQuickJoinKey: string | null = null

// ============================================================================
// 싱글톤 어댑터 인스턴스 (클라이언트 전용)
// ============================================================================
let adapterInstance: OpenViduSdkAdapter | null = null
let adapterPromise: Promise<OpenViduSdkAdapter> | null = null

async function getAdapter(): Promise<OpenViduSdkAdapter> {
  assertBrowserOnly('getAdapter')

  if (adapterInstance) {
    return adapterInstance
  }

  // 이미 로딩 중이면 기존 Promise 반환
  if (adapterPromise) {
    return adapterPromise
  }

  // 새 어댑터 로드
  adapterPromise = createOpenViduAdapterDynamic()

  try {
    adapterInstance = await adapterPromise
    return adapterInstance
  } catch (error) {
    // 실패시 Promise 초기화
    adapterPromise = null
    throw error
  }
}

/**
 * Publisher의 streamPlaying 이벤트를 Promise로 기다리는 유틸리티
 */

// ============================================================================
// 초기 상태 정의
// ============================================================================

const initialState = {
  // OpenVidu 세션 상태
  session: null,
  publisher: null,
  participants: new Map<string, Participant>(),

  // 연결 상태
  isConnected: false,
  isPublishing: false,
  isScreenSharing: false,
  isJoining: false, // 조인 진행 중 플래그

  // 세션 정보
  currentSessionId: null,
  currentReservationId: null, // 기존 호환성을 위해 유지
  currentUsername: null,
  currentSessionName: null,
  sessionConfig: null,
  username: null,
  selfConnectionId: null, // 로컬 연결 ID 추적
  joinSequence: 0, // 조인 시퀀스 번호 (HMR/중복 방지)

  // 미디어 상태
  audioEnabled: true,
  videoEnabled: true,

  // 화면공유 상태 (Codex 솔루션 적용)
  isScreenSharingToggling: false, // 화면공유 토글 중 플래그
  screenPublisher: null as Publisher | null, // 화면공유 전용 Publisher (호환성 유지)
  originalVideoTrack: null as MediaStreamTrack | null, // replaceTrack 복원용 (호환성 유지)
  originalPublisher: null as Publisher | null, // Publisher 교체 복원용 (호환성 유지)
  screenShareCtx: null as ScreenShareContext | null, // ScreenShareContext 저장 (정리용)

  // 채팅
  chatMessages: [],
  chatManager: null as ChatManager | null,

  // UI 상태
  loading: false,
  configLoading: false,
  error: null,

  // API 호출 추적
  apiCallCount: {
    config: 0,
    quickJoin: 0,
  },

  // LiveKit 방식 상태 추가
  connectionState: 'disconnected' as
    | 'disconnected'
    | 'connecting'
    | 'connected'
    | 'reconnecting'
    | 'failed',
  participantStates: new Map<
    string,
    {
      connectionId: string
      isConnected: boolean
      lastSeen: Date
      reconnectAttempts: number
      mediaState: { audio: boolean; video: boolean }
    }
  >(),
  networkQuality: null as { level: number; latency: number } | null,
}

// 로거 생성
const logger = createOpenViduLogger('Store')

// ============================================================================
// Zustand Store 구현
// ============================================================================

export const useOpenViduStore = create<OpenViduStore>((set, get) => ({
  ...initialState,

  // ========================================================================
  // 세션 관리
  // ========================================================================

  joinSessionByReservation: async (reservationId: number) => {
    // SSR 안전 가드
    if (!isBrowser) {
      logger.warn('서버 환경에서 세션 연결 시도 무시됨')
      return
    }

    logger.info('세션 연결 시작', {
      op: 'joinSessionByReservation',
      reservationId,
    })

    // 조인 시퀀스 증가 및 설정
    currentJoinSeq += 1
    const myJoinSeq = currentJoinSeq

    // 상태 초기화 (LiveKit 방식)
    const { updateConnectionState } = get()
    updateConnectionState('connecting')
    set({
      loading: true,
      error: null,
      currentReservationId: reservationId,
      joinSequence: myJoinSeq,
    })

    const startTime = Date.now()

    try {
      // 1. 설정 정보 로드 (필요시)
      let sessionConfig = get().sessionConfig

      if (!sessionConfig) {
        const currentConfigLoading = get().configLoading

        if (currentConfigLoading) {
          logger.debug('설정 로딩 대기')
          // Config 로딩이 완료될 때까지 대기 (최대 10초)
          let waitCount = 0
          while (get().configLoading && waitCount < 100) {
            await new Promise((resolve) => setTimeout(resolve, 100))
            waitCount++
          }
          sessionConfig = get().sessionConfig
        }

        if (!sessionConfig) {
          set({ configLoading: true })

          try {
            sessionConfig = await openViduApi.getConfig()
            set({ sessionConfig, configLoading: false })
            logger.debug('설정 로드 성공')
          } catch {
            set({ configLoading: false })
            logger.debug('설정 로드 실패, 기본값 사용')
            // 설정 로드 실패해도 계속 진행
          }
        }
      }

      // 2. QuickJoin API 호출
      const quickJoinResponse: QuickJoinResponse =
        await openViduApi.quickJoin(reservationId)

      // 토큰 유효성 검증 가드
      if (
        !quickJoinResponse?.token ||
        !quickJoinResponse?.sessionId
      ) {
        logger.error('QuickJoin 응답 필수 필드 누락', {
          hasToken: !!quickJoinResponse?.token,
          hasSessionId: !!quickJoinResponse?.sessionId,
          responseKeys: Object.keys(quickJoinResponse || {}),
        })
        throw new Error(
          '세션 토큰이 응답에 없습니다. OpenVidu 서버 설정을 확인해주세요.',
        )
      }

      logger.debug('QuickJoin 성공', {
        sid: quickJoinResponse.sessionId,
      })

      // 3. 어댑터를 통한 세션 초기화
      const adapter = await getAdapter()
      const session = adapter.createSession()

      // 4. 이벤트 핸들러 설정
      setupSessionEventHandlers(adapter, session, set, get)

      // 조인 시퀀스 검증 (오래된 요청 무시)
      if (get().joinSequence !== myJoinSeq) {
        logger.debug('오래된 조인 요청 무시', {
          currentSeq: get().joinSequence,
          mySeq: myJoinSeq,
        })
        return
      }

      // 5. 세션 연결
      await adapter.connectSession(
        session,
        quickJoinResponse.token,
        quickJoinResponse.username,
      )

      // 연결 후 selfConnectionId 저장
      const selfConnectionId =
        (
          session as Session & {
            connection?: { connectionId: string }
          }
        )?.connection?.connectionId || null
      set({ selfConnectionId })

      if (selfConnectionId) {
        logger.debug('로컬 connectionId 저장', { selfConnectionId })
      }

      // 6. Publisher 생성 및 발행
      const publisher = await createAndPublishVideo(
        adapter,
        session,
        quickJoinResponse.configInfo,
      )

      // 7. ChatManager 생성
      const chatManager = new ChatManager(
        session,
        quickJoinResponse.username,
        (message: ChatMessage) => {
          const { chatMessages } = get()
          set({ chatMessages: [...chatMessages, message] })
          logger.debug('ChatManager를 통한 메시지 수신', {
            messageId: message.id,
            from: message.nickname,
          })
        },
      )

      // 8. v3 성능 최적화 기능 자동 활성화
      const { enableSimulcast, enableDynacast } = featureFlags

      if (enableSimulcast) {
        try {
          await get().toggleSimulcast(true)
          logger.info('Simulcast 자동 활성화 완료')
        } catch (error) {
          logger.warn('Simulcast 자동 활성화 실패', { error })
        }
      }

      if (enableDynacast) {
        try {
          await get().toggleDynacast(true)
          logger.info('Dynacast 자동 활성화 완료')
        } catch (error) {
          logger.warn('Dynacast 자동 활성화 실패', { error })
        }
      }

      // 네트워크 품질 모니터링 시작
      try {
        await get().startNetworkQualityMonitoring()
        logger.info('네트워크 품질 모니터링 자동 시작')
      } catch (error) {
        logger.warn('네트워크 품질 모니터링 시작 실패', { error })
      }

      // 마지막 조인 시퀀스 검증
      if (get().joinSequence !== myJoinSeq) {
        logger.debug('조인 완료 시점에서 시퀀스 불일치, 무시', {
          currentSeq: get().joinSequence,
          mySeq: myJoinSeq,
        })
        // 이미 생성된 리소스 정리
        try {
          await adapter.disconnectSession(session)
          chatManager?.cleanup()
        } catch {}
        return
      }

      // 9. 상태 업데이트 (LiveKit 방식)
      const newState = {
        session,
        publisher,
        chatManager,
        currentSessionId: quickJoinResponse.sessionId,
        username: quickJoinResponse.username,
        isConnected: true,
        isPublishing: true,
        isJoining: false,
        audioEnabled: quickJoinResponse.configInfo.autoEnableAudio,
        videoEnabled: quickJoinResponse.configInfo.autoEnableVideo,
        loading: false,
      }

      // 연결 상태 업데이트
      get().updateConnectionState('connected')

      set(newState)

      // Publisher가 생성되고 상태가 업데이트된 후 적응형 비디오 활성화
      try {
        await get().toggleAdaptiveVideo(true)
        logger.info('적응형 비디오 자동 활성화')
      } catch (error) {
        logger.warn('적응형 비디오 활성화 실패', { error })
      }

      logger.info('API 완료', {
        op: 'joinSessionByReservation',
        status: 'ok',
        durMs: Date.now() - startTime,
        sid: quickJoinResponse.sessionId,
      })
    } catch (error) {
      const errorMessage = getKoreanErrorMessage(error)

      // 오래된 요청인 경우 에러 무시
      if (get().joinSequence !== myJoinSeq) {
        logger.debug('오래된 조인 요청 에러 무시', {
          mySeq: myJoinSeq,
        })
        return
      }

      // LiveKit 방식: 연결 실패 상태 설정
      get().updateConnectionState('failed')

      set({
        loading: false,
        error: errorMessage,
        isJoining: false,
      })

      logger.error('API 실패', {
        op: 'joinSessionByReservation',
        status: 'fail',
        durMs: Date.now() - startTime,
        code: (error as Error & { code?: string })?.code,
        msg:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
    }
  },

  leaveSession: async () => {
    // 중복 호출 방지
    if (isLeavingSession) {
      logger.debug('세션 종료 이미 진행 중, 중복 호출 무시')
      return
    }

    isLeavingSession = true

    try {
      const {
        session,
        currentSessionId,
        chatMessages,
        chatManager,
        updateConnectionState,
        publisher,
      } = get()

      logger.info('세션 종료 시작', { sid: currentSessionId })

      // 상태를 먼저 disconnected로 변경 (UI 반응성)
      updateConnectionState('disconnected')

      // ChatManager 정리 (빠른 정리)
      if (chatManager) {
        try {
          chatManager.cleanup()
          logger.debug('ChatManager 정리 완료')
        } catch (error) {
          logger.warn('ChatManager 정리 실패', { error })
        }
      }

      // 로컬 Publisher 및 미디어 스트림 정리 (하드웨어 리소스 즉시 해제)
      const { screenPublisher, screenShareCtx } = get()

      // Codex 솔루션: 화면공유 Context 우선 정리
      if (screenShareCtx) {
        try {
          // 리스너 정리
          if (
            screenShareCtx.endedListener &&
            screenShareCtx.screenTrack
          ) {
            screenShareCtx.screenTrack.removeEventListener(
              'ended',
              screenShareCtx.endedListener,
            )
          }

          // 화면공유 트랙 및 스트림 정리
          screenShareCtx.screenTrack?.stop()
          screenShareCtx.displayStream
            ?.getTracks()
            .forEach((track: MediaStreamTrack) => {
              track.stop()
              logger.debug('화면공유 트랙 정지', {
                kind: track.kind,
                id: track.id,
              })
            })
          logger.debug('화면공유 context 정리 완료')
        } catch (error) {
          logger.warn('화면공유 context 정리 실패', { error })
        }
      }

      // 레거시 호환: screenPublisher도 정리
      if (screenPublisher) {
        try {
          const screenMediaStream =
            getPublisherMediaStream(screenPublisher)
          screenMediaStream?.getTracks().forEach((track) => {
            track.stop()
            logger.debug('레거시 화면공유 트랙 정지', {
              kind: track.kind,
              id: track.id,
            })
          })
          logger.debug('레거시 화면공유 미디어 스트림 정리 완료')
        } catch (error) {
          logger.warn('레거시 화면공유 정리 실패', { error })
        }
      }

      if (publisher) {
        try {
          // Publisher 이벤트 리스너 제거
          publisher.off('accessDenied')
          publisher.off('accessAllowed')
          publisher.off('streamCreated')
          publisher.off('streamDestroyed')
          // publisher.off('exception') // OpenVidu v2에서는 'exception' 이벤트가 없음

          // 미디어 스트림 정리
          const mediaStream = publisher.stream?.getMediaStream?.()
          if (mediaStream) {
            mediaStream
              .getTracks()
              .forEach((track: MediaStreamTrack) => {
                try {
                  track.stop()
                  logger.debug('미디어 트랙 정지', {
                    kind: track.kind,
                    id: track.id,
                  })
                } catch {
                  // track.stop() 실패는 무시
                }
              })
          }

          // Publisher 자체 정리 (가능한 경우)
          if (
            typeof (publisher as Publisher & { destroy?: () => void })
              .destroy === 'function'
          ) {
            try {
              ;(
                publisher as Publisher & { destroy: () => void }
              ).destroy()
              logger.debug('Publisher 객체 정리 완료')
            } catch (e) {
              logger.debug('Publisher destroy 실패 (무시)', {
                error: e,
              })
            }
          }
        } catch (error) {
          logger.debug('로컬 Publisher 정리 중 오류', { error })
        }
      }

      // 백그라운드 작업들 (실패해도 UI에 영향 없음)
      try {
        // 채팅 히스토리 저장 (선택적, 비차단)
        if (currentSessionId && chatMessages.length > 0) {
          // 백그라운드에서 실행하되 오류는 무시
          openViduApi
            .saveChatHistory(currentSessionId, {
              messages: chatMessages.map((msg) => ({
                username: msg.nickname,
                message: msg.message,
                timestamp: msg.timestamp.toISOString(),
                type: msg.type.toUpperCase() as ChatMessageType,
              })),
              sessionStartTime: new Date().toISOString(),
              sessionEndTime: new Date().toISOString(),
            })
            .catch(() => {
              logger.debug('채팅 히스토리 저장 실패 (무시)')
            })
        }

        // 세션 이벤트 리스너 정리 (먼저 수행)
        if (session) {
          try {
            // 세션 이벤트 리스너 전체 제거
            if (typeof session.off === 'function') {
              session.off('connectionCreated')
              session.off('connectionDestroyed')
              session.off('streamCreated')
              session.off('streamDestroyed')
              session.off('signal:chat')
              session.off('signal:chat-chunk')
              session.off('exception')
              session.off('sessionDisconnected')
              session.off('reconnecting')
              session.off('reconnected')
              logger.debug('세션 이벤트 리스너 정리 완료')
            }

            // WebSocket 연결 해제 (상태 확인 후 시도)
            const ws = (
              session as Session & {
                openvidu?: { openviduWS?: WebSocket }
              }
            )?.openvidu?.openviduWS
            const wsOpen = ws && ws.readyState === WebSocket.OPEN

            if (wsOpen && typeof session.disconnect === 'function') {
              logger.debug('WebSocket 열림 상태, 정상 연결 해제 시도')

              // 어댑터를 통한 안전한 연결 해제 (타임아웃 적용)
              const adapter = await getAdapter()
              await withTimeout(
                Promise.resolve(adapter.disconnectSession(session)),
                3000, // 3초 타임아웃
              )
              logger.debug('세션 연결 해제 완룼')
            } else {
              logger.debug(
                'WebSocket 닫힘 또는 세션 무효, 서버 정리에 의존',
              )
            }
          } catch (error) {
            // 연결 해제 실패는 로그만 남기고 무시 (unmount 시점에서는 정상)
            logger.debug('세션 연결 해제 실패 (무시)', {
              msg:
                error instanceof Error
                  ? error.message
                  : '알 수 없는 오류',
              isTimeout:
                error instanceof Error &&
                error.message.includes('timeout'),
            })
          }
        }
      } catch (error) {
        // 백그라운드 정리 작업 실패는 무시
        logger.debug('백그라운드 정리 작업 실패 (무시)', { error })
      }
    } finally {
      // 상태 초기화는 반드시 실행 (오류 발생 여부와 관계없이)
      try {
        const preservedConfig = get().sessionConfig

        // Promise 캐시 초기화
        quickJoinPromise = null
        activeQuickJoinKey = null

        set({
          ...initialState,
          sessionConfig: preservedConfig,
          username: null,
          apiCallCount: { config: 0, quickJoin: 0 },
          joinSequence: 0, // 조인 시퀀스 초기화
          screenShareCtx: null, // ScreenShareContext 초기화
        })

        logger.info('세션 종료 완료')
      } catch (error) {
        logger.error('상태 초기화 실패', { error })
      }

      // 중복 호출 방지 플래그 리셋
      isLeavingSession = false
    }
  },

  joinTestSession: async (username: string, sessionName: string) => {
    // SSR 안전 가드
    if (!isBrowser) {
      logger.warn('서버 환경에서 테스트 세션 연결 시도 무시됨')
      return
    }

    // 중복 조인 방지
    const { isJoining, isConnected } = get()
    if (isJoining) {
      logger.warn('이미 조인 진행 중')
      return
    }

    if (
      isConnected &&
      get().currentUsername === username &&
      get().currentSessionName === sessionName
    ) {
      logger.debug('이미 같은 세션에 연결됨')
      return
    }

    // 조인 시퀀스 증가 및 설정
    currentJoinSeq += 1
    const myJoinSeq = currentJoinSeq

    logger.info('세션 연결 시작', {
      op: 'joinTestSession',
      username,
      sessionName,
      joinSeq: myJoinSeq,
    })

    // 다른 세션에 연결된 경우 먼저 연결 해제
    if (
      isConnected &&
      (get().currentUsername !== username ||
        get().currentSessionName !== sessionName)
    ) {
      await get().leaveSession()
    }

    const currentState = get()
    if (
      currentState.isConnected &&
      currentState.currentUsername === username &&
      currentState.currentSessionName === sessionName
    ) {
      logger.debug('이미 같은 세션에 연결됨')
      return
    }

    // 상태 초기화
    set({
      loading: true,
      error: null,
      isJoining: true,
      currentUsername: username,
      currentSessionName: sessionName,
      joinSequence: myJoinSeq,
    })

    const startTime = Date.now()

    try {
      // 1. 설정 정보 로드 (필요시 - 싱글톤 패턴)
      let sessionConfig = get().sessionConfig

      if (!sessionConfig) {
        // 이미 config 로딩 중인 Promise가 있으면 재사용
        if (configPromise) {
          try {
            sessionConfig = await configPromise
          } catch {
            configPromise = null // Promise 초기화
          }
        }

        // 여전히 설정이 없으면 새로 로드
        if (!sessionConfig) {
          // API 호출 카운트 증가
          const currentCount = get().apiCallCount.config
          set({
            configLoading: true,
            apiCallCount: {
              ...get().apiCallCount,
              config: currentCount + 1,
            },
          })

          // 새 Promise 생성하여 캐싱
          configPromise = openViduTestApi.getConfig()

          try {
            sessionConfig = await configPromise
            set({ sessionConfig, configLoading: false })
            logger.debug('설정 로드 성공')
          } catch {
            set({ configLoading: false })
            configPromise = null // 실패시 Promise 초기화
            logger.debug('설정 로드 실패, 기본값 사용')
          }
        }
      }

      // 2. Test QuickJoin API 호출 (중복 호출 방지)

      // QuickJoin Promise 키 생성 (username + sessionName)
      const quickJoinKey = `${username}:${sessionName}`

      // 이미 동일한 키로 진행 중인 QuickJoin이 있는지 확인
      if (activeQuickJoinKey === quickJoinKey && quickJoinPromise) {
        logger.debug('동일한 QuickJoin 요청 진행 중')
        try {
          await quickJoinPromise
          logger.debug('기존 Promise로 QuickJoin 완료')
          // QuickJoin 성공 후 계속 진행
        } catch (error) {
          logger.debug('기존 QuickJoin Promise 실패')
          quickJoinPromise = null
          activeQuickJoinKey = null
          throw error // 에러를 다시 던져서 catch 블록에서 처리
        }
      }

      // API 호출 카운트 증가
      const currentQuickJoinCount = get().apiCallCount.quickJoin
      set({
        apiCallCount: {
          ...get().apiCallCount,
          quickJoin: currentQuickJoinCount + 1,
        },
      })
      // 중복 호출 감지 경고
      if (currentQuickJoinCount > 0) {
        logger.warn('QuickJoin API 중복 호출', {
          count: currentQuickJoinCount,
        })
      }

      // 새 Promise 생성하여 캐싱
      activeQuickJoinKey = quickJoinKey
      quickJoinPromise = openViduTestApi.quickJoin(
        username,
        sessionName,
      )

      const quickJoinResponse: QuickJoinResponse =
        await quickJoinPromise

      // 성공시 Promise 캐시 정리
      quickJoinPromise = null
      activeQuickJoinKey = null

      // 토큰 유효성 검증 가드
      if (
        !quickJoinResponse?.token ||
        !quickJoinResponse?.sessionId
      ) {
        logger.error('QuickJoin 응답 필수 필드 누락', {
          hasToken: !!quickJoinResponse?.token,
          hasSessionId: !!quickJoinResponse?.sessionId,
          responseKeys: Object.keys(quickJoinResponse || {}),
        })
        throw new Error(
          '세션 토큰이 응답에 없습니다. OpenVidu 서버 설정을 확인해주세요.',
        )
      }

      logger.debug('Test QuickJoin 성공', {
        sid: quickJoinResponse.sessionId,
      })

      // 3. 어댑터를 통한 세션 초기화
      const adapter = await getAdapter()
      const session = adapter.createSession()

      // 4. 이벤트 핸들러 설정
      setupSessionEventHandlers(adapter, session, set, get)

      // 5. 세션 연결
      await adapter.connectSession(
        session,
        quickJoinResponse.token,
        quickJoinResponse.username,
      )

      // 6. Publisher 생성 및 발행
      const publisher = await createAndPublishVideo(
        adapter,
        session,
        quickJoinResponse.configInfo,
      )

      // 7. ChatManager 생성
      const chatManager = new ChatManager(
        session,
        quickJoinResponse.username,
        (message: ChatMessage) => {
          const { chatMessages } = get()
          set({ chatMessages: [...chatMessages, message] })
          logger.debug('ChatManager를 통한 메시지 수신', {
            messageId: message.id,
            from: message.nickname,
          })
        },
      )

      // 8. v3 성능 최적화 기능 자동 활성화 (테스트 환경)
      const { enableSimulcast, enableDynacast } = featureFlags

      if (enableSimulcast) {
        try {
          await get().toggleSimulcast(true)
          logger.info('테스트: Simulcast 자동 활성화 완료')
        } catch (error) {
          logger.warn('테스트: Simulcast 자동 활성화 실패', { error })
        }
      }

      if (enableDynacast) {
        try {
          await get().toggleDynacast(true)
          logger.info('테스트: Dynacast 자동 활성화 완료')
        } catch (error) {
          logger.warn('테스트: Dynacast 자동 활성화 실패', { error })
        }
      }

      // 네트워크 품질 모니터링 시작
      try {
        await get().startNetworkQualityMonitoring()
        logger.info('테스트: 네트워크 품질 모니터링 자동 시작')
      } catch (error) {
        logger.warn('테스트: 네트워크 품질 모니터링 시작 실패', {
          error,
        })
      }

      // 9. 상태 업데이트
      logger.info('최종 상태 업데이트')
      const newState = {
        session,
        publisher,
        chatManager,
        currentSessionId: quickJoinResponse.sessionId,
        username: quickJoinResponse.username,
        currentUsername: username,
        currentSessionName: sessionName,
        isConnected: true,
        isPublishing: true,
        audioEnabled: quickJoinResponse.configInfo.autoEnableAudio,
        videoEnabled: quickJoinResponse.configInfo.autoEnableVideo,
        loading: false,
      }

      set(newState)

      // Publisher가 생성되고 상태가 업데이트된 후 적응형 비디오 활성화
      try {
        await get().toggleAdaptiveVideo(true)
        logger.info('테스트: 적응형 비디오 자동 활성화')
      } catch (error) {
        logger.warn('테스트: 적응형 비디오 활성화 실패', { error })
      }

      logger.info('API 완료', {
        op: 'joinTestSession',
        status: 'ok',
        durMs: Date.now() - startTime,
        sid: quickJoinResponse.sessionId,
      })
    } catch (error) {
      const errorMessage = getKoreanErrorMessage(error)
      set({
        loading: false,
        error: errorMessage,
      })

      logger.error('API 실패', {
        op: 'joinTestSession',
        status: 'fail',
        durMs: Date.now() - startTime,
        code: (error as Error & { code?: string })?.code,
        msg:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
    }
  },

  // ========================================================================
  // 미디어 제어
  // ========================================================================

  toggleAudio: async () => {
    const { publisher, audioEnabled } = get()

    if (publisher) {
      try {
        const adapter = await getAdapter()
        const newAudioEnabled = !audioEnabled
        adapter.toggleAudio(publisher, newAudioEnabled)
        set({ audioEnabled: newAudioEnabled })
        logger.debug('오디오 토글', { enabled: newAudioEnabled })
      } catch (error) {
        logger.error('오디오 토글 실패', { error })
        // 폴백: 직접 Publisher 메소드 호출
        const newAudioEnabled = !audioEnabled
        if (
          'publishAudio' in publisher &&
          typeof publisher.publishAudio === 'function'
        ) {
          publisher.publishAudio(newAudioEnabled)
          set({ audioEnabled: newAudioEnabled })
        }
      }
    }
  },

  toggleVideo: async () => {
    const { publisher, videoEnabled } = get()

    if (publisher) {
      try {
        const adapter = await getAdapter()
        const newVideoEnabled = !videoEnabled
        adapter.toggleVideo(publisher, newVideoEnabled)
        set({ videoEnabled: newVideoEnabled })
        logger.debug('비디오 토글', { enabled: newVideoEnabled })
      } catch (error) {
        logger.error('비디오 토글 실패', { error })
        // 폴백: 직접 Publisher 메소드 호출
        const newVideoEnabled = !videoEnabled
        if (
          'publishVideo' in publisher &&
          typeof publisher.publishVideo === 'function'
        ) {
          publisher.publishVideo(newVideoEnabled)
          set({ videoEnabled: newVideoEnabled })
        }
      }
    }
  },

  startScreenShare: async () => {
    const { publisher, isScreenSharing, isScreenSharingToggling } =
      get()

    if (!publisher || isScreenSharing || isScreenSharingToggling) {
      logger.debug('화면공유 시작 불가', {
        hasPublisher: !!publisher,
        isScreenSharing,
        isScreenSharingToggling,
      })
      return
    }

    // 신규 공유 유틸리티 사용
    const { swapToScreen } = await import(
      '@/shared/openvidu/replaceVideoTrack'
    )

    set({ isScreenSharingToggling: true })

    try {
      const ctx = await swapToScreen(publisher)

      // 브라우저/OS UI에서 직접 중단 시도 대응 (리스너 정리를 위해 ctx에 저장)
      const endedListener = async () => {
        logger.debug('화면공유 트랙 자동 종료 감지')
        try {
          await get().stopScreenShare()
        } catch (error) {
          logger.error('화면공유 자동 종료 실패', { error })
        }
      }
      ctx.endedListener = endedListener
      ctx.screenTrack?.addEventListener('ended', endedListener)

      set({
        isScreenSharing: true,
        originalVideoTrack: ctx.cameraTrack, // 기존 호환성을 위해 유지
        screenShareCtx: ctx, // ScreenShareContext 저장 (정리용)
      })
      logger.info('화면공유 시작 완료 (신규 유틸리티 사용)')
    } catch (error: unknown) {
      logger.error('화면공유 시작 실패', {
        error: error instanceof Error ? error.message : String(error),
      })

      // 안전 복구
      set({
        isScreenSharing: false,
        originalVideoTrack: null,
        screenShareCtx: null,
      })
      throw error
    } finally {
      set({ isScreenSharingToggling: false })
    }
  },

  stopScreenShare: async () => {
    const {
      publisher,
      isScreenSharingToggling,
      isScreenSharing,
      screenShareCtx,
    } = get()

    if (!publisher || isScreenSharingToggling || !isScreenSharing) {
      return
    }

    set({ isScreenSharingToggling: true })

    try {
      logger.debug('화면공유 중지 시작 - 신규 유틸리티 사용')

      // 신규 공유 유틸리티 사용
      const { swapToCamera } = await import(
        '@/shared/openvidu/replaceVideoTrack'
      )

      if (screenShareCtx) {
        // 저장된 ScreenShareContext 사용 (안전한 정리)
        await swapToCamera(publisher, screenShareCtx)
        logger.debug('저장된 context로 카메라 복원 완료')
      } else {
        // fallback: 레거시 호환을 위한 기본 처리
        logger.warn(
          'screenShareCtx가 없어 기본 비디오 비활성화로 처리',
        )
        await publisher.publishVideo(false)
      }
    } catch (error) {
      logger.error('화면공유 중지 실패', { error })
      // 실패해도 상태는 정리
    } finally {
      set({
        isScreenSharing: false,
        isScreenSharingToggling: false,
        originalVideoTrack: null,
        screenPublisher: null,
        screenShareCtx: null,
      })
      logger.info('화면공유 중지 완료')
    }
  },

  toggleScreenShare: async () => {
    const { isScreenSharing } = get()

    if (isScreenSharing) {
      await get().stopScreenShare()
    } else {
      await get().startScreenShare()
    }
  },

  // ========================================================================
  // 채팅
  // ========================================================================

  sendChatMessage: async (message: string) => {
    const { chatManager } = get()

    if (!chatManager) {
      logger.warn('ChatManager가 초기화되지 않았습니다.')
      set({ error: '채팅 시스템이 준비되지 않았습니다.' })
      return
    }

    const trimmedMessage = message.trim()
    if (!trimmedMessage) return

    try {
      const success = await chatManager.sendMessage(trimmedMessage)
      if (success) {
        logger.debug('채팅 전송 성공', {
          length: trimmedMessage.length,
        })
      } else {
        logger.warn('채팅 전송 실패 - 재시도 횟수 초과')
        set({
          error: '메시지 전송에 실패했습니다. 다시 시도해주세요.',
        })
      }
    } catch (error) {
      logger.error('채팅 전송 실패', {
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
        messageLength: trimmedMessage.length,
      })
      set({
        error:
          error instanceof Error
            ? error.message
            : '메시지 전송에 실패했습니다.',
      })
    }
  },

  // ========================================================================
  // 유틸리티
  // ========================================================================

  refreshToken: async () => {
    const { currentSessionId, session } = get()

    if (!currentSessionId) {
      throw new Error('현재 세션이 없습니다.')
    }

    try {
      await openViduApi.refreshToken(currentSessionId)

      // 새 토큰으로 재연결
      if (session) {
        // TODO: OpenVidu에서 토큰 갱신은 복잡한 과정이므로 필요시 구현
        logger.debug('토큰 갱신 완료')
      }
    } catch (error) {
      logger.error('토큰 갱신 실패', {
        msg:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
      throw error
    }
  },

  autoReconnect: async () => {
    const {
      currentSessionId,
      currentReservationId,
      selfConnectionId,
      currentUsername,
    } = get()

    if (!currentSessionId) {
      throw new Error('재연결할 세션 ID가 없습니다.')
    }

    try {
      // 예약 ID가 있는 경우 (joinSessionByReservation 방식)
      if (currentReservationId) {
        const reconnectResponse = await openViduApi.autoReconnect(
          currentSessionId,
          selfConnectionId || undefined,
        )

        logger.info('예약 기반 자동 재연결 완료', {
          sessionId: reconnectResponse.sessionId,
          lastConnectionId: selfConnectionId,
        })
      }
      // 테스트 세션인 경우 (joinTestSession 방식)
      else if (currentUsername) {
        await openViduTestApi.autoReconnect(
          currentSessionId,
          currentUsername,
          selfConnectionId || undefined,
        )

        logger.info('테스트 세션 자동 재연결 완뢬', {
          sessionId: currentSessionId,
          username: currentUsername,
          lastConnectionId: selfConnectionId,
        })
      } else {
        throw new Error(
          '재연결에 필요한 정보가 부족합니다. (예약ID 또는 사용자명)',
        )
      }
    } catch (error) {
      logger.error('자동 재연결 실패', {
        msg:
          error instanceof Error ? error.message : '알 수 없는 오류',
        selfConnectionId,
        currentSessionId,
      })
      throw error
    }
  },

  clearError: () => {
    set({ error: null })
  },

  // ========================================================================
  // LiveKit 방식 상태 관리
  // ========================================================================

  updateConnectionState: (
    state:
      | 'disconnected'
      | 'connecting'
      | 'connected'
      | 'reconnecting'
      | 'failed',
  ) => {
    const prevState = get().connectionState
    set({ connectionState: state })

    logger.debug('연결 상태 변경', {
      from: prevState,
      to: state,
      timestamp: new Date().toISOString(),
    })

    // 연결 상태에 따른 UI 상태 동기화
    if (state === 'connected') {
      set({ isConnected: true, loading: false })
    } else if (state === 'connecting' || state === 'reconnecting') {
      set({ loading: true })
    } else if (state === 'disconnected' || state === 'failed') {
      set({ isConnected: false, loading: false })
    }
  },

  updateParticipantState: (
    connectionId: string,
    updates: Partial<{
      isConnected: boolean
      mediaState: { audio: boolean; video: boolean }
      reconnectAttempts: number
    }>,
  ) => {
    const { participantStates } = get()
    const newStates = new Map(participantStates)
    const existing = newStates.get(connectionId) || {
      connectionId,
      isConnected: false,
      lastSeen: new Date(),
      reconnectAttempts: 0,
      mediaState: { audio: false, video: false },
    }

    const updated = {
      ...existing,
      ...updates,
      lastSeen: new Date(),
    }

    newStates.set(connectionId, updated)
    set({ participantStates: newStates })

    logger.debug('참가자 상태 업데이트', {
      connectionId,
      updates,
      finalState: updated,
    })
  },

  updateNetworkQuality: (quality: {
    level: number
    latency: number
  }) => {
    set({ networkQuality: quality })

    logger.debug('네트워크 품질 업데이트', quality)

    // 품질에 따른 자동 대응
    if (quality.level <= 2) {
      logger.warn('네트워크 품질 저하 감지', quality)
    }
  },

  handleReconnection: async () => {
    const {
      session,
      currentSessionId,
      currentReservationId,
      updateConnectionState,
    } = get()

    if (!session) return

    try {
      updateConnectionState('reconnecting')

      // 재연결 로직
      if (currentReservationId) {
        await get().joinSessionByReservation(currentReservationId)
      } else if (currentSessionId) {
        // 토큰 갱신 시도
        await get().refreshToken()
      }

      updateConnectionState('connected')
      logger.info('재연결 성공')
    } catch (error) {
      updateConnectionState('failed')
      logger.error('재연결 실패', { error })
      set({ error: '재연결에 실패했습니다.' })
    }
  },

  // ========================================================================
  // v3 성능 최적화 기능들
  // ========================================================================

  /**
   * 품질 프로파일 설정
   */
  setQualityProfile: async (
    profile: 'low' | 'medium' | 'high' | 'auto',
  ) => {
    const { session } = get()
    if (!session) {
      logger.warn('세션이 없어 품질 프로파일 설정 불가')
      return
    }

    try {
      const adapter = await getAdapter()

      if (adapter.setQualityProfile) {
        const profileSettings =
          OPENVIDU_V3_FEATURES.QUALITY_PROFILES[
            profile.toUpperCase() as keyof typeof OPENVIDU_V3_FEATURES.QUALITY_PROFILES
          ] || OPENVIDU_V3_FEATURES.QUALITY_PROFILES.MEDIUM

        const qualityProfile = {
          name: profile,
          videoProfile: {
            resolution: profileSettings.resolution,
            frameRate: profileSettings.frameRate,
            bitrate: profileSettings.bitrate,
          },
          adaptiveVideo: profile === 'auto',
          simulcast: profile === 'high' || profile === 'auto',
          dynacast: true,
        }

        await adapter.setQualityProfile(session, qualityProfile)

        // 백엔드 API 연동
        if (get().currentSessionId) {
          await openViduApi.updateQualityProfile(
            get().currentSessionId!,
            profile,
          )
        }

        logger.info('품질 프로파일 설정 완료', { profile })
      } else {
        logger.debug('어댑터에서 품질 프로파일 미지원')
      }
    } catch (error) {
      logger.error('품질 프로파일 설정 실패', {
        profile,
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
      set({ error: '품질 설정에 실패했습니다.' })
    }
  },

  /**
   * Simulcast 활성화/비활성화
   */
  toggleSimulcast: async (enabled: boolean) => {
    const { publisher } = get()
    if (!publisher) {
      logger.warn('Publisher가 없어 Simulcast 설정 불가')
      return
    }

    try {
      const adapter = await getAdapter()

      if (enabled && adapter.enableSimulcast) {
        const layers = [
          {
            rid: 'low',
            resolution: '320x240',
            frameRate: 15,
            bitrate: 150,
            enabled: true,
          },
          {
            rid: 'medium',
            resolution: '640x480',
            frameRate: 24,
            bitrate: 500,
            enabled: true,
          },
          {
            rid: 'high',
            resolution: '1280x720',
            frameRate: 30,
            bitrate: 1200,
            enabled: true,
          },
        ]
        await adapter.enableSimulcast(publisher, layers)
        logger.info('Simulcast 활성화 완료')
      } else if (!enabled && adapter.disableSimulcast) {
        await adapter.disableSimulcast(publisher)
        logger.info('Simulcast 비활성화 완료')
      }
    } catch (error) {
      logger.error('Simulcast 설정 실패', {
        enabled,
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
      set({ error: 'Simulcast 설정에 실패했습니다.' })
    }
  },

  /**
   * Dynacast 활성화/비활성화
   */
  toggleDynacast: async (enabled: boolean) => {
    const { session } = get()
    if (!session) {
      logger.warn('세션이 없어 Dynacast 설정 불가')
      return
    }

    try {
      const adapter = await getAdapter()

      if (enabled && adapter.enableDynacast) {
        await adapter.enableDynacast(session)
        logger.info('Dynacast 활성화 완료')
      } else if (!enabled && adapter.disableDynacast) {
        await adapter.disableDynacast(session)
        logger.info('Dynacast 비활성화 완료')
      }
    } catch (error) {
      logger.error('Dynacast 설정 실패', {
        enabled,
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
      set({ error: 'Dynacast 설정에 실패했습니다.' })
    }
  },

  /**
   * 네트워크 품질 모니터링 시작
   */
  startNetworkQualityMonitoring: async () => {
    const { session } = get()
    if (!session) return

    try {
      const adapter = await getAdapter()

      if (adapter.onNetworkQualityChanged) {
        adapter.onNetworkQualityChanged((quality) => {
          get().updateNetworkQuality(quality)
        })
        logger.info('네트워크 품질 모니터링 시작')
      }
    } catch (error) {
      logger.error('네트워크 품질 모니터링 시작 실패', { error })
    }
  },

  /**
   * 현재 네트워크 품질 조회
   */
  getCurrentNetworkQuality: async () => {
    const { session } = get()
    if (!session) return null

    try {
      const adapter = await getAdapter()

      if (adapter.getNetworkQuality) {
        const quality = await adapter.getNetworkQuality(session)
        if (quality) {
          get().updateNetworkQuality(quality)
          return quality
        }
      }
    } catch (error) {
      logger.error('네트워크 품질 조회 실패', { error })
    }

    return null
  },

  /**
   * 자동 품질 조정 활성화/비활성화
   */
  toggleAdaptiveVideo: async (enabled: boolean) => {
    const { publisher } = get()
    if (!publisher) {
      logger.warn('Publisher가 없어 적응형 비디오 설정 불가')
      return
    }

    try {
      const adapter = await getAdapter()

      if (adapter.enableAdaptiveVideo) {
        await adapter.enableAdaptiveVideo(publisher, enabled)
        logger.info('적응형 비디오 설정 완료', { enabled })
      }
    } catch (error) {
      logger.error('적응형 비디오 설정 실패', {
        enabled,
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
      set({ error: '적응형 비디오 설정에 실패했습니다.' })
    }
  },
}))

// ============================================================================
// 헬퍼 함수들
// ============================================================================

/**
 * 세션 이벤트 핸들러 설정 (상세한 디버깅 로그 포함)
 */
// 이벤트 로거 생성
const eventLogger = createOpenViduLogger('Event')

function setupSessionEventHandlers(
  adapter: OpenViduSdkAdapter,
  session: Session,
  set: (partial: Partial<OpenViduStore>) => void,
  get: () => OpenViduStore,
) {
  const eventHandlers: AdapterEventHandlers = {
    onConnectionCreated: (event: ConnectionEvent) => {
      const { updateParticipantState } = get()

      // LiveKit 방식: 참가자 상태 추적
      updateParticipantState(event.connection.connectionId, {
        isConnected: true,
        mediaState: { audio: false, video: false },
        reconnectAttempts: 0,
      })

      eventLogger.info('연결 생성', {
        cid: event.connection.connectionId,
        timestamp: new Date().toISOString(),
      })
    },

    onConnectionDestroyed: (event: ConnectionEvent) => {
      // 안전한 연결 검증
      if (!event?.connection?.connectionId) {
        eventLogger.warn('연결 종료 이벤트에 connectionId 없음')
        return
      }

      const { participants, updateParticipantState } = get()

      const connectionId = event.connection.connectionId

      // 기존 참가자 목록에서 안전하게 제거 (존재하지 않아도 오류 없음)
      const newParticipants = new Map(participants)
      if (newParticipants.has(connectionId)) {
        newParticipants.delete(connectionId)
        set({ participants: newParticipants })
        eventLogger.debug('참가자 목록에서 제거', { connectionId })
      } else {
        eventLogger.debug('이미 제거되었거나 존재하지 않는 참가자', {
          connectionId,
        })
      }

      // LiveKit 방식: 참가자 상태 업데이트 (완전 제거 대신 연결 끊김으로 표시)
      updateParticipantState(event.connection.connectionId, {
        isConnected: false,
      })

      eventLogger.info('연결 종료', {
        cid: event.connection.connectionId,
        reason: (event as { reason?: string }).reason || 'unknown',
        timestamp: new Date().toISOString(),
      })

      // 재연결 대기 시간 후 상태 정리 (30초)
      setTimeout(() => {
        const currentStates = get().participantStates
        const newStates = new Map(currentStates)
        newStates.delete(event.connection.connectionId)
        set({ participantStates: newStates })
      }, 30000)
    },

    onStreamCreated: (event: StreamEvent) => {
      // 안전한 연결 및 스트림 검증
      if (!event?.stream?.connection) {
        eventLogger.warn('스트림 생성 이벤트에 연결 정보 없음')
        return
      }

      // 현재 세션이 유효한지 확인 (HMR/언마운트 대응)
      if (
        !session ||
        (session as Session & { disposed?: boolean }).disposed
      ) {
        eventLogger.debug('세션이 무효하여 스트림 생성 무시', {
          streamId: event.stream.streamId,
        })
        return
      }

      const subscriber = session.subscribe(event.stream, undefined)

      // 안전한 메타데이터 파싱
      const participantData = safeParseConnectionData(
        event.stream.connection.data,
      )
      const nickname =
        participantData.nickname || participantData.username || '-'

      const participant: Participant = {
        connectionId: event.stream.connection.connectionId,
        nickname,
        streamManager: subscriber,
        audioEnabled: event.stream.hasAudio,
        videoEnabled: event.stream.hasVideo,
        isScreenSharing: event.stream.typeOfVideo === 'SCREEN',
      }

      // LiveKit 방식: 트랙별 상태 관리
      const { participants, updateParticipantState } = get()
      const newParticipants = new Map(participants)
      newParticipants.set(
        event.stream.connection.connectionId,
        participant,
      )
      set({ participants: newParticipants })

      // 참가자 미디어 상태 업데이트
      updateParticipantState(event.stream.connection.connectionId, {
        mediaState: {
          audio: event.stream.hasAudio,
          video: event.stream.hasVideo,
        },
      })

      eventLogger.info('스트림 생성', {
        sid: event.stream.streamId,
        user: nickname,
        tracks: {
          audio: event.stream.hasAudio,
          video: event.stream.hasVideo,
          screen: event.stream.typeOfVideo === 'SCREEN',
        },
        timestamp: new Date().toISOString(),
      })

      // 트랙 상태 변화 모니터링 (LiveKit 방식)
      subscriber.on('videoElementCreated', () => {
        eventLogger.debug('비디오 엘리먼트 생성', {
          sid: event.stream.streamId,
        })
      })

      subscriber.on('videoElementDestroyed', () => {
        eventLogger.debug('비디오 엘리먼트 제거', {
          sid: event.stream.streamId,
        })
      })
    },

    onStreamDestroyed: (event: StreamEvent) => {
      // 안전한 스트림 및 연결 검증
      if (!event?.stream?.connection?.connectionId) {
        eventLogger.warn('스트림 제거 이벤트에 연결 정보 없음')
        return
      }

      const { participants, screenPublisher } = get()
      const connectionId = event.stream.connection.connectionId

      // Codex 솔루션: 화면공유 Publisher 자동 정리
      if (
        screenPublisher &&
        screenPublisher.stream.streamId === event.stream.streamId
      ) {
        // 서버/브라우저 쪽에서 화면공유 스트림이 파괴된 경우 상태 정리
        set({ screenPublisher: null, isScreenSharing: false })
        eventLogger.info('화면공유 스트림 자동 정리 완료', {
          streamId: event.stream.streamId,
        })
      }

      // 안전한 참가자 제거
      const newParticipants = new Map(participants)
      if (newParticipants.has(connectionId)) {
        newParticipants.delete(connectionId)
        set({ participants: newParticipants })
        eventLogger.info('스트림 제거 완료', {
          sid: event.stream.streamId,
          connectionId,
        })
      } else {
        eventLogger.debug('이미 제거된 스트림', {
          sid: event.stream.streamId,
          connectionId,
        })
      }
    },

    // onSignal은 ChatManager에서 직접 처리하므로 여기서는 생략

    onException: (exception) => {
      const exceptionObj = exception as {
        name?: string
        message?: string
      }

      eventLogger.error('세션 예외', {
        name: exceptionObj.name || 'Unknown',
        msg: exceptionObj.message || 'Unknown error',
      })

      // 심각한 예외의 경우 에러 상태로 업데이트
      if (
        exceptionObj.name === 'ICE_CONNECTION_FAILED' ||
        exceptionObj.name === 'GENERIC_ERROR'
      ) {
        set({
          error: `연결 오류: ${exceptionObj.message || 'Unknown error'}`,
        })
      }
    },

    onSessionDisconnected: (event) => {
      const reason =
        (event && (event as { reason?: string }).reason) || 'unknown'
      eventLogger.info('세션 종료', { reason })

      // 강제 퇴장/서버 종료 사유일 때 중복 정리 방지
      if (
        reason === 'forceDisconnectByUser' ||
        reason === 'forceDisconnectByServer' ||
        reason === 'networkDisconnect' ||
        reason === 'sessionClosedByServer'
      ) {
        const { updateConnectionState } = get()
        updateConnectionState('disconnected')

        // 상태만 정리 (중복 leave 방지)
        try {
          const preservedConfig = get().sessionConfig
          set({
            ...initialState,
            sessionConfig: preservedConfig,
            apiCallCount: { config: 0, quickJoin: 0 },
            screenShareCtx: null,
          })
          eventLogger.info('강제 종료로 인한 상태 정리 완료', {
            reason,
          })
        } catch (error) {
          eventLogger.error('강제 종료 상태 정리 실패', { error })
        }
      }
    },

    onReconnecting: () => {
      const { updateConnectionState } = get()
      updateConnectionState('reconnecting')

      eventLogger.info('재연결 시도 시작', {
        timestamp: new Date().toISOString(),
      })
    },

    onReconnected: () => {
      const { updateConnectionState, participantStates } = get()
      updateConnectionState('connected')

      // 모든 참가자 재연결 시도 카운트 리셋
      for (const [connectionId, state] of participantStates) {
        if (!state.isConnected) {
          get().updateParticipantState(connectionId, {
            isConnected: true,
            reconnectAttempts: 0,
          })
        }
      }

      eventLogger.info('재연결 성공', {
        participantCount: participantStates.size,
        timestamp: new Date().toISOString(),
      })
    },
  }

  adapter.setupEventHandlers(session, eventHandlers)
}

// Publisher 로거 생성
const publisherLogger = createOpenViduLogger('Publisher')

/**
 * 비디오 Publisher 생성 및 발행 (어댑터 사용)
 */
async function createAndPublishVideo(
  adapter: OpenViduSdkAdapter,
  session: Session,
  config: {
    autoEnableAudio: boolean
    autoEnableVideo: boolean
    defaultResolution?: string
    defaultFrameRate?: number
  },
): Promise<Publisher> {
  const publisherConfig = {
    audioSource: config.autoEnableAudio ? undefined : false,
    videoSource: config.autoEnableVideo ? undefined : false,
    publishAudio: config.autoEnableAudio,
    publishVideo: config.autoEnableVideo,
    resolution:
      config.defaultResolution ||
      OPENVIDU_CONSTANTS.DEFAULT_RESOLUTION,
    frameRate:
      config.defaultFrameRate ||
      OPENVIDU_CONSTANTS.DEFAULT_FRAME_RATE,
    insertMode: 'APPEND' as const,
    mirror: false,
  }

  try {
    const publisher = await adapter.createPublisher(
      session,
      publisherConfig,
    )

    // Publisher 이벤트 핸들러 추가 (세션 라이프사이클 강화)
    // 주석 처리: createPublisher 함수 내부에서 get/set에 접근 불가
    // publisher.on('accessDenied', (error) => {
    //   publisherLogger.error('미디어 장치 접근 거부', { error })
    //   const { updateConnectionState } = get()
    //   updateConnectionState('failed')
    //   set({ error: '카메라나 마이크 접근 권한이 거부되었습니다. 브라우저 설정을 확인해주세요.' })
    // })

    // publisher.on('accessAllowed', () => {
    //   publisherLogger.debug('미디어 장치 접근 허용')
    // })

    // publisher.on('streamCreated', (event) => {
    //   publisherLogger.debug('Publisher 스트림 생성', { streamId: event.stream.streamId })
    // })

    // publisher.on('streamDestroyed', (event) => {
    //   publisherLogger.debug('Publisher 스트림 종료', { streamId: event.stream.streamId, reason: (event as any).reason })
    // })

    // Publisher 예외 처리 - OpenVidu v2에서는 'exception' 이벤트가 없으므로 주석 처리
    // publisher.on('exception', (exception) => {
    //   publisherLogger.error('Publisher 예외 발생', {
    //     name: exception.name,
    //     message: exception.message,
    //   })
    //   if (exception.name === 'DEVICE_ACCESS_DENIED' || exception.name === 'DEVICE_ALREADY_IN_USE') {
    //     set({ error: `미디어 장치 오류: ${exception.message}` })
    //   }
    // })

    await adapter.publishStream(session, publisher)

    publisherLogger.debug('Publisher 생성 완료', {
      streamId: publisher.stream?.streamId,
    })

    return publisher
  } catch (error) {
    publisherLogger.error('Publisher 생성 실패', {
      msg: error instanceof Error ? error.message : '알 수 없는 오류',
    })
    throw error
  }
}
