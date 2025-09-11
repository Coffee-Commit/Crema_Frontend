'use client'

import { useRef, useCallback } from 'react'
import type { Session, Publisher } from 'openvidu-browser'
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

  // Publisher 생성 및 게시
  const ensurePublisher = useCallback(
    async (
      stream: MediaStream,
      options: PublisherBridgeOptions = {},
    ): Promise<Publisher> => {
      if (!session) {
        throw new Error('세션이 연결되지 않음')
      }

      // 이미 게시 중인 경우 기존 Publisher 반환
      if (isPublishingRef.current && publisherRef.current) {
        logger.debug('이미 게시 중인 Publisher 반환')
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

        // Publisher 옵션 구성
        const publisherOptions = {
          audioSource:
            options.audioSource ?? (audioTracks[0] || false),
          videoSource:
            options.videoSource ?? (videoTracks[0] || false),
          publishAudio:
            options.publishAudio ?? audioTracks.length > 0,
          publishVideo:
            options.publishVideo ?? videoTracks.length > 0,
          mirror: options.mirror ?? true,
        }

        logger.debug('Publisher 옵션', publisherOptions)

        // Publisher 생성
        const publisher = OV.initPublisher(
          undefined,
          publisherOptions,
        )

        // 세션에 게시
        await session.publish(publisher)

        publisherRef.current = publisher
        isPublishingRef.current = true

        logger.info('Publisher 생성 및 게시 완료', {
          streamId: publisher.stream?.streamId,
          hasAudio: publisherOptions.publishAudio,
          hasVideo: publisherOptions.publishVideo,
        })

        return publisher
      } catch (error) {
        logger.error('Publisher 생성 실패', { error })
        publisherRef.current = null
        isPublishingRef.current = false
        throw error
      }
    },
    [session],
  )

  // 새 스트림으로 게시 (기존 것이 있으면 교체)
  const publishFrom = useCallback(
    async (
      stream: MediaStream,
      options: PublisherBridgeOptions = {},
    ): Promise<Publisher> => {
      logger.debug('스트림으로부터 게시 시작')

      // 기존 Publisher가 있으면 먼저 언게시
      if (isPublishingRef.current && publisherRef.current) {
        await unpublish()
      }

      // 새 Publisher 생성 및 게시
      return await ensurePublisher(stream, options)
    },
    [ensurePublisher],
  )

  // 트랙 교체 (replaceTrack 지원 시에만, 아니면 재게시)
  const replaceFrom = useCallback(
    async (stream: MediaStream): Promise<void> => {
      const publisher = publisherRef.current

      if (!publisher || !isPublishingRef.current) {
        throw new Error('게시 중인 Publisher가 없음')
      }

      const videoTracks = stream.getVideoTracks()
      const _audioTracks = stream.getAudioTracks()

      try {
        // replaceTrack 지원 여부 확인 및 시도
        if (publisher.replaceTrack && videoTracks.length > 0) {
          logger.debug('replaceTrack으로 비디오 트랙 교체 시도')
          await publisher.replaceTrack(videoTracks[0])
          logger.info('비디오 트랙 교체 완료')
          return
        }

        // replaceTrack이 없거나 실패하면 재게시
        logger.debug('replaceTrack 미지원 또는 실패, 재게시로 폴백')
        await publishFrom(stream)
      } catch (error) {
        logger.warn('트랙 교체 실패, 재게시로 폴백', { error })

        try {
          await publishFrom(stream)
        } catch (republishError) {
          logger.error('재게시도 실패', { republishError })
          throw republishError
        }
      }
    },
    [publishFrom],
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
