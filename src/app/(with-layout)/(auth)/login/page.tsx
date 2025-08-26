'use client'
import SocialButton from '@/components/ui/Buttons/SocialButton'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <section className="flex flex-1 items-center justify-center">
        <div className="loginContainer">
          <div className="flex w-full flex-col items-center justify-center gap-56">
            <div className="flex flex-col items-center gap-12">
              <h1 className="text-label-deep font-title2-bold text-center">
                크레마
              </h1>
              <p className="text-label-default font-caption2-medium text-center">
                내게 꼭 맞는 대화 한 잔
              </p>
            </div>
            <div className="flex w-full flex-col gap-16">
              <SocialButton type="kakao" />
              <SocialButton type="google" />
            </div>
          </div>
          <p className="text-label-subtle font-caption3 flex items-center gap-2">
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
