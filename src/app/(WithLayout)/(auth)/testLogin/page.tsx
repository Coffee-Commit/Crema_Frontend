'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import SquareButton from '@/components/ui/Buttons/SquareButton'
import { useAuthStore } from '@/store/useAuthStore'

export default function LoginPage() {
  const router = useRouter()
  const { isLoggedIn, loginTest, createAndLogin } = useAuthStore()
  const [nickname, setNickname] = useState('')

  useEffect(() => {
    if (isLoggedIn) router.push('/')
  }, [isLoggedIn, router])

  const handleTestLogin = async () => {
    if (
      !nickname ||
      (!nickname.startsWith('rookie_') &&
        !nickname.startsWith('guide_'))
    ) {
      alert('테스트 닉네임 형식이 아닙니다. (rookie_*/guide_*)')
      return
    }
    try {
      await loginTest(nickname)
      router.push('/')
    } catch (e) {
      console.error(e)
      alert('테스트 로그인 실패')
    }
  }

  const handleCreateAndLogin = async (role: 'ROOKIE' | 'GUIDE') => {
    try {
      await createAndLogin(role)
      router.push('/')
    } catch (e) {
      console.error(e)
      alert('테스트 계정 생성/로그인 실패')
    }
  }

  return (
    <main className="flex min-h-screen flex-col">
      <section className="flex flex-1 items-center justify-center">
        <div className="loginContainer">
          <div className="gap-spacing-5xl flex w-full flex-col items-center justify-center">
            <div className="gap-spacing-4xs flex flex-col items-center"></div>
            <p className="mb-spacing-xs text-label-subtle font-caption2">
              개발용 테스트 로그인
            </p>
            {/* dev 전용: 테스트 계정 생성 + 로그인 */}
            <div className="gap-spacing-3xs flex w-full flex-col">
              <div className="mb-spacing-xl gap-spacing-2xs flex flex-col">
                <input
                  className="border-line-strong px-spacing-sm py-spacing-2xs w-full rounded-sm border outline-none"
                  placeholder="닉네임"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
                <SquareButton
                  className="w-full"
                  size="lg"
                  variant="primary"
                  onClick={handleTestLogin}
                >
                  닉네임으로 로그인
                </SquareButton>
              </div>

              <SquareButton
                className="w-full"
                size="lg"
                variant="secondary"
                onClick={() => handleCreateAndLogin('ROOKIE')}
              >
                루키 생성 → 로그인
              </SquareButton>
              <SquareButton
                className="w-full"
                size="lg"
                variant="secondary"
                onClick={() => handleCreateAndLogin('GUIDE')}
              >
                가이드 생성 → 로그인
              </SquareButton>
            </div>
          </div>

          <p className="text-label-subtle font-caption3 gap-spacing-7xs mt-spacing-sm flex items-center">
            <a
              href="#"
              className="text-label-default"
            >
              이용약관
            </a>{' '}
            및
            <a
              href="#"
              className="text-label-default"
            >
              {' '}
              개인정보 처리방침
            </a>{' '}
            확인 후 동의합니다.
          </p>
        </div>
      </section>
    </main>
  )
}
