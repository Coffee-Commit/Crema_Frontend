'use client'

import { useCallback, useRef, useState } from 'react'

/**
 * 목 모드: 실제 OV 연동 없이 화면공유/토글 상태만 관리
 * 실제 연동 시 이 훅 내부에서 OpenVidu 세션/퍼블리셔/구독자 로직 연결
 */
const USE_MOCK = true

export type StreamManager = unknown

export type JoinOptions = {
  sessionId?: string
  token?: string
  audio?: boolean
  video?: boolean
  resolution?: string
  frameRate?: number
  mirror?: boolean
}

type UseOpenViduReturn = {
  connected: boolean
  join: (opts?: JoinOptions) => Promise<void>
  leave: () => void
  micOn: boolean
  camOn: boolean
  toggleMic: (next?: boolean) => void
  toggleCam: (next?: boolean) => void
  /** 화면공유 on/off */
  screenShareActive: boolean
  /** 화면공유 MediaStream (비디오 엘리먼트에 연결해서 재생) */
  screenShareStream: MediaStream | null
  /** 화면공유 시작 */
  startScreenShare: () => Promise<void>
  /** 화면공유 정지 */
  stopScreenShare: () => Promise<void>
  publisher: StreamManager | null
  subscribers: StreamManager[]
}

export function useOpenVidu(): UseOpenViduReturn {
  const [connected, setConnected] = useState(false)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)

  const [screenShareActive, setScreenShareActive] = useState(false)
  const [screenShareStream, setScreenShareStream] =
    useState<MediaStream | null>(null)

  const publisherRef = useRef<StreamManager | null>(null)
  const [subscribers, setSubscribers] = useState<StreamManager[]>([])

  // 단순 연결 토글 (목)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const join = useCallback(async (_opts?: JoinOptions) => {
    if (USE_MOCK) {
      setConnected(true)
      return
    }
    // 실제 OV 붙일 때 구현
  }, [])

  const leave = useCallback(() => {
    if (USE_MOCK) {
      setConnected(false)
      setSubscribers([])
      // 화면공유 정리
      setScreenShareActive(false)
      setScreenShareStream((prev) => {
        prev?.getTracks().forEach((t) => t.stop())
        return null
      })
      publisherRef.current = null
      return
    }
    // 실제 OV 세션 disconnect
  }, [])

  const toggleMic = useCallback((next?: boolean) => {
    setMicOn((prev) => (typeof next === 'boolean' ? next : !prev))
  }, [])

  const toggleCam = useCallback((next?: boolean) => {
    setCamOn((prev) => (typeof next === 'boolean' ? next : !prev))
  }, [])

  /** 화면공유 시작: 비디오 엘리먼트에 srcObject로 붙일 MediaStream 생성 */
  const startScreenShare = useCallback(async () => {
    try {
      // 표준 타입으로 호출 (cursor 옵션 등은 타입 경고가 있어 제외)
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      })
      setScreenShareStream(stream)
      setScreenShareActive(true)

      // 사용자가 브라우저 UI에서 공유 중지를 누른 경우
      const [videoTrack] = stream.getVideoTracks()
      if (videoTrack) {
        videoTrack.addEventListener('ended', () => {
          setScreenShareActive(false)
          setScreenShareStream((prev) => {
            prev?.getTracks().forEach((t) => t.stop())
            return null
          })
        })
      }
    } catch (err) {
      // 취소/거부 등
      console.error('getDisplayMedia 실패:', err)
      setScreenShareActive(false)
      setScreenShareStream(null)
    }
  }, [])

  /** 화면공유 정지 */
  const stopScreenShare = useCallback(async () => {
    setScreenShareActive(false)
    setScreenShareStream((prev) => {
      prev?.getTracks().forEach((t) => t.stop())
      return null
    })
  }, [])

  return {
    connected,
    join,
    leave,
    micOn,
    camOn,
    toggleMic,
    toggleCam,
    screenShareActive,
    screenShareStream,
    startScreenShare,
    stopScreenShare,
    publisher: publisherRef.current,
    subscribers,
  }
}
