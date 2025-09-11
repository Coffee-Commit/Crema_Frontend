import { useMemo } from 'react'
import { create } from 'zustand'
import { subscribeWithSelector, devtools } from 'zustand/middleware'

import type {
  SessionSlice,
  ParticipantsSlice,
  MediaSlice,
  ChatSlice,
  UISlice,
  NetworkSlice,
} from '../types'
import { createChatSlice } from './chatSlice'
import { createMediaSlice } from './mediaSlice'
import { createNetworkSlice } from './networkSlice'
import { createParticipantsSlice } from './participantsSlice'
import { createSessionSlice } from './sessionSlice'
import { createUISlice } from './uiSlice'

// ============================================================================
// 통합 Store 타입
// ============================================================================

export type VideoCallStore = SessionSlice &
  ParticipantsSlice &
  MediaSlice &
  ChatSlice &
  UISlice &
  NetworkSlice

// ============================================================================
// Store 생성
// ============================================================================

export const useVideoCallStore = create<VideoCallStore>()(
  devtools(
    subscribeWithSelector((...a) => ({
      ...createSessionSlice(...a),
      ...createParticipantsSlice(...a),
      ...createMediaSlice(...a),
      ...createChatSlice(...a),
      ...createUISlice(...a),
      ...createNetworkSlice(...a),
    })),
    {
      name: 'video-call-store',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
)

// ============================================================================
// Selector 헬퍼 함수들
// ============================================================================

// 세션 관련 selectors
export const useSessionStatus = () =>
  useVideoCallStore((state) => state.status)

export const useIsConnected = () =>
  useVideoCallStore((state) => state.status === 'connected')

export const useSessionInfo = () =>
  useVideoCallStore((state) => state.sessionInfo)

// 참가자 관련 selectors
export const useParticipants = () =>
  useVideoCallStore((state) => state.participants)

export const useLocalParticipant = () =>
  useVideoCallStore((state) =>
    state.localParticipantId
      ? (state.participants.get(state.localParticipantId) ?? null)
      : null,
  )

export const usePinnedParticipant = () =>
  useVideoCallStore((state) =>
    state.pinnedParticipantId
      ? (state.participants.get(state.pinnedParticipantId) ?? null)
      : null,
  )

export const useParticipantCount = () =>
  useVideoCallStore((state) => state.participants.size)

// 미디어 관련 selectors
export const useMediaSettings = () =>
  useVideoCallStore((state) => state.settings)

export const useAudioEnabled = () =>
  useVideoCallStore((state) => state.settings.audioEnabled)

export const useVideoEnabled = () =>
  useVideoCallStore((state) => state.settings.videoEnabled)

export const useScreenSharing = () =>
  useVideoCallStore((state) => state.settings.screenSharing)

export const useAvailableDevices = () =>
  useVideoCallStore((state) => state.availableDevices)

// 현재 Publisher selector
export const usePublisher = () =>
  useVideoCallStore((state) => state.publisher)

// 채팅 관련 selectors
export const useChatMessages = () =>
  useVideoCallStore((state) => state.messages)

export const useUnreadCount = () =>
  useVideoCallStore((state) => state.unreadCount)

export const useHasUnreadMessages = () =>
  useVideoCallStore((state) => state.unreadCount > 0)

// UI 관련 selectors
export const useActiveTab = () =>
  useVideoCallStore((state) => state.ui.activeTab)

export const useUIState = () => useVideoCallStore((state) => state.ui)

export const useLoading = () =>
  useVideoCallStore((state) => state.loading)

export const useError = () =>
  useVideoCallStore((state) => state.error)

// 네트워크 관련 selectors
export const useNetworkQuality = () =>
  useVideoCallStore((state) => state.quality)

export const useNetworkMonitoring = () =>
  useVideoCallStore((state) => state.monitoring)

export const useConnectionStats = () =>
  useVideoCallStore((state) => state.connectionStats)

// ============================================================================
// 복합 Selector들
// ============================================================================

// 세션이 준비되었는지 확인
export const useSessionReady = () =>
  useVideoCallStore(
    (state) =>
      state.status === 'connected' &&
      state.session !== null &&
      state.sessionInfo !== null,
  )

// 미디어가 활성화된 참가자들
export const useActiveParticipants = () =>
  useVideoCallStore((state) =>
    Array.from(state.participants.values()).filter(
      (p) => p.audioEnabled || p.videoEnabled,
    ),
  )

// 현재 발화 중인 참가자들
export const useSpeakingParticipants = () =>
  useVideoCallStore((state) =>
    Array.from(state.participants.values()).filter((p) => p.speaking),
  )

// 채팅 탭의 배지 표시 여부
export const useShouldShowChatBadge = () =>
  useVideoCallStore(
    (state) => state.unreadCount > 0 && state.ui.activeTab !== 'chat',
  )

// 네트워크 경고 표시 여부
export const useShouldShowNetworkWarning = () =>
  useVideoCallStore((state) => {
    if (!state.quality) return false
    return (
      state.quality.level <= 2 ||
      state.quality.latency > 200 ||
      state.quality.packetLoss > 0.03
    )
  })

// ============================================================================
// Actions Export (편의를 위한 re-export)
// ============================================================================

export const useVideoCallActions = () => {
  const store = useVideoCallStore()

  return useMemo(
    () => ({
      // 세션
      connect: store.connect,
      disconnect: store.disconnect,
      updateStatus: store.updateStatus,
      clearError: store.clearError,
      // 현재 store 상태 접근 (Strict narrowing 회피용)
      getState: () => useVideoCallStore.getState(),

      // 참가자
      addParticipant: store.addParticipant,
      updateParticipant: store.updateParticipant,
      removeParticipant: store.removeParticipant,
      pinParticipant: store.pinParticipant,
      setLocalParticipantId: (id: string | null) => {
        useVideoCallStore.setState({ localParticipantId: id })
      },
      setSpeaking: store.setSpeaking,

      // 미디어
      updateSettings: store.updateSettings,
      toggleAudio: store.toggleAudio,
      toggleVideo: store.toggleVideo,
      toggleScreenShare: store.toggleScreenShare,
      updateDevices: store.updateDevices,
      selectDevice: store.selectDevice,

      // 채팅
      addMessage: store.addMessage,
      sendMessage: store.sendMessage,
      markAllAsRead: store.markAllAsRead,
      clearMessages: store.clearMessages,

      // UI
      setActiveTab: store.setActiveTab,
      toggleSidebar: store.toggleSidebar,
      toggleFullscreen: store.toggleFullscreen,
      setLayoutMode: store.setLayoutMode,
      setError: store.setError,
      setLoading: store.setLoading,

      // 네트워크
      updateQuality: store.updateQuality,
      updateParticipantStats: store.updateParticipantStats,
      startMonitoring: store.startMonitoring,
      stopMonitoring: store.stopMonitoring,

      // Publisher 관리 (최소 구현)
      createPublisher: async (options?: {
        publishAudio?: boolean
        publishVideo?: boolean
        resolution?: string
        frameRate?: number
      }) => {
        const { openViduClient } = await import(
          '../services/OpenViduClient'
        )
        const publisher = await openViduClient.publish(options)
        useVideoCallStore.setState({ publisher })
      },
      destroyPublisher: async () => {
        const { openViduClient } = await import(
          '../services/OpenViduClient'
        )
        const current = useVideoCallStore.getState().publisher
        if (current) {
          await openViduClient.unpublish(current)
        }
        useVideoCallStore.setState({ publisher: null })
      },
    }),
    [store],
  ) // store를 의존성으로 추가하여 메모이제이션
}

// ============================================================================
// Store 초기화 유틸리티
// ============================================================================

export const resetVideoCallStore = () => {
  useVideoCallStore.setState({
    // 세션 초기화
    status: 'idle',
    session: null,
    sessionInfo: null,
    currentUsername: null,
    joinSequence: 0,

    // 참가자 초기화
    participants: new Map(),
    localParticipantId: null,
    pinnedParticipantId: null,

    // 미디어 초기화
    publisher: null,
    screenPublisher: null,
    availableDevices: [],
    settings: {
      audioEnabled: true,
      videoEnabled: true,
      screenSharing: false,
    },

    // 채팅 초기화
    messages: [],
    unreadCount: 0,

    // UI 초기화
    ui: {
      activeTab: 'chat',
      sidebarVisible: true,
      fullscreenMode: false,
      layoutMode: 'sidebar',
    },
    loading: false,
    error: null,

    // 네트워크 초기화
    quality: null,
    connectionStats: new Map(),
    monitoring: false,
  })
}

export default useVideoCallStore

// ============================================================================
// Global Debug Helper (window.__vc)
// ============================================================================

declare global {
  interface Window {
    __vc?: {
      getState: () => VideoCallStore
      dumpParticipants: () => Array<{
        id: string
        conn: string
        isLocal: boolean
        hasCam: boolean
      }>
      myConnId: () => string | null
      remoteCount: () => number
      clearLocalAsRemote: () => number
    }
  }
}

if (typeof window !== 'undefined') {
  try {
    const getState = () => useVideoCallStore.getState()
    const dumpParticipants = () => {
      const s = getState()
      return Array.from(s.participants.values()).map((p) => ({
        id: p.id,
        conn: p.connectionId,
        isLocal: p.isLocal,
        hasCam: !!p.streams.camera,
      }))
    }
    const myConnId = () => getState().session?.connection?.connectionId ?? null
    const remoteCount = () =>
      Array.from(getState().participants.values()).filter((p) => !p.isLocal)
        .length
    const clearLocalAsRemote = () => {
      const s = getState()
      const mine = s.session?.connection?.connectionId
      if (!mine) return 0
      let removed = 0
      Array.from(s.participants.values()).forEach((p) => {
        if (!p.isLocal && p.connectionId === mine) {
          s.removeParticipant(p.id)
          removed += 1
        }
      })
      return removed
    }

    window.__vc = {
      getState,
      dumpParticipants,
      myConnId,
      remoteCount,
      clearLocalAsRemote,
    }
    // eslint-disable-next-line no-console
    console.log('[__vc] debug helper ready')
  } catch {
    // ignore
  }
}
