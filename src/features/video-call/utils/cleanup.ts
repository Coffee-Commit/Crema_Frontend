import { resetVideoCallStore, useVideoCallStore } from '@/features/video-call/store'

type MaybeRef<T> = { current: T | null } | T | null | undefined

function nullifyVideo(el: HTMLVideoElement | null | undefined) {
  if (!el) return
  try {
    if (!el.paused) el.pause()
  } catch {}
  try {
    // @ts-ignore - srcObject is widely supported
    el.srcObject = null
  } catch {}
}

function stopStream(stream: MediaStream | null | undefined) {
  if (!stream) return
  try {
    stream.getTracks().forEach((t) => {
      try {
        t.stop()
      } catch {}
    })
  } catch {}
}

export interface CleanupOptions {
  // 최소 액션 집합 (zustand action 래핑 객체)
  actions: {
    getState?: () => ReturnType<typeof useVideoCallStore.getState>
    destroyPublisher?: () => Promise<void>
    disconnect: () => Promise<void>
  }
  // 로컬 미디어 컨트롤러 (선택)
  localMediaController?: { stop: () => void }
  // 퍼블리셔 브릿지 (선택)
  publisherBridge?: { unpublish: () => Promise<void> }
  // 해제할 비디오 요소들 (선택)
  videoElements?: Array<MaybeRef<HTMLVideoElement>>
}

/**
 * 멱등 클린업 함수 팩토리. 여러 번 호출되어도 한 번만 수행됩니다.
 */
export function createCleanupCall({
  actions,
  localMediaController,
  publisherBridge,
  videoElements = [],
}: CleanupOptions) {
  let called = false

  return async function cleanup(reason?: string) {
    if (called) return
    called = true

    try {
      // 1) 비디오 요소 srcObject 해제
      for (const v of videoElements) {
        const el = (v && typeof v === 'object' && 'current' in v
          ? (v as { current: HTMLVideoElement | null }).current
          : (v as HTMLVideoElement | null))
        nullifyVideo(el || null)
      }

      // 2) 로컬 미디어 중지
      try {
        localMediaController?.stop()
      } catch {}

      // 3) 브릿지 언게시 (실패해도 계속 진행)
      try {
        await publisherBridge?.unpublish()
      } catch {}

      // 4) Store의 퍼블리셔/세션 정리
      try {
        await actions.destroyPublisher?.()
      } catch {}
      try {
        await actions.disconnect()
      } catch {}

      // 5) Store 상태 리셋 (방어적)
      try {
        resetVideoCallStore()
      } catch {}
    } finally {
      if (process.env.NODE_ENV !== 'production') {
        try {
          console.info('[cleanupCall] completed', { reason })
        } catch {}
      }
    }
  }
}

export function stopAllTracksFromPublisherLike(publisher: unknown) {
  // 방어적: OpenVidu Publisher 또는 유사 객체에서 MediaStream 추출 후 트랙 정지
  try {
    const pub = publisher as { stream?: { getMediaStream?: () => MediaStream | null } }
    const ms = pub?.stream?.getMediaStream?.()
    stopStream(ms || null)
  } catch {}
}

