'use client'

import { RefObject, useCallback } from 'react'

import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

const logger = createOpenViduLogger('VideoBinding')

export interface VideoBinding {
  bind: (stream: MediaStream | null) => Promise<void>
  unbind: () => void
}

export interface VideoBindingOptions {
  muted?: boolean
  playsInline?: boolean
  autoPlay?: boolean
}

export const useVideoBinding = (
  videoRef: RefObject<HTMLVideoElement | null>,
  options: VideoBindingOptions = {},
): VideoBinding => {
  const {
    muted = false,
    playsInline = true,
    autoPlay = true,
  } = options

  // 스트림 바인딩
  const bind = useCallback(
    async (stream: MediaStream | null): Promise<void> => {
      const videoElement = videoRef.current

      if (!videoElement) {
        logger.warn('비디오 요소가 없음')
        return
      }

      try {
        // 기존 스트림 정리
        if (videoElement.srcObject) {
          logger.debug('기존 스트림 정리')
          videoElement.srcObject = null
        }

        // 새 스트림 설정
        if (stream) {
          logger.debug('새 스트림 바인딩', {
            videoTracks: stream.getVideoTracks().length,
            audioTracks: stream.getAudioTracks().length,
          })

          // 비디오 속성 설정
          videoElement.muted = muted
          videoElement.playsInline = playsInline
          videoElement.autoplay = autoPlay

          // 스트림 연결
          videoElement.srcObject = stream

          // 자동 재생 (필요한 경우)
          if (autoPlay) {
            try {
              await videoElement.play()
              logger.debug('비디오 재생 시작')
            } catch (playError) {
              // 자동 재생 실패는 일반적임 (브라우저 정책)
              if (
                playError instanceof Error &&
                (playError.name === 'NotAllowedError' ||
                  playError.name === 'AbortError')
              ) {
                logger.debug('자동 재생 차단됨 (정상)', {
                  error: playError.name,
                })
              } else {
                logger.warn('비디오 재생 실패', { playError })
              }
            }
          }

          // loadedmetadata 이벤트로 추가 안정성 확보
          const handleLoadedMetadata = () => {
            logger.debug('비디오 메타데이터 로드됨')
            videoElement.removeEventListener(
              'loadedmetadata',
              handleLoadedMetadata,
            )

            // 재생이 안되고 있으면 다시 시도
            if (autoPlay && videoElement.paused) {
              videoElement.play().catch((retryError) => {
                logger.debug('재생 재시도 실패', { retryError })
              })
            }
          }

          videoElement.addEventListener(
            'loadedmetadata',
            handleLoadedMetadata,
          )
        } else {
          logger.debug('스트림 제거')
          videoElement.srcObject = null
        }
      } catch (error) {
        logger.error('스트림 바인딩 실패', { error })
        // 에러가 나도 srcObject는 null로 설정
        videoElement.srcObject = null
        throw error
      }
    },
    [videoRef, muted, playsInline, autoPlay],
  )

  // 스트림 언바인딩
  const unbind = useCallback((): void => {
    const videoElement = videoRef.current

    if (!videoElement) {
      return
    }

    logger.debug('스트림 언바인딩')

    try {
      // 재생 중지
      if (!videoElement.paused) {
        videoElement.pause()
      }

      // srcObject 제거
      videoElement.srcObject = null
    } catch (error) {
      logger.error('스트림 언바인딩 실패', { error })
      // 에러가 나도 srcObject는 제거
      videoElement.srcObject = null
    }
  }, [videoRef])

  return {
    bind,
    unbind,
  }
}
