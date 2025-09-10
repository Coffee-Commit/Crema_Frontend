import type { Publisher } from 'openvidu-browser'

import { getPublisherMediaStream } from '@/lib/openvidu/utils'

export type ScreenShareContext = {
  cameraTrack: MediaStreamTrack | null
  screenTrack?: MediaStreamTrack
  displayStream?: MediaStream
  prevVideoEnabled: boolean // 시작 시 카메라 publish 상태
  endedListener?: () => void // 리스너 정리용
}

export type ScreenShareOptions = {
  shareAudio?: boolean
  display?: MediaTrackConstraints
}

export async function swapToScreen(
  publisher: Publisher,
  options: ScreenShareOptions = {},
): Promise<ScreenShareContext> {
  const { shareAudio = false, display = true } = options

  // SDK 호환 유틸 사용으로 안전하게 트랙 추출
  const currentStream = getPublisherMediaStream(publisher)
  const cameraTrack = currentStream?.getVideoTracks()[0] || null
  const prevVideoEnabled = publisher.stream.videoActive

  // 카메라 트랙이 없는 경우 (오디오 전용 또는 권한 거부)
  if (!cameraTrack) {
    throw new Error(
      '현재 Publisher에 비디오 트랙이 없어 replaceTrack을 사용할 수 없습니다. 오디오 전용 환경에서는 다른 방식이 필요합니다.',
    )
  }

  const displayStream = await navigator.mediaDevices.getDisplayMedia({
    video: display,
    audio: shareAudio,
  })
  const screenTrack = displayStream.getVideoTracks()[0]

  if (!screenTrack) {
    displayStream.getTracks().forEach((t) => t.stop())
    throw new Error('화면 공유 트랙을 생성할 수 없습니다.')
  }

  await publisher.replaceTrack(screenTrack)
  return { cameraTrack, screenTrack, displayStream, prevVideoEnabled }
}

export async function swapToCamera(
  publisher: Publisher,
  ctx: ScreenShareContext,
) {
  try {
    if (ctx.cameraTrack && ctx.cameraTrack.readyState === 'live') {
      // 기존 트랙이 살아있다면 복원
      await publisher.replaceTrack(ctx.cameraTrack)
    } else {
      // 기존 트랙이 없거나 종료됨 - 비디오 비활성화
      await publisher.publishVideo(false)
    }
  } finally {
    // 리스너 정리
    if (ctx.endedListener && ctx.screenTrack) {
      ctx.screenTrack.removeEventListener('ended', ctx.endedListener)
    }

    // 화면공유 트랙 및 스트림 정리
    ctx.screenTrack?.stop()
    ctx.displayStream?.getTracks().forEach((t) => t.stop())

    // 화면공유 시작 당시 카메라가 꺼져있었다면 복원 후 다시 끔
    if (!ctx.prevVideoEnabled && ctx.cameraTrack) {
      await publisher.publishVideo(false)
    }
  }
}
