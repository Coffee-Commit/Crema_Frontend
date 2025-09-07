'use client'

import {
  OpenVidu,
  Session,
  Publisher,
  StreamManager,
  Device,
} from 'openvidu-browser'
import { useCallback, useEffect, useRef, useState } from 'react'

export type JoinOptions = {
  sessionId: string
  token: string
  audio?: boolean
  video?: boolean
  resolution?: '640x480' | '1280x720' | '1920x1080'
  frameRate?: number
  mirror?: boolean
}

export type ScreenShareHandle = {
  publisher: Publisher
  stop: () => void
}

export function useOpenVidu() {
  const ovRef = useRef<OpenVidu | null>(null)
  const sessionRef = useRef<Session | null>(null)
  const publisherRef = useRef<Publisher | null>(null)
  const screenPubRef = useRef<Publisher | null>(null)

  const [connected, setConnected] = useState(false)
  const [subscribers, setSubscribers] = useState<StreamManager[]>([])
  const [devices, setDevices] = useState<Device[]>([])

  const join = useCallback(
    async ({
      sessionId,
      token,
      audio = true,
      video = true,
      resolution = '1280x720',
      frameRate = 30,
      mirror = true,
    }: JoinOptions) => {
      if (connected) return

      // ✅ sessionId 사용 (로깅/디버그 등)
      console.debug('[OpenVidu] joining session:', sessionId)

      const OV = new OpenVidu()
      ovRef.current = OV

      const session = OV.initSession()
      sessionRef.current = session

      session.on('streamCreated', (event) => {
        const sub = session.subscribe(event.stream, undefined)
        setSubscribers((prev) => [...prev, sub])
      })

      session.on('streamDestroyed', (event) => {
        setSubscribers((prev) =>
          prev.filter((s) => s !== event.stream.streamManager),
        )
      })

      session.on('exception', (e) => {
        // eslint-disable-next-line no-console
        console.warn('[OpenVidu] exception', e)
      })

      await session.connect(token)

      const publisher = await OV.initPublisherAsync(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: audio,
        publishVideo: video,
        resolution,
        frameRate,
        mirror,
      })

      await session.publish(publisher)
      publisherRef.current = publisher
      setConnected(true)

      try {
        const devs = await OV.getDevices()
        setDevices(devs)
      } catch {
        /* ignore */
      }
    },
    [connected],
  )

  const leave = useCallback(() => {
    try {
      if (screenPubRef.current) {
        try {
          sessionRef.current?.unpublish(screenPubRef.current)
        } catch {}
      }
      sessionRef.current?.disconnect()
    } finally {
      screenPubRef.current = null
      publisherRef.current = null
      sessionRef.current = null
      ovRef.current = null
      setSubscribers([])
      setConnected(false)
    }
  }, [])

  const toggleMic = useCallback((next?: boolean) => {
    const pub = publisherRef.current
    if (!pub) return
    const will = next ?? !pub.stream.audioActive
    pub.publishAudio(will)
  }, [])

  const toggleCam = useCallback((next?: boolean) => {
    const pub = publisherRef.current
    if (!pub) return
    const will = next ?? !pub.stream.videoActive
    pub.publishVideo(will)
  }, [])

  const startScreenShare =
    useCallback(async (): Promise<ScreenShareHandle | null> => {
      const OV = ovRef.current
      const session = sessionRef.current
      if (!OV || !session) return null

      // 이미 공유 중이면 핸들 반환
      if (screenPubRef.current) {
        const existing = screenPubRef.current
        const stopExisting = () => {
          try {
            session.unpublish(existing)
          } finally {
            screenPubRef.current = null
          }
        }
        return { publisher: existing, stop: stopExisting }
      }

      const screenPublisher = await OV.initPublisherAsync(undefined, {
        videoSource: 'screen',
        publishAudio: false,
        publishVideo: true,
        mirror: false,
      })

      await session.publish(screenPublisher)
      screenPubRef.current = screenPublisher

      const stop = () => {
        try {
          session.unpublish(screenPublisher)
        } finally {
          screenPubRef.current = null
        }
      }

      // ✅ 정식 API 경로: getMediaStream() → getVideoTracks()[0] → 'ended'
      const track = screenPublisher.stream
        .getMediaStream()
        ?.getVideoTracks?.()[0]
      track?.addEventListener('ended', stop)

      return { publisher: screenPublisher, stop }
    }, [])

  useEffect(() => {
    const onBeforeUnload = () => {
      if (connected) leave()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () =>
      window.removeEventListener('beforeunload', onBeforeUnload)
  }, [connected, leave])

  return {
    // 상태
    connected,
    subscribers,
    publisher: publisherRef.current,
    devices,

    // 제어
    join,
    leave,
    toggleMic,
    toggleCam,
    startScreenShare,
  }
}
