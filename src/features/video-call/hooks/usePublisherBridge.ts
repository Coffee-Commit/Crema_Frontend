'use client'

import type { Session, Publisher } from 'openvidu-browser'
import { useRef, useCallback, useEffect } from 'react'

import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

const logger = createOpenViduLogger('PublisherBridge')

export interface PublisherBridgeOptions {
  audioSource?: MediaStreamTrack | boolean
  videoSource?: MediaStreamTrack | boolean
  publishAudio?: boolean
  publishVideo?: boolean
  mirror?: boolean
}

export interface PublisherBridge {
  ensurePublisher: (
    stream: MediaStream,
    options?: PublisherBridgeOptions,
  ) => Promise<Publisher>
  publishFrom: (
    stream: MediaStream,
    options?: PublisherBridgeOptions,
  ) => Promise<Publisher>
  replaceFrom: (stream: MediaStream) => Promise<void>
  unpublish: () => Promise<void>
  currentPublisher: Publisher | null
  isPublishing: boolean
}

export const usePublisherBridge = (
  session: Session | null,
): PublisherBridge => {
  const publisherRef = useRef<Publisher | null>(null)
  const isPublishingRef = useRef(false)
  const pendingRef = useRef<Promise<Publisher> | null>(null)

  // 외부에서 이미 생성된 Publisher 동기화 (예: 다른 경로에서 publish됨)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { openViduClient } = await import(
          '../services/OpenViduClient'
        )
        const existing = openViduClient.getPublisher()
        if (!cancelled && existing) {
          publisherRef.current = existing
          isPublishingRef.current = true
          logger.debug('외부 Publisher 동기화 완료', {
            streamId: existing.stream?.streamId,
          })
        }
      } catch {}
    })()
    return () => {
      cancelled = true
    }
  }, [session])

  const tryHydrateExistingPublisher = useCallback(async () => {
    if (publisherRef.current && isPublishingRef.current) return true
    try {
      const { openViduClient } = await import(
        '../services/OpenViduClient'
      )
      const existing = openViduClient.getPublisher()
      if (existing) {
        publisherRef.current = existing
        isPublishingRef.current = true
        logger.debug('기존 Publisher 참조 획득', {
          streamId: existing.stream?.streamId,
        })
        return true
      }
    } catch {}
    return false
  }, [])

  // Publisher 생성 및 게시
  const ensurePublisher = useCallback(
    async (
      stream: MediaStream,
      options: PublisherBridgeOptions = {},
    ): Promise<Publisher> => {
      if (!session) {
        throw new Error('세션이 연결되지 않음')
      }

      // 이미 생성/게시 대기 중이면 기존 작업 반환
      if (pendingRef.current) {
        logger.debug('Publisher 생성 대기 중 - 기존 Promise 반환')
        return pendingRef.current
      }

      // 이미 게시 중이면 트랙 교체 경로로 처리
      if (isPublishingRef.current && publisherRef.current) {
        logger.debug('이미 게시 중 - 트랙 교체 처리')
        await publisherRef.current.replaceTrack?.(
          stream.getVideoTracks()[0],
        )
        return publisherRef.current
      }

      // 외부에서 이미 게시 중인 경우 동기화 후 교체 처리
      const hydrated = await tryHydrateExistingPublisher()
      if (hydrated && publisherRef.current) {
        logger.debug('동기화된 Publisher에 트랙 교체 처리')
        await publisherRef.current.replaceTrack?.(
          stream.getVideoTracks()[0],
        )
        return publisherRef.current
      }

      try {
        logger.debug('새 Publisher 생성 시작')

        // 기존 OpenVidu 인스턴스 재사용 (새로 생성하지 않음)
        const OV = session.openvidu
        if (!OV) {
          throw new Error('OpenVidu 인스턴스를 찾을 수 없음')
        }

        // 트랙 추출
        const videoTracks = stream.getVideoTracks()
        const audioTracks = stream.getAudioTracks()

        // Publisher 옵션 구성 (빈 객체/falsy 값 체크 개선)
        const isValidSource = (
          source: unknown,
        ): source is MediaStreamTrack => {
          return (
            source instanceof MediaStreamTrack ||
            typeof source === 'boolean'
          )
        }

        const publisherOptions = {
          audioSource: isValidSource(options.audioSource)
            ? options.audioSource
            : audioTracks[0] || false,
          videoSource: isValidSource(options.videoSource)
            ? options.videoSource
            : videoTracks[0] || false,
          publishAudio:
            options.publishAudio ?? audioTracks.length > 0,
          publishVideo:
            options.publishVideo ?? videoTracks.length > 0,
          mirror: options.mirror ?? true,
        }

        logger.debug('Publisher 옵션', publisherOptions)

        // 동시성 가드 설정
        isPublishingRef.current = true
        const createAndPublish = (async () => {
          const publisher = OV.initPublisher(
            undefined,
            publisherOptions,
          )
          await session.publish(publisher)
          return publisher
        })()
        pendingRef.current = createAndPublish
        const publisher = await createAndPublish

        publisherRef.current = publisher
        pendingRef.current = null

        logger.info('Publisher 생성 및 게시 완료', {
          streamId: publisher.stream?.streamId,
          hasAudio: publisherOptions.publishAudio,
          hasVideo: publisherOptions.publishVideo,
        })

        return publisher
      } catch (error) {
        // OpenVidu 106: 이미 퍼블리시 중 → 기존 퍼블리셔를 찾아 트랙 교체로 복구
        const errorObj = error as {
          code?: number | string
          name?: string
        }
        const code = errorObj?.code ?? errorObj?.name
        if (code === 106 || code === '106') {
          logger.warn(
            '이미 퍼블리시 중 감지(106) - 교체 경로로 복구 시도',
          )
          const ok = await tryHydrateExistingPublisher()
          if (ok && publisherRef.current) {
            try {
              await publisherRef.current.replaceTrack?.(
                stream.getVideoTracks()[0],
              )
              logger.info('기존 Publisher에 트랙 교체로 복구 완료')
              return publisherRef.current
            } catch (e) {
              logger.error('복구용 트랙 교체 실패', { e })
            }
          }
        }
        logger.error('Publisher 생성 실패', { error })
        publisherRef.current = null
        isPublishingRef.current = false
        pendingRef.current = null
        throw error
      }
    },
    [session, tryHydrateExistingPublisher],
  )

  // 새 스트림으로 게시 (기존 것이 있으면 교체)
  const publishFrom = useCallback(
    async (
      stream: MediaStream,
      options: PublisherBridgeOptions = {},
    ): Promise<Publisher> => {
      logger.debug('스트림으로부터 게시 시작')

      // 기존 Publisher가 있으면 교체를 우선 시도
      if (isPublishingRef.current && publisherRef.current) {
        try {
          await publisherRef.current.replaceTrack?.(
            stream.getVideoTracks()[0],
          )
          logger.info('교체 완료 후 게시 유지')
          return publisherRef.current
        } catch (e) {
          logger.debug('교체 실패, ensurePublisher로 폴백', { e })
        }
      }

      // 외부 Publisher 동기화 후 교체 재시도
      const hydrated = await tryHydrateExistingPublisher()
      if (hydrated && publisherRef.current) {
        try {
          await publisherRef.current.replaceTrack?.(
            stream.getVideoTracks()[0],
          )
          logger.info('동기화된 Publisher에 교체 완료')
          return publisherRef.current
        } catch (e) {
          logger.debug('동기화 후 교체 실패, ensurePublisher 폴백', {
            e,
          })
        }
      }

      // 새 Publisher 생성 및 게시(or 교체 폴백)
      return await ensurePublisher(stream, options)
    },
    [ensurePublisher, tryHydrateExistingPublisher],
  )

  // 트랙 교체 (replaceTrack 지원 시에만, 아니면 재게시)
  const replaceFrom = useCallback(
    async (stream: MediaStream): Promise<void> => {
      const publisher = publisherRef.current

      if (!publisher || !isPublishingRef.current) {
        // 외부에서 이미 게시 중인지 먼저 확인
        const hydrated = await tryHydrateExistingPublisher()
        if (!hydrated) {
          logger.debug(
            '게시 중 Publisher 없음 - ensurePublisher 시도',
          )
          await ensurePublisher(stream)
          return
        }
      }

      const currentPublisher = publisherRef.current
      if (!currentPublisher) {
        logger.warn('Publisher가 없어 트랙 교체 불가')
        return
      }

      const videoTracks = stream.getVideoTracks()
      const _audioTracks = stream.getAudioTracks()

      try {
        // replaceTrack 지원 여부 확인 및 시도
        if (currentPublisher.replaceTrack && videoTracks.length > 0) {
          logger.debug('replaceTrack으로 비디오 트랙 교체 시도')
          await currentPublisher.replaceTrack(videoTracks[0])
          logger.info('비디오 트랙 교체 완료')
          return
        }

        // replaceTrack이 없거나 실패하면 ensurePublisher로 폴백
        logger.debug(
          'replaceTrack 미지원 또는 실패, ensurePublisher 폴백',
        )
        await ensurePublisher(stream)
      } catch (error) {
        logger.warn('트랙 교체 실패', { error })
        throw error
      }
    },
    [ensurePublisher, tryHydrateExistingPublisher],
  )

  // 언게시
  const unpublish = useCallback(async (): Promise<void> => {
    const publisher = publisherRef.current

    if (!publisher || !isPublishingRef.current) {
      logger.debug('언게시할 Publisher가 없음')
      return
    }

    if (!session) {
      logger.warn('세션이 없어 언게시 불가')
      return
    }

    try {
      logger.debug('Publisher 언게시 시작')

      // 이벤트 리스너 정리 (있다면)
      // publisher.off('streamCreated') 등...

      // 세션에서 언게시
      await session.unpublish(publisher)

      logger.info('Publisher 언게시 완료')
    } catch (error) {
      logger.error('Publisher 언게시 실패', { error })
      // 언게시 실패해도 참조는 정리
    } finally {
      publisherRef.current = null
      isPublishingRef.current = false
    }
  }, [session])

  return {
    ensurePublisher,
    publishFrom,
    replaceFrom,
    unpublish,
    currentPublisher: publisherRef.current,
    isPublishing: isPublishingRef.current,
  }
}
