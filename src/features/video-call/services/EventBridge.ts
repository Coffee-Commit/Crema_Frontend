'use client'

import type {
  Session,
  Publisher as _Publisher,
  Subscriber as _Subscriber,
} from 'openvidu-browser'

import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

import { useVideoCallStore } from '../store'
import type {
  ChatMessage,
  Participant,
  NetworkQuality,
} from '../types'

const logger = createOpenViduLogger('EventBridge')

/**
 * OpenVidu 이벤트를 Store 액션으로 매핑하는 브릿지 클래스
 */
export class EventBridge {
  private session: Session | null = null
  private isActive = false

  constructor() {
    logger.debug('EventBridge 인스턴스 생성')
  }

  // ============================================================================
  // 이벤트 브릿지 활성화/비활성화
  // ============================================================================

  activate(session: Session): void {
    if (this.isActive && this.session === session) {
      logger.debug('EventBridge 이미 활성화됨')
      return
    }

    this.deactivate()
    this.session = session
    this.isActive = true

    this.setupEventListeners()
    logger.info('EventBridge 활성화됨')

    // 활성화 직후 다중 재시도로 원격 연결과 Store를 동기화 (이벤트 레이스 보완)
    const resyncDelays = [100, 500, 1000, 2000]
    resyncDelays.forEach((delay) => {
      setTimeout(() => {
        try {
          logger.debug(`resync 예약 실행 (${delay}ms 지연)`)
          this.resyncRemoteConnections()
        } catch (e) {
          logger.warn(`resync 실패 (${delay}ms)`, {
            error: e instanceof Error ? e.message : String(e),
          })
        }
      }, delay)
    })
  }

  deactivate(): void {
    if (!this.isActive) {
      return
    }

    if (this.session) {
      this.removeEventListeners()
      this.session = null
    }

    this.isActive = false
    logger.info('EventBridge 비활성화됨')
  }

  // ============================================================================
  // OpenVidu 이벤트 리스너 설정
  // ============================================================================

  private setupEventListeners(): void {
    if (!this.session) return

    // 연결 생성 (참가자 입장)
    this.session.on('connectionCreated', (event) => {
      const connId = event.connection.connectionId
      const myId = this.session?.connection?.connectionId

      logger.info('참가자 연결 이벤트', {
        connectionId: connId,
        clientData: event.connection.data,
        isLocal: connId === myId,
      })

      // 원격 참가자를 placeholder로 먼저 추가 (streamCreated 전에 UI/상태 동기화)
      if (connId && myId && connId !== myId) {
        // connection.data에서 닉네임 파싱 시도
        let nickname = event.connection.data || 'Unknown User'
        try {
          const parsed = JSON.parse(
            event.connection.data || '{}',
          ) as {
            clientData?: string
          }
          if (parsed && typeof parsed.clientData === 'string') {
            nickname = parsed.clientData
          }
        } catch {}

        try {
          useVideoCallStore.getState().addParticipant({
            id: connId,
            connectionId: connId,
            nickname,
            isLocal: false,
            streams: {},
            audioLevel: 0,
            speaking: false,
            audioEnabled: true,
            videoEnabled: false,
            isScreenSharing: false,
            joinedAt: new Date(),
          })
          logger.debug('placeholder 참가자 추가', {
            connId,
            nickname,
          })
        } catch (e) {
          logger.warn('placeholder 참가자 추가 실패', {
            connId,
            error: e instanceof Error ? e.message : String(e),
          })
        }
      }
    })

    // 연결 해제 (참가자 퇴장)
    this.session.on('connectionDestroyed', (event) => {
      logger.info('참가자 연결 해제 이벤트', {
        connectionId: event.connection.connectionId,
      })

      // Store에서 참가자 제거
      useVideoCallStore
        .getState()
        .removeParticipant(event.connection.connectionId)
    })

    // 스트림 생성 (참가자의 미디어 스트림 생성)
    this.session.on('streamCreated', (event) => {
      // 자기 스트림인 경우 구독/추가하지 않음 (중복 표시 방지)
      if (
        event.stream.connection.connectionId ===
        this.session?.connection?.connectionId
      ) {
        logger.debug('자기 스트림 감지됨: 구독/참가자 추가 스킵', {
          connectionId: event.stream.connection.connectionId,
        })
        return
      }

      logger.info('🎥 원격 스트림 생성 이벤트!', {
        streamId: event.stream.streamId,
        connectionId: event.stream.connection.connectionId,
        hasAudio: event.stream.hasAudio,
        hasVideo: event.stream.hasVideo,
        typeOfVideo: event.stream.typeOfVideo,
        connectionData: event.stream.connection.data,
      })

      const myConnectionId = this.session?.connection?.connectionId
      const streamConnId = event.stream.connection.connectionId
      const isLocalCalculated = myConnectionId === streamConnId
      logger.debug('streamCreated 판별', {
        myConnectionId,
        streamConnId,
        isLocalCalculated,
      })

      // 참가자 객체 생성 (초기엔 MediaStream은 비워두고, 구독 완료 후 갱신)
      // OpenVidu connection.data는 보통 '{"clientData":"닉네임"}' 형태의 문자열입니다.
      // 표기를 위해 JSON 파싱을 시도합니다.
      let nickname = event.stream.connection.data || 'Unknown User'
      try {
        const parsed = JSON.parse(
          event.stream.connection.data || '{}',
        ) as { clientData?: string }
        if (parsed && typeof parsed.clientData === 'string') {
          nickname = parsed.clientData
        }
      } catch {
        // 파싱 실패 시 원문 유지
      }

      // placeholder가 이미 있을 수 있으므로 addParticipant는 id 중복 시 무시됨
      // 아래에서 updateParticipant로 스트림 정보를 채웁니다.
      try {
        useVideoCallStore.getState().addParticipant({
          id: event.stream.connection.connectionId,
          connectionId: event.stream.connection.connectionId,
          nickname,
          isLocal: isLocalCalculated,
          streams: { camera: undefined, screen: undefined },
          audioLevel: 0,
          speaking: false,
          audioEnabled: event.stream.hasAudio,
          videoEnabled: event.stream.hasVideo,
          isScreenSharing: event.stream.typeOfVideo === 'SCREEN',
          joinedAt: new Date(),
        })
        const size = useVideoCallStore.getState().participants.size
        logger.debug('참가자(스트림 생성) 반영', { size })
      } catch {}

      // 자동 구독 및 구독 후 MediaStream 갱신
      try {
        logger.info('원격 스트림 구독 시작', {
          streamId: event.stream.streamId,
          connectionId: event.stream.connection.connectionId,
          hasAudio: event.stream.hasAudio,
          hasVideo: event.stream.hasVideo,
          typeOfVideo: event.stream.typeOfVideo,
        })

        // OpenVidu의 subscribe는 동기 메서드이지만 실제 스트림 준비는 비동기
        const subscriber = this.session!.subscribe(
          event.stream,
          undefined,
        )

        const connectionId = event.stream.connection.connectionId

        // 구독 성공 로그 (초기 상태)
        logger.info('원격 스트림 구독 생성 완료', {
          streamId: event.stream.streamId,
          connectionId,
          subscriberExists: !!subscriber,
          subscriberStreamExists: !!subscriber?.stream,
          subscriberStreamId: subscriber?.stream?.streamId,
        })

        const updateStreams = () => {
          try {
            // subscriber.stream이 준비되었는지 확인
            if (!subscriber.stream) {
              logger.warn('Subscriber stream not ready', {
                connectionId,
                subscriberExists: !!subscriber,
              })
              return
            }

            const mediaStream = subscriber.stream.getMediaStream()

            if (!mediaStream) {
              logger.warn('MediaStream is null', {
                connectionId,
                streamId: subscriber.stream.streamId,
              })
              return
            }

            // 비디오/오디오 트랙 상세 정보 확인
            const videoTracks = mediaStream.getVideoTracks()
            const audioTracks = mediaStream.getAudioTracks()

            logger.info('MediaStream tracks 상세 정보', {
              connectionId,
              streamId: subscriber.stream.streamId,
              videoCount: videoTracks.length,
              audioCount: audioTracks.length,
              videoEnabled: videoTracks.some((t) => t.enabled),
              audioEnabled: audioTracks.some((t) => t.enabled),
              videoTrackLabels: videoTracks.map((t) => t.label),
              audioTrackLabels: audioTracks.map((t) => t.label),
            })

            const prev = useVideoCallStore
              .getState()
              .participants.get(connectionId)

            const nextStreams = {
              ...(prev?.streams || {}),
              ...(event.stream.typeOfVideo === 'SCREEN'
                ? { screen: mediaStream }
                : { camera: mediaStream }),
            }

            // 실제 비디오 트랙 존재 여부로 videoEnabled 보정 (회색 화면 방지)
            const hasVideoTrack =
              videoTracks.length > 0 &&
              videoTracks.some((t) => t.enabled)

            useVideoCallStore
              .getState()
              .updateParticipant(connectionId, {
                streams: nextStreams,
                audioEnabled:
                  event.stream.hasAudio &&
                  audioTracks.some((t) => t.enabled),
                videoEnabled: hasVideoTrack,
                isScreenSharing:
                  event.stream.typeOfVideo === 'SCREEN',
              })

            logger.info('구독 후 스트림 갱신 성공', {
              connectionId,
              streamId: subscriber.stream.streamId,
              typeOfVideo: event.stream.typeOfVideo,
              videoTracks: videoTracks.length,
              audioTracks: audioTracks.length,
              hasVideoTrack,
              nextStreamsKeys: Object.keys(nextStreams),
            })
          } catch (e) {
            logger.error('구독 후 스트림 갱신 실패', {
              connectionId,
              error: e instanceof Error ? e.message : String(e),
              stack: e instanceof Error ? e.stack : undefined,
            })
          }
        }

        // 이벤트 리스너를 먼저 등록 (스트림 준비 전에 리스너 설정)
        subscriber.on('streamPlaying', () => {
          logger.info(
            'Subscriber stream playing - 스트림 재생 시작',
            {
              connectionId,
              streamId: subscriber.stream?.streamId,
            },
          )
          // streamPlaying이 가장 확실한 스트림 준비 신호
          updateStreams()
        })

        subscriber.on('videoElementCreated', (event) => {
          logger.info('Video element created', {
            connectionId,
            streamId: subscriber.stream?.streamId,
            hasElement: !!event?.element,
          })
          // DOM 요소 생성은 되었지만 스트림은 아직 준비되지 않을 수 있음
          setTimeout(() => updateStreams(), 100)
        })

        // MediaStream 레벨 이벤트 리스너 (트랙 추가 모니터링)
        const mediaStream = subscriber.stream?.getMediaStream?.()
        if (mediaStream) {
          mediaStream.addEventListener('addtrack', (event) => {
            logger.info('Track added to MediaStream', {
              connectionId,
              trackKind: event.track?.kind,
              trackLabel: event.track?.label,
            })
            setTimeout(() => updateStreams(), 50)
          })
        }

        // 재시도 스케줄러: 초기 타이밍 이슈 완화 (더 보수적인 접근)
        const scheduleRetries = () => {
          const delays = [200, 500, 1000, 2000, 3000] // 더 긴 간격으로 조정
          delays.forEach((d, index) => {
            setTimeout(() => {
              logger.debug('스트림 갱신 재시도', {
                connectionId,
                delayMs: d,
                retryCount: index + 1,
                totalRetries: delays.length,
                subscriberStreamReady: !!subscriber.stream,
                mediaStreamExists:
                  !!subscriber.stream?.getMediaStream?.(),
              })
              updateStreams()
            }, d)
          })
        }

        // 초기 시도 (이벤트 리스너 등록 후)
        setTimeout(() => {
          logger.debug('초기 스트림 갱신 시도')
          updateStreams()
          // 초기 시도 후 재시도 스케줄 시작
          scheduleRetries()
        }, 100)

        logger.debug('스트림 구독 완료', {
          streamId: event.stream.streamId,
        })
      } catch (error) {
        logger.error('스트림 구독 실패', {
          streamId: event.stream.streamId,
          error:
            error instanceof Error
              ? error.message
              : '알 수 없는 오류',
        })
      }
    })

    // 스트림 제거
    this.session.on('streamDestroyed', (event) => {
      logger.info('스트림 제거 이벤트', {
        streamId: event.stream.streamId,
        connectionId: event.stream.connection.connectionId,
      })

      // Store에서 참가자 제거
      useVideoCallStore
        .getState()
        .removeParticipant(event.stream.connection.connectionId)
      try {
        const size = useVideoCallStore.getState().participants.size
        logger.debug('참가자 제거 후 현재 수', { size })
      } catch {}
    })

    // 스트림 속성 변경 (음소거/비디오 끄기 등)
    this.session.on('streamPropertyChanged', (event) => {
      logger.debug('스트림 속성 변경 이벤트', {
        streamId: event.stream.streamId,
        property: event.changedProperty,
        newValue: event.newValue,
        oldValue: event.oldValue,
      })

      const connectionId = event.stream.connection.connectionId
      const updates: Partial<Participant> = {}

      // 오디오 활성화 상태 변경
      if (event.changedProperty === 'audioActive') {
        updates.audioEnabled = event.newValue === 'true'
      }
      // 비디오 활성화 상태 변경
      else if (event.changedProperty === 'videoActive') {
        updates.videoEnabled = event.newValue === 'true'
      }
      // 비디오 차원 변경 (해상도 변경)
      else if (event.changedProperty === 'videoDimensions') {
        logger.debug('비디오 해상도 변경', {
          connectionId,
          newDimensions: event.newValue,
        })
      }

      if (Object.keys(updates).length > 0) {
        useVideoCallStore
          .getState()
          .updateParticipant(connectionId, updates)
      }
    })

    // 발화 감지 이벤트
    this.session.on('publisherStartSpeaking', (event) => {
      logger.debug('발화 시작 이벤트', {
        streamId: event.streamId,
        connectionId: event.connection.connectionId,
      })
      // 로컬 발화 이벤트는 참가자 목록에 없을 수 있어 스킵하여 경고 억제
      try {
        const myConnId = this.session?.connection?.connectionId
        if (myConnId && event.connection.connectionId === myConnId) {
          logger.debug('로컬 발화 이벤트 스킵')
          return
        }
      } catch {}

      // 참가자 존재 여부 확인 후 업데이트 (경고 억제)
      try {
        const s = useVideoCallStore.getState()
        if (!s.participants.has(event.connection.connectionId)) {
          logger.debug('발화 업데이트 스킵: 참가자 미존재', {
            connectionId: event.connection.connectionId,
          })
          return
        }
        s.setSpeaking(event.connection.connectionId, true)
      } catch {
        // no-op
      }
    })

    this.session.on('publisherStopSpeaking', (event) => {
      logger.debug('발화 종료 이벤트', {
        streamId: event.streamId,
        connectionId: event.connection.connectionId,
      })
      // 로컬 발화 이벤트는 참가자 목록에 없을 수 있어 스킵
      try {
        const myConnId = this.session?.connection?.connectionId
        if (myConnId && event.connection.connectionId === myConnId) {
          logger.debug('로컬 발화 이벤트 스킵')
          return
        }
      } catch {}

      // 참가자 존재 여부 확인 후 업데이트 (경고 억제)
      try {
        const s = useVideoCallStore.getState()
        if (!s.participants.has(event.connection.connectionId)) {
          logger.debug('발화 업데이트 스킵: 참가자 미존재', {
            connectionId: event.connection.connectionId,
          })
          return
        }
        s.setSpeaking(event.connection.connectionId, false)
      } catch {
        // no-op
      }
    })

    // 신호 수신 (채팅, 커스텀 메시지)
    this.session.on('signal', (event) => {
      this.handleSignal({
        type: event.type || '',
        data: event.data,
        from: { connectionId: event.from?.connectionId || '' },
      })
    })

    // 세션 연결 해제
    this.session.on('sessionDisconnected', (event) => {
      logger.info('세션 연결 해제 이벤트', {
        reason: event.reason,
      })

      // Store 상태 업데이트
      useVideoCallStore.getState().updateStatus('disconnected')
    })

    // 재연결 시도
    this.session.on('reconnecting', () => {
      logger.info('재연결 시도 시작')
      useVideoCallStore.getState().updateStatus('reconnecting')
    })

    this.session.on('reconnected', () => {
      logger.info('재연결 성공')
      useVideoCallStore.getState().updateStatus('connected')
      // 재연결 후 원격 참가자 동기화 시도
      try {
        this.resyncRemoteConnections()
      } catch {}
    })

    // 예외 처리
    this.session.on('exception', (exception) => {
      logger.error('OpenVidu 예외 발생', {
        name: exception.name,
        message: exception.message,
      })

      const error = {
        code: exception.name,
        message: exception.message,
        type: 'connection' as const,
        recoverable: true,
      }

      useVideoCallStore.getState().setError(error)
    })

    // 네트워크 품질 변경
    if ('networkQualityLevelChanged' in this.session) {
      this.session.on(
        'networkQualityLevelChanged' as const,
        (event: {
          connection: { connectionId: string }
          newValue: number
        }) => {
          logger.debug('네트워크 품질 변경', {
            connectionId: event.connection.connectionId,
            level: event.newValue,
          })

          // 네트워크 품질 정보 업데이트
          const quality: NetworkQuality = {
            level: event.newValue,
            latency: 0, // 실제 구현에서는 측정된 값 사용
            jitter: 0,
            packetLoss: 0,
            bandwidth: { upload: 0, download: 0 },
          }

          useVideoCallStore
            .getState()
            .updateParticipantStats(
              event.connection.connectionId,
              quality,
            )
        },
      )
    }
  }

  // 원격 연결 목록과 Store 참가자 불일치 시 placeholder를 채워 넣는다
  private resyncRemoteConnections(): void {
    if (!this.session) return
    try {
      // openvidu-browser 내부 구현 접근 (타입 안전성보다 복구 우선)
      const rc: Map<string, unknown> | undefined = (
        this.session as unknown as {
          remoteConnections?: Map<string, unknown>
        }
      ).remoteConnections
      const rsc: Map<string, unknown> | undefined = (
        this.session as unknown as {
          remoteStreamsCreated?: Map<string, unknown>
        }
      ).remoteStreamsCreated

      // 추가 스트림 상태 확인
      const subscribers: Map<string, unknown> | undefined = (
        this.session as unknown as {
          remoteStreams?: Map<string, unknown>
        }
      ).remoteStreams

      if (
        !rc ||
        typeof (rc as unknown as Map<string, unknown>).forEach !==
          'function'
      ) {
        logger.debug('remoteConnections 없음 또는 유효하지 않음')
        return
      }

      const myId = this.session.connection?.connectionId
      const store = useVideoCallStore.getState()
      logger.debug('resync 시작', {
        sessionId: this.session.sessionId,
        myConnectionId: myId,
        remoteConnSize:
          (rc as unknown as Map<string, unknown>)?.size ?? 0,
        remoteStreamsSize:
          (rsc as unknown as Map<string, unknown>)?.size ?? 0,
        subscribersSize:
          (subscribers as unknown as Map<string, unknown>)?.size ?? 0,
        participantsSize: store.participants.size,
      })

      // 원격 연결 상태 상세 로그
      if (
        rc &&
        typeof (rc as unknown as Map<string, unknown>).forEach ===
          'function'
      ) {
        ;(rc as unknown as Map<string, unknown>).forEach(
          (conn: unknown, key: string) => {
            const connRecord = conn as Record<string, unknown>
            const connId = (connRecord?.connectionId as string) || key
            logger.debug('원격 연결 상태', {
              key,
              connectionId: connId,
              data: connRecord?.data as string,
              isInStore: store.participants.has(connId),
            })
          },
        )
      }

      ;(rc as unknown as Map<string, unknown>).forEach(
        (conn: unknown, key: string) => {
          const connRecord = conn as Record<string, unknown>
          const connId = (connRecord?.connectionId as string) || key
          if (!connId || connId === myId) return
          if (store.participants.has(connId)) return

          let nickname =
            (connRecord?.data as string) || 'Unknown User'
          try {
            const parsed = JSON.parse(nickname || '{}') as {
              clientData?: string
            }
            if (parsed?.clientData) nickname = parsed.clientData
          } catch {}

          store.addParticipant({
            id: connId,
            connectionId: connId,
            nickname,
            isLocal: false,
            streams: {},
            audioLevel: 0,
            speaking: false,
            audioEnabled: true,
            videoEnabled: false,
            isScreenSharing: false,
            joinedAt: new Date(),
          })
          logger.debug('resync placeholder 참가자 추가', {
            connId,
            nickname,
            participantsSize:
              useVideoCallStore.getState().participants.size,
          })
        },
      )

      // 이미 생성된 원격 스트림이 있다면 즉시 구독하여 Store에 반영
      if (
        rsc &&
        typeof (rsc as unknown as Map<string, unknown>).forEach ===
          'function'
      ) {
        logger.debug('원격 스트림 resync 시작', {
          streamsCount:
            (rsc as unknown as Map<string, unknown>)?.size ?? 0,
        })
        ;(rsc as unknown as Map<string, unknown>).forEach(
          (stream: unknown, streamKey: string) => {
            try {
              const streamRecord = stream as Record<string, unknown>
              const connectionRecord =
                streamRecord?.connection as Record<string, unknown>
              const connId = connectionRecord?.connectionId as string
              if (!connId || connId === myId) {
                logger.debug('스트림 스킵', {
                  streamKey,
                  connId,
                  myId,
                })
                return
              }

              logger.info('원격 스트림 발견, 구독 시도', {
                streamKey,
                connectionId: connId,
                streamId: streamRecord?.streamId as string,
                hasAudio: streamRecord?.hasAudio as boolean,
                hasVideo: streamRecord?.hasVideo as boolean,
                typeOfVideo: streamRecord?.typeOfVideo as string,
              })

              // 이미 구독된 스트림인지 확인 (더 엄격한 체크)
              const existingParticipant =
                store.participants.get(connId)
              const hasExistingCamera =
                existingParticipant?.streams.camera
              const hasExistingScreen =
                existingParticipant?.streams.screen
              const streamType = streamRecord.typeOfVideo as string

              const alreadySubscribed =
                streamType === 'SCREEN'
                  ? hasExistingScreen
                  : hasExistingCamera

              if (alreadySubscribed) {
                logger.debug('이미 구독된 스트림, 스킵', {
                  connId,
                  streamKey,
                  streamType,
                  hasExistingCamera: !!hasExistingCamera,
                  hasExistingScreen: !!hasExistingScreen,
                })
                return
              }

              logger.info('resync에서 새로운 스트림 구독 시작', {
                connId,
                streamKey,
                streamType,
              })

              const subscriber = this.session!.subscribe(
                streamRecord as never,
                undefined,
              )

              const updateStreamsResync = () => {
                try {
                  // subscriber.stream이 준비되었는지 확인
                  if (!subscriber.stream) {
                    logger.warn(
                      'Resync: Subscriber stream not ready',
                      {
                        connId,
                        streamKey,
                        subscriberExists: !!subscriber,
                      },
                    )
                    return
                  }

                  const mediaStream =
                    subscriber.stream.getMediaStream()
                  if (!mediaStream) {
                    logger.warn('Resync: MediaStream is null', {
                      connId,
                      streamKey,
                      streamId: subscriber.stream.streamId,
                    })
                    return
                  }

                  // 비디오/오디오 트랙 상세 정보 확인
                  const videoTracks = mediaStream.getVideoTracks()
                  const audioTracks = mediaStream.getAudioTracks()

                  logger.info(
                    'Resync: MediaStream tracks 상세 정보',
                    {
                      connId,
                      streamKey,
                      streamId: subscriber.stream.streamId,
                      videoCount: videoTracks.length,
                      audioCount: audioTracks.length,
                      videoEnabled: videoTracks.some(
                        (t) => t.enabled,
                      ),
                      audioEnabled: audioTracks.some(
                        (t) => t.enabled,
                      ),
                      videoTrackLabels: videoTracks.map(
                        (t) => t.label,
                      ),
                      audioTrackLabels: audioTracks.map(
                        (t) => t.label,
                      ),
                    },
                  )

                  const prev = useVideoCallStore
                    .getState()
                    .participants.get(connId)

                  const typeOfVideo =
                    streamRecord.typeOfVideo as string
                  const nextStreams = {
                    ...(prev?.streams || {}),
                    ...(typeOfVideo === 'SCREEN'
                      ? { screen: mediaStream }
                      : { camera: mediaStream }),
                  }

                  // 실제 비디오 트랙 존재 여부로 videoEnabled 보정
                  const hasVideoTrack =
                    videoTracks.length > 0 &&
                    videoTracks.some((t) => t.enabled)

                  useVideoCallStore
                    .getState()
                    .updateParticipant(connId, {
                      streams: nextStreams,
                      audioEnabled:
                        (streamRecord.hasAudio as boolean) &&
                        audioTracks.some((t) => t.enabled),
                      videoEnabled: hasVideoTrack,
                      isScreenSharing: typeOfVideo === 'SCREEN',
                    })

                  logger.info('resync 스트림 반영 성공', {
                    connId,
                    streamKey,
                    streamId: subscriber.stream.streamId,
                    typeOfVideo,
                    hasVideoTrack,
                    videoTracks: videoTracks.length,
                    audioTracks: audioTracks.length,
                    nextStreamsKeys: Object.keys(nextStreams),
                  })
                } catch (e) {
                  logger.error('resync 스트림 갱신 실패', {
                    connId,
                    streamKey,
                    error: e instanceof Error ? e.message : String(e),
                    stack: e instanceof Error ? e.stack : undefined,
                  })
                }
              }

              // Resync용 이벤트 리스너 등록
              subscriber.on('streamPlaying', () => {
                logger.info('Resync subscriber stream playing', {
                  connId,
                  streamKey,
                  streamId: subscriber.stream?.streamId,
                })
                updateStreamsResync()
              })

              subscriber.on('videoElementCreated', (event) => {
                logger.info('Resync video element created', {
                  connId,
                  streamKey,
                  streamId: subscriber.stream?.streamId,
                  hasElement: !!event?.element,
                })
                setTimeout(() => updateStreamsResync(), 100)
              })

              // 즉시 한 번 시도 및 재시도 스케줄링 (보수적 접근)
              setTimeout(() => {
                logger.debug('Resync 초기 스트림 갱신 시도')
                updateStreamsResync()
              }, 150)

              // 재시도 스케줄
              setTimeout(() => updateStreamsResync(), 500)
              setTimeout(() => updateStreamsResync(), 1000)
              setTimeout(() => updateStreamsResync(), 2000)
            } catch (e) {
              const streamRecord = stream as Record<string, unknown>
              const connectionRecord =
                streamRecord?.connection as Record<string, unknown>
              const connId = connectionRecord?.connectionId as string
              logger.error('resync 스트림 구독 실패', {
                streamKey,
                connId,
                error: e instanceof Error ? e.message : String(e),
              })
            }
          },
        )
      } else {
        logger.debug('remoteStreamsCreated 없음 또는 비어있음')
      }
    } catch (e) {
      logger.warn('resyncRemoteConnections 실패', {
        error: e instanceof Error ? e.message : String(e),
      })
    }
  }

  private removeEventListeners(): void {
    if (!this.session) return

    // 모든 이벤트 리스너 제거
    this.session.off('connectionCreated')
    this.session.off('connectionDestroyed')
    this.session.off('streamCreated')
    this.session.off('streamDestroyed')
    this.session.off('streamPropertyChanged')
    this.session.off('publisherStartSpeaking')
    this.session.off('publisherStopSpeaking')
    this.session.off('signal')
    this.session.off('sessionDisconnected')
    this.session.off('reconnecting')
    this.session.off('reconnected')
    this.session.off('exception')

    logger.debug('OpenVidu 이벤트 리스너 제거 완료')
  }

  // ============================================================================
  // 신호 처리
  // ============================================================================

  private handleSignal(event: {
    type: string
    data: string | undefined
    from: { connectionId: string }
  }): void {
    const { type, data, from } = event

    logger.debug('신호 수신', {
      type,
      from: from?.connectionId,
      dataLength: data?.length,
    })

    if (!data) {
      logger.warn('신호 데이터가 없음', { type })
      return
    }

    try {
      switch (type) {
        case 'signal:chat':
          this.handleChatMessage(data, from)
          break

        case 'signal:notification':
          this.handleNotification(data, from)
          break

        case 'signal:file-share':
          // 파일 공유 신호는 페이지 단에서 처리하는 경우가 있어 노이즈 로그 방지
          try {
            const parsed = JSON.parse(data)
            logger.debug('파일 공유 신호 수신', {
              id: parsed?.id,
              name: parsed?.name,
              sizeBytes: parsed?.sizeBytes,
            })
          } catch {
            logger.debug('파일 공유 신호(파싱 실패)', {
              length: data?.length,
            })
          }
          break

        // 화면공유 상태 브로드캐스트
        case 'signal:screen-share':
          try {
            const payload = JSON.parse(data) as {
              active?: boolean
            }
            const active = !!payload?.active
            const fromId = from?.connectionId
            if (!fromId) break

            // 자기 신호는 무시 (로컬은 이미 상태를 알고 있음)
            try {
              const myConn =
                useVideoCallStore.getState().session?.connection
                  ?.connectionId
              if (myConn && fromId === myConn) {
                logger.debug('자기 신호(screen-share) 에코 무시')
                break
              }
            } catch {}

            // 참가자 존재 확인 후 상태 업데이트
            const store = useVideoCallStore.getState()
            if (store.participants.has(fromId)) {
              store.updateParticipant(fromId, {
                isScreenSharing: active,
              })
              logger.info('원격 화면공유 상태 업데이트(신호)', {
                connectionId: fromId,
                active,
              })
            } else {
              logger.debug(
                '화면공유 신호 수신했으나 참가자 미존재. placeholder 추가',
                { fromId, active },
              )
              // placeholder로 추가 후 상태만 표시
              try {
                useVideoCallStore.getState().addParticipant({
                  id: fromId,
                  connectionId: fromId,
                  nickname: 'Unknown',
                  isLocal: false,
                  streams: {},
                  audioLevel: 0,
                  speaking: false,
                  audioEnabled: true,
                  videoEnabled: true,
                  isScreenSharing: active,
                  joinedAt: new Date(),
                })
              } catch {}
            }
          } catch (e) {
            logger.warn('화면공유 신호 처리 실패', {
              error: e instanceof Error ? e.message : String(e),
            })
          }
          break

        default:
          logger.debug('알 수 없는 신호 타입', { type })
      }
    } catch (error) {
      logger.error('신호 처리 실패', {
        type,
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
    }
  }

  private handleChatMessage(
    data: string,
    from: { connectionId?: string },
  ): void {
    try {
      const messageData = JSON.parse(data)

      // 자기 자신이 보낸 신호는 로컬 낙관적 추가가 이미 있으므로 무시하여 에코 방지
      try {
        const myConn =
          useVideoCallStore.getState().session?.connection
            ?.connectionId
        if (
          from?.connectionId &&
          myConn &&
          from.connectionId === myConn
        ) {
          logger.debug('자기 신호(chat) 에코 무시', {
            messageId: messageData?.id,
          })
          return
        }
      } catch {}

      const chatMessage: ChatMessage = {
        id:
          messageData.id ||
          `msg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        senderId: from?.connectionId || 'unknown',
        senderName: messageData.senderName || 'Unknown User',
        content: messageData.message || messageData.content || '',
        timestamp: messageData.timestamp
          ? new Date(messageData.timestamp)
          : new Date(),
        type: 'user',
      }

      logger.debug('채팅 메시지 처리', {
        messageId: chatMessage.id,
        senderId: chatMessage.senderId,
        senderName: chatMessage.senderName,
      })

      useVideoCallStore.getState().addMessage(chatMessage)
    } catch (error) {
      logger.error('채팅 메시지 파싱 실패', {
        data,
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
    }
  }

  private handleNotification(
    data: string,
    _from: { connectionId?: string },
  ): void {
    try {
      const notificationData = JSON.parse(data)

      const notificationMessage: ChatMessage = {
        id: `notification-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        senderId: 'system',
        senderName: 'System',
        content:
          notificationData.message || notificationData.content || '',
        timestamp: new Date(),
        type: 'notification',
      }

      logger.debug('알림 메시지 처리', {
        content: notificationMessage.content,
      })

      useVideoCallStore.getState().addMessage(notificationMessage)
    } catch (error) {
      logger.error('알림 메시지 파싱 실패', {
        data,
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
    }
  }

  // ============================================================================
  // 유틸리티 메서드
  // ============================================================================

  isActivated(): boolean {
    return this.isActive
  }

  getSession(): Session | null {
    return this.session
  }
}

// 싱글톤 인스턴스
export const eventBridge = new EventBridge()
