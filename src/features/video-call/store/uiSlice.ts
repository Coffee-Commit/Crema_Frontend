import { StateCreator } from 'zustand'

import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

import type {
  UISlice,
  SidebarTab,
  VideoCallError,
  UIState,
} from '../types'

const logger = createOpenViduLogger('UISlice')

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (
  set,
  get,
) => ({
  // ============================================================================
  // 상태
  // ============================================================================

  ui: {
    activeTab: 'chat',
    sidebarVisible: true,
    fullscreenMode: false,
    layoutMode: 'sidebar',
  },
  loading: false,
  error: null,

  // ============================================================================
  // 액션
  // ============================================================================

  setActiveTab: (tab: SidebarTab) => {
    const currentTab = get().ui.activeTab

    if (currentTab === tab) {
      logger.debug('동일한 탭 선택 시도', { tab })
      return
    }

    logger.debug('사이드바 탭 변경', {
      from: currentTab,
      to: tab,
    })

    set((state) => ({
      ui: { ...state.ui, activeTab: tab },
    }))
  },

  toggleSidebar: () => {
    const currentVisible = get().ui.sidebarVisible

    logger.debug('사이드바 토글', {
      from: currentVisible,
      to: !currentVisible,
    })

    set((state) => ({
      ui: { ...state.ui, sidebarVisible: !currentVisible },
    }))
  },

  toggleFullscreen: () => {
    const currentFullscreen = get().ui.fullscreenMode

    logger.debug('전체화면 토글', {
      from: currentFullscreen,
      to: !currentFullscreen,
    })

    try {
      if (!currentFullscreen) {
        // 전체화면 모드 진입
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen()
        }
      } else {
        // 전체화면 모드 해제
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }

      set((state) => ({
        ui: { ...state.ui, fullscreenMode: !currentFullscreen },
      }))
    } catch (error) {
      logger.error('전체화면 모드 변경 실패', {
        error:
          error instanceof Error ? error.message : '알 수 없는 오류',
      })

      // 전체화면 API 실패시에도 UI 상태는 업데이트하지 않음
    }
  },

  setLayoutMode: (mode: UIState['layoutMode']) => {
    const currentMode = get().ui.layoutMode

    if (currentMode === mode) {
      logger.debug('동일한 레이아웃 모드 설정 시도', { mode })
      return
    }

    logger.debug('레이아웃 모드 변경', {
      from: currentMode,
      to: mode,
    })

    set((state) => ({
      ui: { ...state.ui, layoutMode: mode },
    }))
  },

  setError: (error: VideoCallError | null) => {
    const currentError = get().error

    if (error) {
      logger.error('에러 설정', {
        code: error.code,
        message: error.message,
        type: error.type,
        recoverable: error.recoverable,
      })
    } else if (currentError) {
      logger.debug('에러 초기화')
    }

    set({ error })
  },

  setLoading: (loading: boolean) => {
    const currentLoading = get().loading

    if (currentLoading !== loading) {
      logger.debug('로딩 상태 변경', {
        from: currentLoading,
        to: loading,
      })

      set({ loading })
    }
  },

  // ============================================================================
  // 추가 유틸리티 액션
  // ============================================================================

  resetUI: () => {
    logger.debug('UI 상태 초기화')

    set({
      ui: {
        activeTab: 'chat',
        sidebarVisible: true,
        fullscreenMode: false,
        layoutMode: 'sidebar',
      },
      loading: false,
      error: null,
    })
  },

  updateUISettings: (updates: Partial<UIState>) => {
    const currentUI = get().ui
    const newUI = { ...currentUI, ...updates }

    logger.debug('UI 설정 업데이트', { updates })

    set({ ui: newUI })
  },

  // 참가자 수에 따른 자동 레이아웃 모드 설정
  autoSetLayoutMode: (participantCount: number) => {
    let newMode: UIState['layoutMode']

    if (participantCount <= 2) {
      newMode = 'sidebar'
    } else if (participantCount <= 4) {
      newMode = 'grid'
    } else {
      newMode = 'speaker'
    }

    const currentMode = get().ui.layoutMode
    if (currentMode !== newMode) {
      logger.debug('참가자 수에 따른 자동 레이아웃 변경', {
        participantCount,
        from: currentMode,
        to: newMode,
      })

      get().setLayoutMode(newMode)
    }
  },

  // 에러 복구 가능 여부에 따른 처리
  handleError: (error: VideoCallError) => {
    get().setError(error)

    if (error.recoverable) {
      logger.info('복구 가능한 에러 발생', {
        code: error.code,
        message: error.message,
      })

      // 복구 가능한 에러의 경우 자동으로 일정 시간 후 에러 상태 클리어
      setTimeout(() => {
        const currentError = get().error
        if (currentError?.code === error.code) {
          get().setError(null)
          logger.debug('복구 가능한 에러 자동 클리어', {
            code: error.code,
          })
        }
      }, 5000)
    } else {
      logger.error('복구 불가능한 에러 발생', {
        code: error.code,
        message: error.message,
      })
    }
  },
})
