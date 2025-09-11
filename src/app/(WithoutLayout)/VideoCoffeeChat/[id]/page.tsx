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
import { globalSessionManager } from '@/features/video-call/utils/sessionManager'
import { featureFlags } from '@/lib/config/env'
import { openViduTestApi } from '@/lib/openvidu/api'
import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

const logger = createOpenViduLogger('TestRoomPage')

type TabType = 'chat' | 'files'

type SharedFile = {
  id: string
  name: string
  sizeBytes: number
  content: string
  mime: string
}

type LocalChatMessage = {
  id: string
  who: 'me' | 'other'
  name: string
  time: string
  text: string
}

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

function formatHMS(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return h > 0
    ? `${pad(h)}:${pad(m)}:${pad(s)}`
    : `${pad(m)}:${pad(s)}`
}

function prettySize(bytes: number) {
  if (bytes >= 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${bytes} B`
}

function VideoCallRoomContent() {
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

  const sessionNameParam = searchParams.get('sessionName')
  const usernameParam = searchParams.get('username')

  const myNickname = useMemo(
    () => (usernameParam ? usernameParam.trim() : ''),
    [usernameParam],
  )
  const peerNickname = useMemo(
    () => searchParams.get('peer') ?? '게스트',
    [searchParams],
  )

  const startAt = useMemo(() => {
    const s = searchParams.get('start')
    const d = s ? new Date(s) : new Date()
    return isNaN(d.getTime()) ? new Date() : d
  }, [searchParams])

  // useState, useRef 등 모든 hooks를 조건부 반환 전에 호출
  const [now, setNow] = useState<Date>(() => new Date())
  const [tab, setTab] = useState<TabType>('chat')
  const [input, setInput] = useState('')
  const [isComposing, setIsComposing] = useState(false)

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
  const [sharedFiles] = useState<SharedFile[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewName, setPreviewName] = useState<string>('')
  const [previewMime, setPreviewMime] =
    useState<string>('application/pdf')

  const chatScrollRef = useRef<HTMLDivElement>(null)
  const myCamVideoRef = useRef<HTMLVideoElement>(null)
  const remoteCamVideoRef = useRef<HTMLVideoElement>(null)
  const shareVideoRef = useRef<HTMLVideoElement>(null)
  const initializingRef = useRef(false)
  const sessionKeyRef = useRef<string | null>(null)

  // 타이머는 세션 연결 후에만 실행 (불필요한 재렌더링 방지)
  useEffect(() => {
    if (sessionStatus === 'connected') {
      const t = setInterval(() => setNow(new Date()), 1000)
      return () => clearInterval(t)
    }
  }, [sessionStatus])

  useEffect(() => {
    chatScrollRef.current?.scrollTo({
      top: chatScrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [chatList, tab])

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

    const username = usernameParam?.trim() || ''
    const sessionName = sessionNameParam?.trim() || ''

    if (!username || !sessionName) {
      initializingRef.current = false
      return
    }

    const sessionKey = `testroom-${username}@${sessionName}`
    sessionKeyRef.current = sessionKey

    const initializeSession = async () => {
      try {
        logger.info('화상통화 세션 초기화 시작', {
          username,
          sessionName,
        })

        // 1. Config API 호출
        try {
          await openViduTestApi.getConfig()
          logger.debug('설정 정보 조회 완료')
        } catch (error) {
          logger.warn('설정 정보 조회 실패, 기본값 사용', {
            error:
              error instanceof Error ? error.message : String(error),
          })
        }

        // 2. Quick Join API로 토큰 받기
        const quickJoinResponse = await openViduTestApi.quickJoin(
          username,
          sessionName,
        )
        logger.info('토큰 획득 완료', {
          sessionId: quickJoinResponse.sessionId,
          username: quickJoinResponse.username,
        })

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
        } else {
          // 새 파이프라인: 카메라 시작 후 해당 스트림으로 게시
          try {
            await localMediaController.startCamera()
            const stream =
              localMediaController.currentStreamRef.current
            if (stream) {
              await _publisherBridge.publishFrom(stream, {
                publishAudio: true,
                publishVideo: true,
              })
              logger.info('새 파이프라인으로 게시 완료')

              actions.addParticipant({
                id: `local-${Date.now()}`,
                connectionId:
                  session?.connection?.connectionId ||
                  `local-connection-${Date.now()}`,
                nickname: quickJoinResponse.username,
                isLocal: true,
                streams: {},
                audioLevel: 0,
                speaking: false,
                audioEnabled: true,
                videoEnabled: true,
                isScreenSharing: false,
                joinedAt: new Date(),
              })
            } else {
              logger.warn('카메라 스트림이 없어 게시 생략')
            }
          } catch (error) {
            console.error('새 파이프라인 게시 실패:', error)
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
        globalSessionManager.scheduleCleanup(
          sessionKey,
          async () => {
            logger.info('지연된 세션 cleanup 실행', { sessionKey })
            if (actions.getState().status === 'connected') {
              try {
                await actions.destroyPublisher?.()
                await actions.disconnect()
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
  }, [
    usernameParam,
    sessionNameParam,
    sessionStatus,
    environmentInfo?.hasVideoDevice,
  ]) // actions 제거

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
  }, [publisher, sessionStatus, participants]) // actions 제거

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

  // 원격 중 화면공유 중인 참가자(있다면 첫 번째)와 스트림
  const remoteSharingParticipant = useMemo(() => {
    return (
      remoteParticipants.find(
        (p) => p.isScreenSharing || !!p.streams.screen,
      ) || null
    )
  }, [remoteParticipants])

  const remoteScreenStream: MediaStream | null = useMemo(() => {
    return remoteSharingParticipant?.streams.screen ?? null
  }, [remoteSharingParticipant])

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
  }, [participants, remoteParticipants])

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
  }, [participants, myConnectionId])

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
  }, [])

  // 쿼리 파라미터 로그는 useEffect에서만 (렌더링 중 로그 방지)
  useEffect(() => {
    logger.debug('쿼리 파라미터 확인', {
      username: usernameParam,
      sessionName: sessionNameParam,
      hasUsername: !!usernameParam,
      hasSessionName: !!sessionNameParam,
      paramsSize: searchParams.toString().length,
    })
  }, [usernameParam, sessionNameParam, searchParams])

  if (!usernameParam || !sessionNameParam) {
    logger.warn('필수 파라미터 누락', {
      missingUsername: !usernameParam,
      missingSessionName: !sessionNameParam,
    })

    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-gray-900)]">
        <div className="text-center text-[var(--color-fill-white)]">
          <h2 className="font-title3 mb-[var(--spacing-spacing-6xs)]">
            잘못된 접근
          </h2>
          <p className="font-body2 text-[var(--color-label-subtle)]">
            사용자명과 세션명이 모두 필요합니다.
          </p>
          <p className="font-body2 mt-2 text-[var(--color-label-subtle)]">
            예시: /testroom?sessionName=session123&username=user1
          </p>
        </div>
      </div>
    )
  }

  const username = usernameParam.trim()
  const sessionName = sessionNameParam.trim()

  if (!username || !sessionName) {
    logger.warn('빈 파라미터', {
      emptyUsername: !username,
      emptySessionName: !sessionName,
    })

    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-gray-900)]">
        <div className="text-center text-[var(--color-fill-white)]">
          <h2 className="font-title3 mb-[var(--spacing-spacing-6xs)]">
            잘못된 파라미터
          </h2>
          <p className="font-body2 text-[var(--color-label-subtle)]">
            사용자명과 세션명은 비어있을 수 없습니다.
          </p>
        </div>
      </div>
    )
  }

  const elapsedSec = Math.max(
    0,
    Math.floor((now.getTime() - startAt.getTime()) / 1000),
  )

  const handleSend = () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    actions.sendMessage(text)
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

  const handleDownload = (file: SharedFile) => {
    const blob = new Blob([file.content], { type: file.mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleLeaveCall = async () => {
    await leaveSession()
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
          방 ID: {sessionName}
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
              const anyScreenActive =
                !!remoteScreenStream || screenSharing
              if (anyScreenActive) {
                // 전체화면 모드: 원격이 공유 중이면 원격 화면 우선, 아니면 로컬 화면공유 표시
                return remoteSharingParticipant ? (
                  <RemoteVideo
                    participant={remoteSharingParticipant}
                    className="flex-1"
                  />
                ) : (
                  <ScreenShareView
                    stream={
                      localMediaController.currentStreamRef.current
                    }
                    label={`${myNickname} (화면공유)`}
                    className="flex-1"
                    onScreenShareEnd={handleToggleShare}
                  />
                )
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
                    <div className="text-label-subtle absolute inset-0 grid place-items-center">
                      상대 화면
                    </div>
                    <div className="absolute bottom-2 left-2 rounded bg-black px-2 py-[2px] text-[12px] text-white">
                      {peerNickname}
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
              <div className="flex min-h-0 flex-1 flex-col rounded-[8px] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                <div
                  ref={chatScrollRef}
                  className="min-h-0 flex-1 overflow-y-auto rounded-[8px]"
                >
                  <ul className="space-y-6">
                    {chatList.map((m: LocalChatMessage) => (
                      <li
                        key={m.id}
                        className="flex gap-3"
                      >
                        <span className="mt-[2px] inline-block h-8 w-8 shrink-0 rounded-full bg-gray-300" />
                        <div className="flex flex-col">
                          <div className="mb-1 text-[12px] text-[#9CA3AF]">
                            <span className="mr-2 text-[#6B7280]">
                              {m.name}
                            </span>
                            <span>{m.time}</span>
                          </div>
                          <div className="text-[14px] font-semibold text-[#111827]">
                            {m.text}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex items-center justify-end gap-3">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                    onKeyDown={(e) => {
                      const native = e.nativeEvent as unknown as {
                        isComposing?: boolean
                      }
                      const nativeComposing =
                        native.isComposing ?? false
                      if (
                        e.key === 'Enter' &&
                        !isComposing &&
                        !nativeComposing
                      ) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder="메시지를 입력하세요..."
                    className="h-[44px] w-full rounded-[8px] border border-[#E5E7EB] px-4 text-[14px] outline-none placeholder:text-[#9CA3AF] focus:border-[#EB5F27]"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    className="h-[44px] w-[80px] rounded-[8px] bg-[#EB5F27] px-5 text-[14px] font-semibold text-white hover:brightness-95"
                  >
                    전송
                  </button>
                </div>
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto py-1">
                <section className="mb-4 rounded-md border bg-white p-4 shadow-sm">
                  <h3 className="font-label3-semibold text-label-strong mb-3">
                    후배 정보
                  </h3>
                  <dl className="grid grid-cols-2 gap-y-2 text-sm">
                    <dt className="text-gray-500">이름(닉네임)</dt>
                    <dd className="text-gray-900">{peerNickname}</dd>
                    <dt className="text-gray-500">화상통화 분야</dt>
                    <dd className="text-gray-900">테스트</dd>
                    <dt className="text-gray-500">화상통화 주제</dt>
                    <dd className="text-gray-900">OpenVidu 테스트</dd>
                  </dl>
                </section>

                <section className="rounded-md border bg-white p-4 shadow-sm">
                  <h3 className="font-label3-semibold text-label-strong mb-3">
                    공유 파일 리스트
                  </h3>
                  <ul className="space-y-2">
                    {sharedFiles.map((file) => (
                      <li
                        key={file.id}
                        className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-gray-50"
                      >
                        <button
                          type="button"
                          onClick={() => openPreview(file)}
                          className="flex flex-1 items-center gap-2 text-left"
                          title="미리보기"
                        >
                          <span className="text-red-500">📄</span>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {prettySize(file.sizeBytes)}
                            </span>
                          </div>
                        </button>
                        <button
                          onClick={() => handleDownload(file)}
                          className="ml-2 rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                        >
                          다운로드
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
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

export default function TestRoomPage() {
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
      <VideoCallRoomContent />
    </Suspense>
  )
}
