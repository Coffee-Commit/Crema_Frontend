// 전역 세션 관리자 - React StrictMode 세션 중복 방지
export class GlobalSessionManager {
  private activeSession: {
    key: string
    promise: Promise<void>
  } | null = null
  private cleanupTimeout: NodeJS.Timeout | null = null

  async initializeSession(
    sessionKey: string,
    initFn: () => Promise<void>,
  ): Promise<void> {
    // 동일한 세션이 이미 초기화 중인 경우 기존 Promise 반환
    if (this.activeSession && this.activeSession.key === sessionKey) {
      console.log('🔄 기존 세션 초기화 재사용', sessionKey)
      return this.activeSession.promise
    }

    // 기존 cleanup timeout 취소
    if (this.cleanupTimeout) {
      clearTimeout(this.cleanupTimeout)
      this.cleanupTimeout = null
      console.log('⏰ 세션 cleanup 타이머 취소')
    }

    console.log('🆕 새 세션 초기화 시작', sessionKey)

    const promise = initFn()
    this.activeSession = { key: sessionKey, promise }

    try {
      await promise
      console.log('✅ 세션 초기화 완료', sessionKey)
    } catch (error) {
      console.error('❌ 세션 초기화 실패', sessionKey, error)
      this.activeSession = null
      throw error
    }

    return promise
  }

  scheduleCleanup(
    sessionKey: string,
    cleanupFn: () => Promise<void>,
    delay: number = 500,
  ): void {
    // 기존 cleanup timeout 취소
    if (this.cleanupTimeout) {
      clearTimeout(this.cleanupTimeout)
    }

    console.log(`⏰ 세션 cleanup 예약 (${delay}ms 후)`, sessionKey)

    this.cleanupTimeout = setTimeout(async () => {
      if (
        this.activeSession &&
        this.activeSession.key === sessionKey
      ) {
        console.log('🧹 세션 cleanup 실행', sessionKey)
        try {
          await cleanupFn()
          this.activeSession = null
        } catch (error) {
          console.error('❌ 세션 cleanup 실패', error)
        }
      }
      this.cleanupTimeout = null
    }, delay)
  }

  cancelCleanup(): void {
    if (this.cleanupTimeout) {
      clearTimeout(this.cleanupTimeout)
      this.cleanupTimeout = null
      console.log('❌ 세션 cleanup 취소')
    }
  }

  getCurrentSessionKey(): string | null {
    return this.activeSession?.key || null
  }

  isSessionActive(sessionKey: string): boolean {
    return this.activeSession?.key === sessionKey
  }
}

// 전역 세션 관리자 인스턴스
export const globalSessionManager = new GlobalSessionManager()
