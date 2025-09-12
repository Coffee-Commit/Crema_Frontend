'use client'

import { useState, useRef, useCallback } from 'react'

import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

const logger = createOpenViduLogger('LocalMediaController')

export type MediaMode = 'idle' | 'camera' | 'screen'

export interface LocalMediaController {
  mode: MediaMode
  currentStreamRef: React.RefObject<MediaStream | null>
  startCamera: () => Promise<void>
  startScreen: () => Promise<void>
  stopCamera: () => void
  stopScreen: () => void
  stop: () => void
  isSwitching: boolean
}

export const useLocalMediaController = (): LocalMediaController => {
  const [mode, setMode] = useState<MediaMode>('idle')
  const [isSwitching, setIsSwitching] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)

  // 현재 스트림의 모든 트랙 정리
  const cleanupCurrentStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
        logger.debug('트랙 정리', {
          kind: track.kind,
          label: track.label,
        })
      })
      streamRef.current = null
    }
  }, [])

  // 카메라 시작
  const startCamera = useCallback(async () => {
    if (isSwitching) {
      logger.warn('전환 중이므로 카메라 시작 무시')
      return
    }

    setIsSwitching(true)

    try {
      logger.debug('카메라 시작 시도')
      cleanupCurrentStream()

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      // 비디오 트랙 힌트 설정: 카메라에는 motion 권장
      try {
        const vtrack = stream.getVideoTracks()[0]
        if (vtrack) {
          if (
            !vtrack.contentHint ||
            vtrack.contentHint !== 'motion'
          ) {
            vtrack.contentHint = 'motion'
          }
        }
      } catch {}

      streamRef.current = stream
      setMode('camera')

      logger.info('카메라 시작 완료', {
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
      })
    } catch (error) {
      logger.error('카메라 시작 실패', { error })
      setMode('idle')
      throw error
    } finally {
      setIsSwitching(false)
    }
  }, [isSwitching, cleanupCurrentStream])

  // 화면공유 시작 (오디오 유지)
  const startScreen = useCallback(async () => {
    if (isSwitching) {
      logger.warn('전환 중이므로 화면공유 시작 무시')
      return
    }

    setIsSwitching(true)

    try {
      logger.debug('화면공유 시작 시도')

      // 디스플레이 스트림 획득 (비디오만)
      const displayStream =
        await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false, // 시스템 오디오는 제외하고 마이크만 사용
        })

      // 마이크 오디오 획득
      let micStream: MediaStream | null = null
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        })
      } catch (micError) {
        logger.warn('마이크 접근 실패, 화면공유만 진행', { micError })
      }

      // 비디오 트랙 + 오디오 트랙 결합
      const tracks: MediaStreamTrack[] = []

      // 화면공유 비디오 트랙 추가
      const videoTrack = displayStream.getVideoTracks()[0]
      if (videoTrack) {
        try {
          // 화면공유는 텍스트/디테일 우선
          // 일부 브라우저는 contentHint 설정을 지원
          if (
            !videoTrack.contentHint ||
            videoTrack.contentHint !== 'detail'
          ) {
            videoTrack.contentHint = 'detail'
          }
        } catch {}
        tracks.push(videoTrack)

        // ended 이벤트로 자동 복원
        videoTrack.onended = () => {
          logger.info('화면공유 종료됨: 카메라로 자동 복원')
          startCamera().catch((error) => {
            logger.error('자동 카메라 복원 실패', { error })
            setMode('idle')
          })
        }
      }

      // 마이크 오디오 트랙 추가 (있으면)
      if (micStream) {
        const audioTrack = micStream.getAudioTracks()[0]
        if (audioTrack) {
          tracks.push(audioTrack)
        }
      }

      // 기존 스트림 정리
      cleanupCurrentStream()

      // 새 결합 스트림 생성
      const combinedStream = new MediaStream(tracks)
      streamRef.current = combinedStream
      setMode('screen')

      logger.info('화면공유 시작 완료', {
        videoTracks: combinedStream.getVideoTracks().length,
        audioTracks: combinedStream.getAudioTracks().length,
      })
    } catch (error) {
      logger.error('화면공유 시작 실패', { error })

      // 실패 시 카메라로 복원 시도
      try {
        await startCamera()
      } catch (cameraError) {
        logger.error('카메라 복원도 실패', { cameraError })
        setMode('idle')
      }

      throw error
    } finally {
      setIsSwitching(false)
    }
  }, [isSwitching, cleanupCurrentStream, startCamera])

  // 카메라 중지
  const stopCamera = useCallback(() => {
    if (mode === 'camera') {
      logger.debug('카메라 중지')
      cleanupCurrentStream()
      setMode('idle')
    }
  }, [mode, cleanupCurrentStream])

  // 화면공유 중지 후 카메라로 복원
  const stopScreen = useCallback(async () => {
    if (mode === 'screen') {
      logger.debug('화면공유 중지, 카메라로 복원')
      cleanupCurrentStream()

      try {
        await startCamera()
      } catch (error) {
        logger.error('화면공유 중지 후 카메라 복원 실패', { error })
        setMode('idle')
      }
    }
  }, [mode, cleanupCurrentStream, startCamera])

  // 모든 미디어 중지
  const stop = useCallback(() => {
    logger.debug('모든 미디어 중지')
    cleanupCurrentStream()
    setMode('idle')
  }, [cleanupCurrentStream])

  return {
    mode,
    currentStreamRef: streamRef,
    startCamera,
    startScreen,
    stopCamera,
    stopScreen,
    stop,
    isSwitching,
  }
}
