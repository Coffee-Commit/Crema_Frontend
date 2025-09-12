'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

import CircleButton from '@/components/ui/Buttons/CircleButton'
import { logger } from '@/lib/utils/logger'

export default function CreateVideoCallPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [sessionName, setSessionName] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  // 컴포넌트 생명주기 로그
  useEffect(() => {
    logger.group('🏗️ [PAGE] CreateVideoCallPage 마운트')
    logger.log('📋 초기 상태:', {
      username: '',
      sessionName: '',
      isJoining: false,
      pathname: window.location.pathname,
      timestamp: new Date().toISOString(),
    })

    // 간단한 환경 정보 로그
    logger.log('🌐 [ENV] 기본 환경 정보:', {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      onLine: navigator.onLine,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      screenSize: `${screen.width}x${screen.height}`,
    })

    logger.groupEnd()

    return () => {
      logger.log('🗑️ [PAGE] CreateVideoCallPage 언마운트')
    }
  }, [])

  const handleJoinSession = async () => {
    // 이미 진행 중인 경우 중복 클릭 방지
    if (isJoining) {
      logger.warn(
        '🚅 [ACTION] 이미 세션 참여 진행 중, 중복 클릭 무시',
      )
      return
    }

    logger.group('🎯 [ACTION] handleJoinSession 호출')
    logger.log('📋 입력 값 검증:', {
      rawUsername: username,
      rawSessionName: sessionName,
      trimmedUsername: username.trim(),
      trimmedSessionName: sessionName.trim(),
    })

    const trimmedUsername = username.trim()
    const trimmedSessionName = sessionName.trim()

    if (!trimmedUsername || !trimmedSessionName) {
      console.warn('⚠️ [ACTION] 입력 검증 실패:', {
        hasUsername: !!trimmedUsername,
        hasSessionName: !!trimmedSessionName,
      })
      alert('사용자명과 세션명을 모두 입력해주세요.')
      logger.groupEnd()
      return
    }

    logger.log('🔄 상태 업데이트: isJoining = true')
    setIsJoining(true)

    try {
      const targetUrl = `/testroom?username=${encodeURIComponent(trimmedUsername)}&sessionName=${encodeURIComponent(trimmedSessionName)}`
      logger.log('📍 내비게이션 시도:', {
        targetUrl,
        username: trimmedUsername,
        sessionName: trimmedSessionName,
        timestamp: new Date().toISOString(),
      })

      // VideoCallRoom 페이지로 이동
      router.push(targetUrl)
      logger.log('✅ [ACTION] 내비게이션 요청 완료')
    } catch (error) {
      console.error('💥 [ACTION] 세션 참여 실패:', {
        error,
        message:
          error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        username: trimmedUsername,
        sessionName: trimmedSessionName,
      })
      alert('세션 참여에 실패했습니다.')
    } finally {
      logger.log('🔄 상태 복원: isJoining = false')
      setIsJoining(false)
      logger.groupEnd()
    }
  }

  const handleQuickJoin = () => {
    // 이미 진행 중인 경우 중복 클릭 방지
    if (isJoining) {
      logger.warn(
        '🚅 [ACTION] 이미 세션 참여 진행 중, 빠른 참여 무시',
      )
      return
    }

    logger.group('⚡ [ACTION] handleQuickJoin 호출')
    logger.log('🗨️ 빠른 참여 모드 시작')

    const inputUsername = prompt('사용자명을 입력하세요:')
    if (!inputUsername?.trim()) {
      logger.log('ℹ️ [ACTION] 사용자 취소 또는 빈 사용자명')
      logger.groupEnd()
      return
    }

    const inputSessionName = prompt('세션명을 입력하세요:')
    if (!inputSessionName?.trim()) {
      logger.log('ℹ️ [ACTION] 사용자 취소 또는 빈 세션명')
      logger.groupEnd()
      return
    }

    logger.log('📋 사용자 입력:', {
      username: inputUsername.trim(),
      sessionName: inputSessionName.trim(),
    })

    const targetUrl = `/testroom?username=${encodeURIComponent(inputUsername.trim())}&sessionName=${encodeURIComponent(inputSessionName.trim())}`
    logger.log('📍 내비게이션 시도:', {
      targetUrl,
      username: inputUsername.trim(),
      sessionName: inputSessionName.trim(),
    })

    // 빠른 참여시도 로딩 상태 설정
    setIsJoining(true)

    try {
      router.push(targetUrl)
      logger.log('✅ [ACTION] 빠른 참여 성공')
    } catch (error) {
      logger.error('💥 [ACTION] 빠른 참여 실패', { error })
      alert('빠른 참여에 실패했습니다.')
    } finally {
      // 라우터 네비게이션은 비동기이므로 약간의 딥레이 후 리셋
      setTimeout(() => {
        setIsJoining(false)
      }, 1000)
    }

    logger.groupEnd()
  }

  const handleTestRoom2Join = () => {
    // 이미 진행 중인 경우 중복 클릭 방지
    if (isJoining) {
      logger.warn(
        '🚅 [ACTION] 이미 세션 참여 진행 중, TestRoom2 참여 무시',
      )
      return
    }

    logger.group('🧪 [ACTION] handleTestRoom2Join 호출')
    logger.log('🗨️ TestRoom2 빠른 참여 모드 시작')

    const inputSessionName = prompt('세션명을 입력하세요:')
    if (!inputSessionName?.trim()) {
      logger.log('ℹ️ [ACTION] 사용자 취소 또는 빈 세션명')
      logger.groupEnd()
      return
    }

    logger.log('📋 사용자 입력:', {
      sessionName: inputSessionName.trim(),
    })

    const targetUrl = `/testroom2?sessionName=${encodeURIComponent(inputSessionName.trim())}&username=테스트사용자`
    logger.log('📍 내비게이션 시도:', {
      targetUrl,
      sessionName: inputSessionName.trim(),
    })

    // 빠른 참여시도 로딩 상태 설정
    setIsJoining(true)

    try {
      router.push(targetUrl)
      logger.log('✅ [ACTION] TestRoom2 빠른 참여 성공')
    } catch (error) {
      logger.error('💥 [ACTION] TestRoom2 빠른 참여 실패', { error })
      alert('TestRoom2 참여에 실패했습니다.')
    } finally {
      // 라우터 네비게이션은 비동기이므로 약간의 딥레이 후 리셋
      setTimeout(() => {
        setIsJoining(false)
      }, 1000)
    }

    logger.groupEnd()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-default)] p-[var(--spacing-spacing-xs)]">
      <div className="w-full max-w-md rounded-[var(--radius-lg)] bg-[var(--color-fill-white)] p-[var(--spacing-spacing-lg)] shadow-[var(--shadow-card)]">
        <div className="mb-[var(--spacing-spacing-lg)] text-center">
          <h1 className="font-title3 mb-[var(--spacing-spacing-6xs)] text-[var(--color-label-deep)]">
            화상통화 참여 (테스트용)
          </h1>
          <p className="font-body2 text-[var(--color-label-default)]">
            사용자명과 세션명을 입력하여 화상통화에 참여하세요
          </p>
        </div>

        <div className="mb-[var(--spacing-spacing-md)] space-y-[var(--spacing-spacing-3xs)]">
          <div>
            <label
              htmlFor="username"
              className="font-label4-medium mb-[var(--spacing-spacing-6xs)] block text-[var(--color-label-strong)]"
            >
              사용자명
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                logger.log('✏️ [INPUT] username 변경:', {
                  previousValue: username,
                  newValue: e.target.value,
                  inputLength: e.target.value.length,
                })
                setUsername(e.target.value)
              }}
              placeholder="사용자명을 입력하세요 (예: 홍길동)"
              className="font-body2 h-[48px] w-full rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] px-[var(--spacing-spacing-3xs)] text-[var(--color-label-default)] transition-colors focus:border-[var(--color-border-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="sessionName"
              className="font-label4-medium mb-[var(--spacing-spacing-6xs)] block text-[var(--color-label-strong)]"
            >
              세션명
            </label>
            <input
              id="sessionName"
              type="text"
              value={sessionName}
              onChange={(e) => {
                logger.log('✏️ [INPUT] sessionName 변경:', {
                  previousValue: sessionName,
                  newValue: e.target.value,
                  inputLength: e.target.value.length,
                })
                setSessionName(e.target.value)
              }}
              placeholder="세션명을 입력하세요 (예: 회의실1)"
              className="font-body2 h-[48px] w-full rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] px-[var(--spacing-spacing-3xs)] text-[var(--color-label-default)] transition-colors focus:border-[var(--color-border-primary)] focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-[var(--spacing-spacing-3xs)]">
          <CircleButton
            variant="primary"
            size="xl"
            className="w-full"
            onClick={handleJoinSession}
            disabled={isJoining}
          >
            {isJoining ? '참여 중...' : '화상통화 참여'}
          </CircleButton>

          <CircleButton
            variant="secondary"
            size="xl"
            className="w-full"
            onClick={handleQuickJoin}
            disabled={isJoining}
          >
            {isJoining ? '지행 중...' : '빠른 참여'}
          </CircleButton>

          <CircleButton
            variant="tertiary"
            size="xl"
            className="w-full"
            onClick={handleTestRoom2Join}
            disabled={isJoining}
          >
            TestRoom2 빠른 참여 (정식 API)
          </CircleButton>
        </div>

        <div className="mt-[var(--spacing-spacing-lg)] border-t border-[var(--color-border-subtler)] pt-[var(--spacing-spacing-lg)]">
          <div className="text-center">
            <p className="font-caption text-[var(--color-label-subtle)]">
              Test API를 사용하는 개발/테스트용 페이지입니다
              <br />
              동일한 sessionName으로 여러 명이 입장 가능합니다
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
