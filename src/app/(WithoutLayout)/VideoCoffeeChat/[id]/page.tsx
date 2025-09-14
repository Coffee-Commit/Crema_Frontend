'use client'

import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState, useRef, useMemo } from 'react'

import LocalVideo from '@/features/video-call/components/LocalVideo'
import RemoteVideo from '@/features/video-call/components/RemoteVideo'
import ScreenShareView from '@/features/video-call/components/ScreenShareView'
import {
  useToggleAudio,
  useToggleVideo,
  useScreenShare,
  useLeaveSession,
  useEnvironmentInfo,
} from '@/features/video-call/hooks'
import { useLocalMediaController } from '@/features/video-call/hooks/useLocalMediaController'
import { usePublisherBridge } from '@/features/video-call/hooks/usePublisherBridge'
import {
  useSessionStatus,
  useParticipants,
  useAudioEnabled,
  useVideoEnabled,
  useScreenSharing,
  useVideoCallActions,
  usePublisher,
  useChatMessages,
  useVideoCallStore,
} from '@/features/video-call/store'
import type { ChatMessage } from '@/features/video-call/types'
import { createCleanupCall } from '@/features/video-call/utils/cleanup'
import { globalSessionManager } from '@/features/video-call/utils/sessionManager'
import { featureFlags } from '@/lib/config/env'
import { openViduApi, openViduNavigation } from '@/lib/openvidu/api'
import { createOpenViduLogger } from '@/lib/utils/openviduLogger'
import { useAuthStore } from '@/store/useAuthStore'

// Local components (split for maintainability)
import ChatPanel from './components/ChatPanel'
import FilesPanel from './components/FilesPanel'
import type { LocalChatMessage, SharedFile, TabType } from './types'
import { formatHMS, pad } from './utils'

const logger = createOpenViduLogger('VideoCoffeeChatPage')

interface VideoCallRoomContentProps {
  reservationId: string
}

function VideoCallRoomContent({
  reservationId,
}: VideoCallRoomContentProps) {
  const searchParams = useSearchParams()

  // Hook들을 먼저 모두 호출 (조건부 반환 전에)
  const sessionStatus = useSessionStatus()
  const participants = useParticipants()
  const audioEnabled = useAudioEnabled()
  const videoEnabled = useVideoEnabled()
  const screenSharing = useScreenSharing()
  const publisher = usePublisher()
  const actions = useVideoCallActions()
  const environmentInfo = useEnvironmentInfo()
  const messages = useChatMessages()

  const toggleAudio = useToggleAudio()
  const toggleVideo = useToggleVideo()
  const { execute: toggleScreenShare } = useScreenShare()
  const { execute: leaveSession } = useLeaveSession()
  // 뒤로가기 등 네비게이션 시에는 확인창 없이 즉시 종료
  const { execute: _leaveWithoutConfirm } = useLeaveSession({
    confirmBeforeLeave: false,
  })

  // 새로운 훅들 (항상 호출, React Hooks 규칙 준수)
  const useNewComponents = featureFlags.useNewCameraComponents
  const localMediaController = useLocalMediaController()
  const session = useVideoCallStore((s) => s.session)
  const _publisherBridge = usePublisherBridge(session)

  // 새 파이프라인: 화면공유 토글 핸들러 (replace 우선, 실패 시 ensure)
  const handleToggleShare = useMemo(() => {
    return async () => {
      if (!useNewComponents) {
        // 레거시 경로 유지
        return toggleScreenShare()
      }
      try {
        if (!screenSharing) {
          await localMediaController.startScreen()
          const s = localMediaController.currentStreamRef.current
          if (s) {
            try {
              await _publisherBridge.replaceFrom(s)
            } catch {
              await _publisherBridge.ensurePublisher(s)
            }
          }
          // 원격에 화면공유 시작 신호 전송
          try {
            const sess = actions.getState?.().session
            await sess?.signal({
              type: 'screen-share',
              data: JSON.stringify({ active: true }),
            })
          } catch (e) {
            logger.warn('화면공유 시작 신호 전송 실패', {
              error: e instanceof Error ? e.message : String(e),
            })
          }
          actions.updateSettings?.({ screenSharing: true })
        } else {
          await localMediaController.startCamera()
          const s = localMediaController.currentStreamRef.current
          if (s) {
            try {
              await _publisherBridge.replaceFrom(s)
            } catch {
              await _publisherBridge.ensurePublisher(s)
            }
          }
          // 원격에 화면공유 종료 신호 전송
          try {
            const sess = actions.getState?.().session
            await sess?.signal({
              type: 'screen-share',
              data: JSON.stringify({ active: false }),
            })
          } catch (e) {
            logger.warn('화면공유 종료 신호 전송 실패', {
              error: e instanceof Error ? e.message : String(e),
            })
          }
          actions.updateSettings?.({ screenSharing: false })
        }
      } catch (e) {
        console.error('화면공유 토글 실패', e)
      }
    }
  }, [
    useNewComponents,
    toggleScreenShare,
    screenSharing,
    localMediaController,
    _publisherBridge,
    actions,
  ])

  // 새 파이프라인: 세션 연결 후 카메라 초기 게시 보장 (초기 진입 시 로컬 비디오 보이도록)
  useEffect(() => {
    if (!useNewComponents) return
    if (sessionStatus !== 'connected') return
    if (screenSharing) return

    // 이미 로컬 스트림이 있으면 스킵
    if (localMediaController.currentStreamRef.current) return
    ;(async () => {
      try {
        await localMediaController.startCamera()
        const s = localMediaController.currentStreamRef.current
        if (s) {
          try {
            await _publisherBridge.replaceFrom(s)
          } catch {
            await _publisherBridge.ensurePublisher(s)
          }
        }
      } catch (e) {
        console.error('초기 카메라 시작/게시 실패', e)
      }
    })()
  }, [
    useNewComponents,
    sessionStatus,
    screenSharing,
    localMediaController,
    _publisherBridge,
  ])

  // 비디오 요소 레퍼런스 (클린업에서 사용)
  const myCamVideoRef = useRef<HTMLVideoElement>(null)
  const remoteCamVideoRef = useRef<HTMLVideoElement>(null)
  const shareVideoRef = useRef<HTMLVideoElement>(null)
  const initializingRef = useRef(false)
  const sessionKeyRef = useRef<string | null>(null)

  // 멱등 클린업 함수 생성
  const cleanupCall = useMemo(
    () =>
      createCleanupCall({
        actions,
        localMediaController,
        publisherBridge: _publisherBridge,
        videoElements: [
          myCamVideoRef,
          remoteCamVideoRef,
          shareVideoRef,
        ],
      }),
    [actions, localMediaController, _publisherBridge],
  )

  // 브라우저 뒤로가기(popstate) 및 페이지 숨김(pagehide) 시 즉시 정리
  useEffect(() => {
    if (typeof window === 'undefined') return

    const onPopState = () => {
      try {
        const status = actions.getState?.().status
        logger.info('브라우저 뒤로가기 감지', { status })
        if (status && status !== 'idle') {
          // 네비게이션을 막지 않도록 마이크/카메라 즉시 정리
          setTimeout(() => {
            cleanupCall('popstate')
            // 서버 세션 종료 확인창 없이 로컬 단절만 보장
          }, 0)
        }
      } catch (e) {
        console.error('뒤로가기 처리 중 오류', e)
      }
    }

    const onPageHide = () => {
      try {
        setTimeout(() => cleanupCall('pagehide'), 0)
      } catch {}
    }

    window.addEventListener('popstate', onPopState)
    window.addEventListener('pagehide', onPageHide)
    return () => {
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('pagehide', onPageHide)
    }
  }, [actions, cleanupCall])

  const peerNickname = useMemo(
    () => searchParams.get('peer') ?? '게스트',
    [searchParams],
  )
  const [myNickname, setMyNickname] = useState<string>('커피챗 사용자')

  const startAt = useMemo(() => {
    const s = searchParams.get('start')
    const d = s ? new Date(s) : new Date()
    return isNaN(d.getTime()) ? new Date() : d
  }, [searchParams])

  // useState, useRef 등 모든 hooks를 조건부 반환 전에 호출
  const [now, setNow] = useState<Date>(() => new Date())
  const [tab, setTab] = useState<TabType>('chat')
  const [participantInfoError, setParticipantInfoError] = useState<
    string | null
  >(null)

  // Store의 메시지를 로컬 형식으로 변환
  const chatList = useMemo(() => {
    const currentUserId = actions.getState().localParticipantId

    return messages.map((msg: ChatMessage): LocalChatMessage => {
      const isMe = msg.senderId === currentUserId
      const msgDate = new Date(msg.timestamp)
      const h = msgDate.getHours()
      const m = msgDate.getMinutes()
      const ampm = h < 12 ? '오전' : '오후'
      const hh = h % 12 === 0 ? 12 : h % 12
      const timeStr = `${ampm} ${hh}:${pad(m)}`

      return {
        id: msg.id,
        who: isMe ? 'me' : 'other',
        name: msg.senderName,
        time: timeStr,
        text: msg.content,
      }
    })
  }, [messages, actions])
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewName, setPreviewName] = useState<string>('')
  const [previewMime, setPreviewMime] =
    useState<string>('application/pdf')

  // 타이머는 세션 연결 후에만 실행 (불필요한 재렌더링 방지)
  useEffect(() => {
    if (sessionStatus === 'connected') {
      const t = setInterval(() => setNow(new Date()), 1000)
      return () => clearInterval(t)
    }
  }, [sessionStatus])

  // ChatPanel 내부에서 자동 스크롤 처리

  useEffect(() => {
    // React StrictMode에서 중복 실행 방지 - 전역 세션 관리자 사용
    if (initializingRef.current) {
      return
    }
    initializingRef.current = true

    // cleanup timeout 취소 (컴포넌트가 다시 마운트된 경우)
    globalSessionManager.cancelCleanup()

    // 이미 연결 중이거나 연결된 경우 중복 초기화 방지
    if (sessionStatus !== 'idle') {
      logger.warn('세션이 이미 연결 중이거나 연결됨, 초기화 생략')
      initializingRef.current = false
      return
    }

    if (!reservationId) {
      initializingRef.current = false
      return
    }

    const sessionKey = `coffeechat-${reservationId}`
    sessionKeyRef.current = sessionKey

    const initializeSession = async () => {
      try {
        logger.info('커피챗 화상통화 세션 초기화 시작', {
          reservationId,
        })

        // 1. Config API 호출
        try {
          await openViduApi.getConfig()
          logger.debug('설정 정보 조회 완료')
        } catch (error) {
          logger.warn('설정 정보 조회 실패, 기본값 사용', {
            error:
              error instanceof Error ? error.message : String(error),
          })
        }

        // 2. Quick Join API로 토큰 받기 (reservationId 사용)
        const quickJoinResponse = await openViduApi.quickJoin(
          parseInt(reservationId, 10),
        )
        logger.info('토큰 획득 완료', {
          sessionId: quickJoinResponse.sessionId,
          username: quickJoinResponse.username,
        })

        // API 응답에서 받은 username을 닉네임으로 설정
        setMyNickname(quickJoinResponse.username || '커피챗 사용자')

        // 3. 받은 토큰으로 연결
        await actions.connect(
          {
            id: quickJoinResponse.sessionId,
            name: quickJoinResponse.sessionName,
            token: quickJoinResponse.token,
            serverUrl: quickJoinResponse.openviduServerUrl,
          },
          quickJoinResponse.username,
        )

        logger.info('세션 연결 완료')

        if (!useNewComponents) {
          try {
            const hasVideoDevice =
              environmentInfo?.hasVideoDevice ?? true
            logger.info(
              `비디오 장치 확인: ${hasVideoDevice ? '있음' : '없음 - 오디오 전용 모드'}`,
            )

            await actions.createPublisher({
              publishAudio: true,
              publishVideo: hasVideoDevice,
              resolution: '1280x720',
              frameRate: 30,
            })
            logger.info('Publisher 생성 완료')

            actions.addParticipant({
              id: `local-${Date.now()}`,
              connectionId: `local-connection-${Date.now()}`,
              nickname: quickJoinResponse.username,
              isLocal: true,
              streams: {},
              audioLevel: 0,
              speaking: false,
              audioEnabled: true,
              videoEnabled: hasVideoDevice,
              isScreenSharing: false,
              joinedAt: new Date(),
            })

            logger.info('로컬 참가자 추가 완료')
          } catch (error) {
            console.error('Publisher 생성 실패:', error)
          }
        }
      } catch (error) {
        console.error('세션 초기화 실패:', error)
        throw error
      } finally {
        initializingRef.current = false
      }
    }

    // 전역 세션 관리자를 통한 초기화
    globalSessionManager
      .initializeSession(sessionKey, initializeSession)
      .catch((error) => {
        console.error('전역 세션 관리자 초기화 실패:', error)
      })

    // cleanup 함수 반환 (StrictMode-safe) - 전역 세션 관리자 사용
    return () => {
      if (sessionKeyRef.current) {
        const sessionKey = sessionKeyRef.current
        const scheduledSeq = actions.getState().joinSequence
        globalSessionManager.scheduleCleanup(
          sessionKey,
          async () => {
            const currentSeq = actions.getState().joinSequence
            if (currentSeq !== scheduledSeq) {
              logger.info('cleanup 스킵: 새 연결 시퀀스 감지', {
                sessionKey,
                scheduledSeq,
                currentSeq,
              })
              return
            }
            logger.info('지연된 세션 cleanup 실행', { sessionKey })
            if (actions.getState().status === 'connected') {
              try {
                await cleanupCall('unmount-scheduled')
                logger.info('세션 cleanup 완료', { sessionKey })
              } catch (error) {
                logger.error('세션 cleanup 실패:', { error })
              }
            }
          },
          500, // 500ms 지연으로 StrictMode cleanup과 실제 cleanup 구분
        )
      }

      initializingRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservationId, sessionStatus, environmentInfo?.hasVideoDevice]) // actions, cleanupCall, useNewComponents 의도적으로 제외

  // 참가자 정보 가져오기
  useEffect(() => {
    if (sessionStatus !== 'connected') return

    const fetchParticipantInfo = async () => {
      try {
        const currentSessionId = actions.getState().sessionInfo?.id
        if (currentSessionId) {
          logger.info('참가자 정보 조회 시도', {
            sessionId: currentSessionId,
          })

          // 실제 API 호출
          const participantInfo =
            await openViduApi.getParticipantInfo(currentSessionId)

          logger.info('참가자 정보 조회 성공', {
            sessionId: currentSessionId,
            participantId: participantInfo.participantId,
            nickname: participantInfo.nickname,
          })
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '알 수 없는 오류'
        logger.warn('참가자 정보 조회 실패:', {
          message: errorMessage,
        })
        setParticipantInfoError(errorMessage)
      }
    }

    fetchParticipantInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus]) // actions 의도적으로 제외

  // 세션 연결 시 공유 자료 목록 로드
  useEffect(() => {
    if (sessionStatus === 'connected') {
      refreshMaterialsList()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus]) // refreshMaterialsList 의도적으로 제외

  // 전환은 handleToggleShare에서만 수행(중복 방지)

  useEffect(() => {
    if (
      publisher &&
      sessionStatus === 'connected' &&
      participants instanceof Map
    ) {
      const localParticipants = Array.from(
        participants.values(),
      ).filter((p) => p.isLocal)
      if (localParticipants.length > 0) {
        actions.setLocalParticipantId?.(localParticipants[0].id)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publisher, sessionStatus, participants]) // actions 의도적으로 제외

  // 잘못 추가된 "내 스트림이 원격으로 분류된" 참가자 자동 정리 (레거시 경로 안전장치)
  useEffect(() => {
    if (!(participants instanceof Map)) return
    const state = actions.getState?.()
    const myConnId = state?.session?.connection?.connectionId
    if (!myConnId) return

    const toRemove: string[] = []
    participants.forEach((p) => {
      if (!p.isLocal && p.connectionId === myConnId) {
        toRemove.push(p.id)
      }
    })
    if (toRemove.length > 0) {
      logger.debug('로컬과 동일한 connectionId의 원격 참가자 정리', {
        count: toRemove.length,
      })
      toRemove.forEach((id) => actions.removeParticipant?.(id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants]) // actions 의도적으로 제외 (myConnectionId는 내부에서 조회)

  // 컴포넌트 언마운트 감지 (전역 세션 관리자 사용으로 제거)

  useEffect(() => {
    // 새로운 컴포넌트 사용 시 직접 바인딩 스킵
    if (useNewComponents) return

    const el = myCamVideoRef.current
    if (el && publisher && publisher.stream) {
      const ms = publisher.stream.getMediaStream()
      const track = ms?.getVideoTracks?.()[0]
      logger.debug('로컬 비디오 바인딩', {
        hasStream: !!ms,
        trackLabel: track?.label,
      })
      el.srcObject = ms
      el.muted = true
      el.play().catch(() => {})
    }
  }, [publisher, useNewComponents])

  // 화면 공유 상태에 따른 비디오 스트림 관리
  useEffect(() => {
    // 새로운 컴포넌트 사용 시 직접 바인딩 스킵
    if (useNewComponents) return

    const shareEl = shareVideoRef.current
    const myCamEl = myCamVideoRef.current

    if (screenSharing) {
      // 화면 공유 중: shareVideoRef에 스트림 할당
      if (shareEl && publisher && publisher.stream) {
        const ms = publisher.stream.getMediaStream()
        const track = ms?.getVideoTracks?.()[0]
        logger.info('화면공유 비디오 바인딩', {
          trackLabel: track?.label,
        })
        shareEl.srcObject = ms
        shareEl.play().catch(() => {})
      }
    } else {
      // 화면 공유 종료: shareVideoRef 정리하고 myCamVideoRef에 스트림 재할당
      if (shareEl) {
        logger.info('화면공유 비디오 해제')
        shareEl.srcObject = null
      }

      if (myCamEl && publisher && publisher.stream) {
        const ms = publisher.stream.getMediaStream()
        const track = ms?.getVideoTracks?.()[0]
        logger.info('로컬 비디오로 복원', {
          trackLabel: track?.label,
        })
        myCamEl.srcObject = ms
        myCamEl.muted = true
        myCamEl.play().catch(() => {})
      }
    }
  }, [publisher, screenSharing, useNewComponents])

  const myConnectionId = useVideoCallStore(
    (s) => s.session?.connection?.connectionId ?? null,
  )

  const remoteParticipants = useMemo(() => {
    if (!(participants instanceof Map)) return []
    const all = Array.from(participants.values())
    return all.filter(
      (p) =>
        !p.isLocal &&
        (!myConnectionId || p.connectionId !== myConnectionId),
    )
  }, [participants, myConnectionId])

  // 레거시 UI에서 원격 비디오 엘리먼트에 스트림 바인딩
  useEffect(() => {
    if (useNewComponents) return

    const el = remoteCamVideoRef.current
    if (!el) return

    if (
      remoteParticipants.length > 0 &&
      (remoteParticipants[0].streams.camera ||
        remoteParticipants[0].streams.screen)
    ) {
      const stream =
        remoteParticipants[0].streams.camera ||
        remoteParticipants[0].streams.screen!
      logger.info('원격 비디오 바인딩', {
        remoteId: remoteParticipants[0].id,
        conn: remoteParticipants[0].connectionId,
        hasCam: !!remoteParticipants[0].streams.camera,
        hasScreen: !!remoteParticipants[0].streams.screen,
      })
      el.srcObject = stream
      // 1) 무음 자동재생으로 시작 (정책 회피)
      el.muted = true
      el.play().catch(() => {})
      // 2) 소리 활성화 시도 (허용되면 즉시 적용)
      ;(async () => {
        try {
          el.muted = false
          await el.play()
        } catch {
          // 정책 차단 시 사용자 제스처 필요. UI는 유지
        }
      })()
    } else {
      // 원격 참가자가 없거나 스트림이 비어있으면 해제
      try {
        el.pause()
      } catch {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(el as any).srcObject = null
      try {
        el.load?.()
      } catch {}
      logger.info('원격 비디오 소스 해제')
    }
  }, [remoteParticipants, useNewComponents])

  // 원격 중 화면공유 중인 참가자(있다면 첫 번째)와 스트림
  const remoteSharingParticipant = useMemo(() => {
    return (
      remoteParticipants.find(
        (p) => p.isScreenSharing || !!p.streams.screen,
      ) || null
    )
  }, [remoteParticipants])

  // 디버그: 참가자 요약 로그
  useEffect(() => {
    const state = actions.getState?.()
    const myConnId = state?.session?.connection?.connectionId
    const total = participants instanceof Map ? participants.size : 0
    logger.debug('참가자 요약', {
      total,
      remoteCount: remoteParticipants.length,
      myConnId,
      remotes: remoteParticipants.map((p) => ({
        id: p.id,
        conn: p.connectionId,
        isLocal: p.isLocal,
        hasCam: !!p.streams.camera,
      })),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants, remoteParticipants]) // actions 의도적으로 제외

  // 잘못 추가된 "내 스트림이 원격으로 분류된" 참가자 자동 정리
  useEffect(() => {
    if (!(participants instanceof Map)) return
    const state = actions.getState?.()
    const myConnId = state?.session?.connection?.connectionId
    if (!myConnId) return

    const toRemove: string[] = []
    participants.forEach((p) => {
      if (!p.isLocal && p.connectionId === myConnId) {
        toRemove.push(p.id)
      }
    })
    if (toRemove.length > 0) {
      logger.debug('로컬과 동일한 connectionId의 원격 참가자 정리', {
        count: toRemove.length,
      })
      toRemove.forEach((id) => actions.removeParticipant?.(id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants, myConnectionId]) // actions 의도적으로 제외

  useEffect(() => {
    // 새로운 컴포넌트 사용 시 직접 바인딩 스킵
    if (useNewComponents) return

    const el = remoteCamVideoRef.current
    if (el) {
      if (
        remoteParticipants.length > 0 &&
        remoteParticipants[0].streams.camera
      ) {
        logger.info('원격 비디오 바인딩', {
          remoteId: remoteParticipants[0].id,
          conn: remoteParticipants[0].connectionId,
        })
        el.srcObject = remoteParticipants[0].streams.camera
        el.play().catch(() => {})
      } else {
        // 원격 참가자가 없을 때 비디오 초기화(재생 중지 포함)
        try {
          el.pause()
        } catch {}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(el as any).srcObject = null
        try {
          el.load?.()
        } catch {}
        logger.info('원격 비디오 소스 해제')
      }
    }
  }, [remoteParticipants, useNewComponents])

  // 전역 디버그 헬퍼 노출
  useEffect(() => {
    if (typeof window === 'undefined') return
    const getState = () => actions.getState?.()
    const dumpParticipants = () => {
      const s = getState()
      const list = s
        ? Array.from(s.participants.values()).map((p) => ({
            id: p.id,
            conn: p.connectionId,
            isLocal: p.isLocal,
            hasCam: !!p.streams.camera,
          }))
        : []
      console.log('[__vc] participants', list)
      return list
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__vc = { getState, dumpParticipants }
    logger.info('전역 디버그 헬퍼 등록: window.__vc')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // actions 의도적으로 제외

  // 파라미터 로그는 useEffect에서만 (렌더링 중 로그 방지)
  useEffect(() => {
    logger.debug('reservationId 확인', {
      reservationId,
      hasReservationId: !!reservationId,
      paramsSize: searchParams.toString().length,
    })
  }, [reservationId, searchParams])

  if (!reservationId) {
    logger.warn('필수 파라미터 누락', {
      missingReservationId: !reservationId,
    })

    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-gray-900)]">
        <div className="text-center text-[var(--color-fill-white)]">
          <h2 className="font-title3 mb-[var(--spacing-spacing-6xs)]">
            잘못된 접근
          </h2>
          <p className="font-body2 text-[var(--color-label-subtle)]">
            예약 ID가 필요합니다.
          </p>
          <p className="font-body2 mt-2 text-[var(--color-label-subtle)]">
            예시: /VideoCoffeeChat/123
          </p>
        </div>
      </div>
    )
  }

  const reservationIdTrimmed = reservationId.trim()
  const reservationIdNumber = parseInt(reservationIdTrimmed, 10)

  if (!reservationIdTrimmed || isNaN(reservationIdNumber)) {
    logger.warn('잘못된 파라미터', {
      emptyReservationId: !reservationIdTrimmed,
      invalidNumber: isNaN(reservationIdNumber),
      reservationId: reservationIdTrimmed,
    })

    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-gray-900)]">
        <div className="text-center text-[var(--color-fill-white)]">
          <h2 className="font-title3 mb-[var(--spacing-spacing-6xs)]">
            잘못된 파라미터
          </h2>
          <p className="font-body2 text-[var(--color-label-subtle)]">
            유효한 예약 ID(숫자)가 필요합니다.
          </p>
        </div>
      </div>
    )
  }

  const elapsedSec = Math.max(
    0,
    Math.floor((now.getTime() - startAt.getTime()) / 1000),
  )

  const handleSend = async (text: string) => {
    const t = text.trim()
    if (!t) return
    await actions.sendMessage(t)
  }

  const openPreview = (file: SharedFile) => {
    const blob = new Blob([file.content], { type: file.mime })
    const url = URL.createObjectURL(blob)
    setPreviewUrl(url)
    setPreviewName(file.name)
    setPreviewMime(file.mime)
  }

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setPreviewName('')
  }

  // 공유 자료 목록 새로고침
  const refreshMaterialsList = async () => {
    const currentSessionId = actions.getState().sessionInfo?.id
    if (!currentSessionId) return

    try {
      const materialsResponse =
        await openViduApi.getMaterials(currentSessionId)
      const files = materialsResponse?.files ?? []
      const materials = files.map(
        (file: {
          fileId: string
          fileName: string
          fileSize?: number
          fileType?: string
          fileUrl: string
        }) => ({
          id: file.fileId,
          name: file.fileName,
          sizeBytes: file.fileSize || 0,
          content: '', // API 방식에서는 content가 아닌 URL 사용
          mime: file.fileType || 'application/octet-stream',
          url: file.fileUrl, // 파일 다운로드 URL
        }),
      )
      setSharedFiles(materials)
      logger.info('공유 자료 목록 갱신 완료', {
        fileCount: materials.length,
        sessionId: currentSessionId,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)

      // JWT 인증 에러인지 확인
      if (
        errorMessage.includes('401') ||
        errorMessage.includes('Unauthorized')
      ) {
        logger.warn(
          '공유 자료 목록 조회 인증 실패 - JWT 토큰 필요:',
          { sessionId: currentSessionId },
        )
        // 인증 실패 시 빈 배열로 설정하여 UI가 깨지지 않도록 함
        setSharedFiles([])
      } else {
        logger.error('공유 자료 목록 조회 실패:', {
          error: errorMessage,
          sessionId: currentSessionId,
        })
        // 기타 오류 시에도 UI 안전을 위해 비우기
        setSharedFiles([])
      }
    }
  }

  // 파일 삭제 처리
  const handleFileDelete = async (
    fileId: string,
    imageKey: string,
  ) => {
    const currentSessionId = actions.getState().sessionInfo?.id
    if (!currentSessionId) return

    try {
      await openViduApi.deleteMaterial(currentSessionId, imageKey)
      logger.info('파일 삭제 완료', {
        fileId,
        sessionId: currentSessionId,
      })

      // 목록 갱신
      await refreshMaterialsList()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)

      // JWT 인증 에러인지 확인
      if (
        errorMessage.includes('401') ||
        errorMessage.includes('Unauthorized')
      ) {
        logger.warn('파일 삭제 인증 실패 - JWT 토큰 필요:', {
          fileId,
          sessionId: currentSessionId,
        })
        // 사용자에게 알림 (선택사항 - 현재는 로그만)
      } else {
        logger.error('파일 삭제 실패:', {
          error: errorMessage,
          fileId,
          sessionId: currentSessionId,
        })
      }
    }
  }

  const handleDownload = (file: SharedFile) => {
    // API 방식에서는 URL을 통한 다운로드
    if (file.url) {
      const a = document.createElement('a')
      a.href = file.url
      a.download = file.name
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      a.remove()
    } else {
      // Fallback: base64 content가 있는 경우 (레거시 호환성)
      const blob = new Blob([file.content], { type: file.mime })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      a.remove()
      URL.revokeObjectURL(url)
    }
  }

  const handleFileUpload = async (file: File) => {
    const currentSessionId = actions.getState().sessionInfo?.id

    if (
      !session ||
      sessionStatus !== 'connected' ||
      !currentSessionId
    ) {
      logger.warn(
        '세션이 연결되지 않아 파일 업로드를 할 수 없습니다.',
      )
      return
    }

    try {
      logger.info('파일 업로드 시작', {
        fileName: file.name,
        fileSize: file.size,
        sessionId: currentSessionId,
      })

      // API를 통한 파일 업로드
      const uploadedFile = await openViduApi.uploadMaterial(
        currentSessionId,
        file,
      )

      logger.info('파일 업로드 완료', {
        fileName: file.name,
        fileId: uploadedFile.fileId,
        sessionId: currentSessionId,
      })

      // 공유 자료 목록 갱신
      await refreshMaterialsList()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)

      // JWT 인증 에러인지 확인
      if (
        errorMessage.includes('401') ||
        errorMessage.includes('Unauthorized')
      ) {
        logger.warn('파일 업로드 인증 실패 - JWT 토큰 필요:', {
          fileName: file.name,
          sessionId: currentSessionId,
        })
        // 사용자에게 알림 (선택사항 - 현재는 로그만)
      } else {
        logger.error('파일 업로드 실패:', {
          error: errorMessage,
          fileName: file.name,
          sessionId: currentSessionId,
        })
      }
    }
  }

  const handleLeaveCall = async () => {
    const currentSessionId = actions.getState().sessionInfo?.id

    // 1. 즉시 리다이렉트 - API 응답 기다리지 않음
    const { user } = useAuthStore.getState()
    openViduNavigation.goToReviewPageByRole(user?.role)

    // 2. 백그라운드에서 정리 작업 (fire-and-forget)
    Promise.resolve().then(async () => {
      try {
        // 채팅 메시지를 DTO 형식으로 변환
        const chatHistory =
          messages.length > 0
            ? {
                messages: messages.map((msg) => {
                  // Codex 권장: timestamp 유효성 검증
                  const msgDate = new Date(msg.timestamp)
                  const isValidDate = Number.isFinite(
                    msgDate.getTime(),
                  )

                  return {
                    username: msg.senderName,
                    message: msg.content,
                    timestamp: isValidDate
                      ? msgDate.toISOString()
                      : new Date().toISOString(),
                  }
                }),
                sessionStartTime: startAt.toISOString(),
                sessionEndTime: new Date().toISOString(),
              }
            : undefined

        // 세션 종료 API 호출 (채팅 저장 + 세션 종료 통합)
        if (currentSessionId) {
          logger.info('백그라운드 세션 종료 시작', {
            messageCount: messages.length,
            sessionId: currentSessionId,
          })

          await openViduApi.endSession(currentSessionId, chatHistory)
          logger.info('백그라운드 세션 종료 완료')
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)

        // JWT 인증 에러인지 확인
        if (
          errorMessage.includes('401') ||
          errorMessage.includes('Unauthorized')
        ) {
          logger.warn(
            '백그라운드 세션 종료 인증 실패 - JWT 토큰 필요:',
            {
              sessionId: currentSessionId,
            },
          )
        } else {
          logger.debug('백그라운드 세션 종료 실패:', {
            error: errorMessage,
            sessionId: currentSessionId,
          })
        }
      } finally {
        // Codex 권장: finally로 절대 종료 보장
        try {
          await leaveSession()
          logger.debug('백그라운드 로컬 세션 종료 완료')
        } catch (leaveError) {
          logger.debug('백그라운드 로컬 세션 종료:', {
            error: String(leaveError),
          })
        }
        // 로컬 미디어/퍼블리셔/스토어까지 확실히 정리
        try {
          await cleanupCall('explicit-leave')
          logger.debug('백그라운드 cleanup 완료')
        } catch (cleanupError) {
          logger.debug('백그라운드 cleanup:', {
            error: String(cleanupError),
          })
        }
      }
    })
  }

  if (sessionStatus === 'connecting') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-gray-900)]">
        <div className="text-center text-[var(--color-fill-white)]">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-label-primary)]"></div>
          <p className="font-body2">화상통화 연결 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-fill-footer-gray flex h-dvh min-h-screen w-full flex-col">
      <header className="flex h-[60px] items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <span className="font-title3 text-label-strong">
            CremaChat
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-[#EB5F27] px-2 py-[2px] text-xs text-white">
            <Image
              src="/icons/videoChat/call.svg"
              alt="timer"
              width={14}
              height={14}
            />
            {formatHMS(elapsedSec)}
          </span>
        </div>
        <span className="text-sm text-gray-500">
          예약 ID: {reservationId}
        </span>
        <div className="rounded-md bg-emerald-100 px-2 py-1 text-xs text-emerald-700">
          {sessionStatus === 'connected' ? '연결됨' : '연결 중'}
        </div>
      </header>

      <div className="relative flex flex-1 flex-row overflow-hidden">
        <div className="flex flex-1 flex-row gap-4 p-4">
          {useNewComponents ? (
            // 새로운 컴포넌트 기반 렌더링
            (() => {
              // 원격 화면공유가 감지되면 스트림 준비 이전에도 전체화면 전환
              // (race: streams.screen 세팅이 늦는 경우 분할화면이 잠시 유지되는 문제 방지)
              const anyScreenActive =
                !!remoteSharingParticipant || screenSharing

              if (anyScreenActive) {
                // 내가 화면공유 중일 때
                if (screenSharing) {
                  // 상대방도 화면공유 중이면 → 상대방 화면 표시 (서로 교차 시청)
                  if (remoteSharingParticipant) {
                    return (
                      <RemoteVideo
                        participant={remoteSharingParticipant}
                        className="flex-1"
                      />
                    )
                  }
                  // 상대방은 안하면 → 내 화면공유 표시
                  else {
                    return (
                      <ScreenShareView
                        stream={
                          localMediaController.currentStreamRef
                            .current
                        }
                        label={`${myNickname} (화면공유)`}
                        className="flex-1"
                        onScreenShareEnd={handleToggleShare}
                      />
                    )
                  }
                }
                // 내가 화면공유 안하고 상대방만 하면 → 상대방 화면 표시
                else if (remoteSharingParticipant) {
                  return (
                    <RemoteVideo
                      participant={remoteSharingParticipant}
                      className="flex-1"
                    />
                  )
                }
              }

              // 분할화면: 왼쪽 원격(없으면 자리만), 오른쪽 로컬 카메라
              return (
                <>
                  <RemoteVideo
                    participant={
                      remoteParticipants.length > 0
                        ? remoteParticipants[0]
                        : null
                    }
                    className="flex-1"
                    streamType="camera"
                  />
                  <LocalVideo
                    stream={
                      localMediaController.currentStreamRef.current
                    }
                    label={myNickname}
                    audioEnabled={audioEnabled}
                    videoEnabled={videoEnabled}
                    className="flex-1"
                  />
                </>
              )
            })()
          ) : (
            // 기존 레거시 렌더링
            <>
              {screenSharing ? (
                <div className="relative grid flex-1 place-items-center overflow-hidden rounded-md bg-black">
                  <video
                    ref={shareVideoRef}
                    className="h-full w-full object-contain"
                    muted
                    playsInline
                    autoPlay
                  />
                  <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-[2px] text-[12px] text-white">
                    {myNickname} (화면공유)
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative grid flex-1 place-items-center overflow-hidden rounded-md bg-gray-300">
                    <video
                      ref={remoteCamVideoRef}
                      className="h-full w-full object-cover"
                      playsInline
                      autoPlay
                    />
                    {!(
                      remoteParticipants.length > 0 &&
                      (remoteParticipants[0].streams.camera ||
                        remoteParticipants[0].streams.screen)
                    ) && (
                      <div className="text-label-subtle absolute inset-0 grid place-items-center">
                        상대 화면
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 rounded bg-black px-2 py-[2px] text-[12px] text-white">
                      {remoteParticipants.length > 0 
                        ? remoteParticipants[0].nickname 
                        : peerNickname}
                    </div>
                  </div>

                  <div className="relative grid flex-1 place-items-center overflow-hidden rounded-md bg-gray-300">
                    <video
                      ref={myCamVideoRef}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                      autoPlay
                    />
                    <div className="absolute bottom-2 left-2 rounded bg-black px-2 py-[2px] text-[12px] text-white">
                      {!audioEnabled && (
                        <Image
                          src="/icons/videoChat/micOff.svg"
                          alt="mic-off"
                          width={14}
                          height={14}
                          className="mr-1 inline-block"
                        />
                      )}
                      {myNickname}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <aside className="flex w-[476px] min-w-[360px] max-w-[520px] flex-col">
          <div className="px-spacing-3xs pt-spacing-3xs flex w-full items-center">
            <div className="flex w-full items-center">
              <button
                className={`relative w-1/2 pb-3 text-[18px] font-semibold ${
                  tab === 'chat' ? 'text-[#222]' : 'text-[#9CA3AF]'
                }`}
                onClick={() => setTab('chat')}
              >
                <span className="mr-2">채팅</span>
                <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#EB5F27] px-2 text-[11px] leading-none text-white">
                  {chatList.length}
                </span>
                {tab === 'chat' && (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] rounded bg-[#EB5F27]" />
                )}
              </button>
              <button
                className={`relative w-1/2 pb-3 text-[18px] font-semibold ${
                  tab === 'files' ? 'text-[#222]' : 'text-[#9CA3AF]'
                }`}
                onClick={() => setTab('files')}
              >
                공유된 자료
                {tab === 'files' && (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] rounded bg-[#EB5F27]" />
                )}
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col p-4">
            {tab === 'chat' ? (
              <ChatPanel
                messages={chatList}
                onSend={handleSend}
                isActive={tab === 'chat'}
              />
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto py-1">
                <section className="mb-4 rounded-md border bg-white p-4 shadow-sm">
                  <h3 className="font-label3-semibold text-label-strong mb-3">
                    후배 정보
                  </h3>
                  {participantInfoError ? (
                    <div className="py-4 text-center">
                      <p className="mb-2 text-sm text-gray-500">
                        정보를 불러올 수 없습니다
                      </p>
                      <p className="text-xs text-gray-400">
                        {participantInfoError}
                      </p>
                    </div>
                  ) : (
                    <dl className="grid grid-cols-2 gap-y-2 text-sm">
                      <dt className="text-gray-500">이름(닉네임)</dt>
                      <dd className="text-gray-900">
                        {remoteParticipants.length > 0 
                          ? remoteParticipants[0].nickname 
                          : peerNickname}
                      </dd>
                      <dt className="text-gray-500">화상통화 분야</dt>
                      <dd className="text-gray-900">테스트</dd>
                      <dt className="text-gray-500">화상통화 주제</dt>
                      <dd className="text-gray-900">
                        OpenVidu 테스트
                      </dd>
                    </dl>
                  )}
                </section>

                <FilesPanel
                  files={sharedFiles}
                  onPreview={openPreview}
                  onDownload={handleDownload}
                  onUpload={handleFileUpload}
                  onDelete={handleFileDelete}
                />
              </div>
            )}
          </div>
        </aside>
      </div>

      <footer className="flex items-center justify-center gap-4 p-4">
        <button
          className={`rounded-full p-3 ${audioEnabled ? 'bg-gray-100' : 'bg-red-100'}`}
          title="마이크"
          onClick={() => toggleAudio.execute()}
        >
          <Image
            src="/icons/videoChat/mic.svg"
            alt="mic"
            width={20}
            height={20}
          />
        </button>
        <button
          className={`rounded-full p-3 ${videoEnabled ? 'bg-gray-100' : 'bg-red-100'}`}
          title="비디오"
          onClick={() => toggleVideo.execute()}
        >
          <Image
            src="/icons/videoChat/video.svg"
            alt="video"
            width={20}
            height={20}
          />
        </button>
        <button
          className={`rounded-full p-3 ${screenSharing ? 'bg-orange-100' : 'bg-gray-100'}`}
          title="화면 공유"
          onClick={handleToggleShare}
        >
          <Image
            src="/icons/videoChat/screenShare.svg"
            alt="screen share"
            width={20}
            height={20}
          />
        </button>
        <button
          className="rounded-full bg-red-500 p-3 text-white"
          title="통화 종료"
          onClick={handleLeaveCall}
        >
          <Image
            src="/icons/videoChat/call.svg"
            alt="end call"
            width={20}
            height={20}
          />
        </button>
      </footer>

      {previewUrl && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40"
          onClick={closePreview}
        >
          <div
            className="relative h-[80vh] w-[80vw] max-w-[960px] rounded-md bg-white shadow"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-2">
              <span className="text-sm font-semibold">
                {previewName}
              </span>
              <button
                onClick={closePreview}
                className="rounded px-2 py-1 text-sm hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            <div className="h-[calc(80vh-42px)] w-full">
              {previewMime.startsWith('application/pdf') ? (
                <iframe
                  src={previewUrl}
                  title="preview"
                  className="h-full w-full"
                />
              ) : (
                <object
                  data={previewUrl}
                  className="h-full w-full"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function VideoCoffeeChatPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-gray-900)]">
          <div className="text-center text-[var(--color-fill-white)]">
            <div className="mx-auto mb-[var(--spacing-spacing-md)] h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-label-primary)]"></div>
            <p className="font-body2">로딩 중...</p>
          </div>
        </div>
      }
    >
      <VideoCoffeeChatWrapper params={params} />
    </Suspense>
  )
}

function VideoCoffeeChatWrapper({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [reservationId, setReservationId] = useState<string>('')

  useEffect(() => {
    params.then((resolved) => {
      setReservationId(resolved.id)
    })
  }, [params])

  if (!reservationId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-gray-900)]">
        <div className="text-center text-[var(--color-fill-white)]">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-label-primary)]"></div>
          <p className="font-body2">로딩 중...</p>
        </div>
      </div>
    )
  }

  return <VideoCallRoomContent reservationId={reservationId} />
}
