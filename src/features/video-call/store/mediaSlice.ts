import type { Publisher as _Publisher } from 'openvidu-browser'
import { StateCreator } from 'zustand'

import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

import type { MediaSlice, MediaDevice, MediaSettings } from '../types'
import { MEDIA_CONSTRAINTS as _MEDIA_CONSTRAINTS } from '../types'

const logger = createOpenViduLogger('MediaSlice')

export const createMediaSlice: StateCreator<
  MediaSlice,
  [],
  [],
  MediaSlice
> = (set, get) => ({
  // ============================================================================
  // 상태
  // ============================================================================

  publisher: null,
  screenPublisher: null,
  availableDevices: [],
  settings: {
    audioEnabled: true,
    videoEnabled: true,
    screenSharing: false,
  },

  // ============================================================================
  // 액션
  // ============================================================================

  updateSettings: (updates: Partial<MediaSettings>) => {
    const currentSettings = get().settings
    const newSettings = { ...currentSettings, ...updates }

    logger.debug('미디어 설정 업데이트', {
      updates,
      newSettings,
    })

    set({ settings: newSettings })
  },

  toggleAudio: async () => {
    const currentState = get()
    const newAudioEnabled = !currentState.settings.audioEnabled

    logger.info('오디오 토글', {
      from: currentState.settings.audioEnabled,
      to: newAudioEnabled,
    })

    try {
      // Publisher가 있는 경우 실제 오디오 트랙 제어
      if (currentState.publisher) {
        // TODO: 실제 OpenVidu Publisher 오디오 제어
        // await currentState.publisher.publishAudio(newAudioEnabled)
        logger.debug('Publisher 오디오 제어', {
          enabled: newAudioEnabled,
        })
      }

      // 상태 업데이트
      get().updateSettings({ audioEnabled: newAudioEnabled })
    } catch (error) {
      logger.error('오디오 토글 실패', {
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
      throw error
    }
  },

  toggleVideo: async () => {
    const currentState = get()
    const newVideoEnabled = !currentState.settings.videoEnabled

    logger.info('비디오 토글', {
      from: currentState.settings.videoEnabled,
      to: newVideoEnabled,
    })

    try {
      // Publisher가 있는 경우 실제 비디오 트랙 제어
      if (currentState.publisher) {
        // TODO: 실제 OpenVidu Publisher 비디오 제어
        // await currentState.publisher.publishVideo(newVideoEnabled)
        logger.debug('Publisher 비디오 제어', {
          enabled: newVideoEnabled,
        })
      }

      // 상태 업데이트
      get().updateSettings({ videoEnabled: newVideoEnabled })
    } catch (error) {
      logger.error('비디오 토글 실패', {
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
      throw error
    }
  },

  toggleScreenShare: async () => {
    const currentState = get()
    const isCurrentlySharing = currentState.settings.screenSharing

    logger.info('화면 공유 토글', {
      from: isCurrentlySharing,
      to: !isCurrentlySharing,
    })

    try {
      if (!currentState.publisher) {
        throw new Error('Publisher가 초기화되지 않았습니다.')
      }

      // 새로운 screenShare 서비스 사용
      const { toggleScreenShare } = await import(
        '../screenshare/screenShareService'
      )

      await toggleScreenShare(currentState.publisher)

      // 새로운 스토어의 상태를 확인하여 Feature store 상태 동기화
      const { useScreenShareStore } = await import(
        '../screenshare/model/screenShare.store'
      )
      const screenShareState = useScreenShareStore.getState()

      // 상태 업데이트
      get().updateSettings({
        screenSharing: screenShareState.isScreenSharing,
      })
    } catch (error) {
      logger.error('화면 공유 토글 실패', {
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
      throw error
    }
  },

  updateDevices: async () => {
    logger.debug('미디어 장치 목록 업데이트 시작')

    try {
      const devices = await navigator.mediaDevices.enumerateDevices()

      const mediaDevices: MediaDevice[] = devices
        .filter((device) => device.deviceId && device.label)
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label,
          kind: device.kind as MediaDevice['kind'],
        }))

      const audioInputs = mediaDevices.filter(
        (d) => d.kind === 'audioinput',
      )
      const videoInputs = mediaDevices.filter(
        (d) => d.kind === 'videoinput',
      )
      const audioOutputs = mediaDevices.filter(
        (d) => d.kind === 'audiooutput',
      )

      logger.info('미디어 장치 목록 업데이트 완료', {
        audioInputs: audioInputs.length,
        videoInputs: videoInputs.length,
        audioOutputs: audioOutputs.length,
      })

      set({ availableDevices: mediaDevices })
    } catch (error) {
      logger.error('미디어 장치 목록 조회 실패', {
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
      throw error
    }
  },

  selectDevice: async (
    kind: MediaDevice['kind'],
    deviceId: string,
  ) => {
    const currentState = get()
    const device = currentState.availableDevices.find(
      (d) => d.kind === kind && d.deviceId === deviceId,
    )

    if (!device) {
      logger.warn('존재하지 않는 장치 선택 시도', { kind, deviceId })
      return
    }

    logger.info('미디어 장치 선택', {
      kind,
      deviceId,
      label: device.label,
    })

    try {
      const newSettings = { ...currentState.settings }

      // 선택된 장치 ID 업데이트
      if (kind === 'audioinput') {
        newSettings.selectedAudioInput = deviceId
      } else if (kind === 'videoinput') {
        newSettings.selectedVideoInput = deviceId
      } else if (kind === 'audiooutput') {
        newSettings.selectedAudioOutput = deviceId
      }

      set({ settings: newSettings })

      // Publisher가 활성화된 경우 장치 변경 적용
      if (
        currentState.publisher &&
        (kind === 'audioinput' || kind === 'videoinput')
      ) {
        // TODO: OpenVidu Publisher 장치 변경
        // await openViduClient.replaceDevice(kind, deviceId)
        logger.debug('Publisher 장치 변경 적용', { kind, deviceId })
      }
    } catch (error) {
      logger.error('미디어 장치 선택 실패', {
        kind,
        deviceId,
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })
      throw error
    }
  },
})

// ============================================================================
// 화면 공유는 새로운 screenShare 서비스에서 처리됩니다.
// @see /src/features/video-call/screenshare/
// ============================================================================
