'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import SocialButton from '@/components/ui/Buttons/SocialButton'
import SquareButton from '@/components/ui/Buttons/SquareButton'
import { useAuthStore } from '@/store/useAuthStore'

export default function LoginPage() {
  const router = useRouter()
  const { isLoggedIn, mockLogin } = useAuthStore()
  // const { isLoggedIn, login, logout } = useAuthStore()

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/') // 로그인되면 메인페이지 이동
    }
  }, [isLoggedIn, router])

  return (
    <main className="flex min-h-screen flex-col">
      <section className="flex flex-1 items-center justify-center">
        <div className="loginContainer">
          <div className="gap-spacing-5xl flex w-full flex-col items-center justify-center">
            <div className="gap-spacing-4xs flex flex-col items-center">
              <h1 className="text-label-deep font-title2-bold text-center">
                크레마
              </h1>
              <p className="text-label-default font-caption2-medium text-center">
                내게 꼭 맞는 대화 한 잔
              </p>
            </div>
            <div className="gap-spacing-3xs flex w-full flex-col">
              <SocialButton type="kakao" />
              <SocialButton type="google" />
              <SquareButton
                className="w-full rounded-sm"
                size="lg"
                variant="primary"
                onClick={mockLogin}
              >
                일반 로그인 (목데이터)
              </SquareButton>
            </div>
          </div>
          <p className="text-label-subtle font-caption3 gap-spacing-7xs flex items-center">
            <a
              href="#"
              className="text-label-default"
            >
              이용약관
            </a>
            및
            <a
              href="#"
              className="text-label-default"
            >
              개인정보 처리방침
            </a>
            확인 후 동의합니다.
          </p>
        </div>
      </section>
    </main>
  )
}
