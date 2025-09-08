'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import SquareButton from '@/components/ui/Buttons/SquareButton'

export default function NotFound() {
  const router = useRouter()

  return (
    <main className="container flex min-h-screen flex-col items-center justify-center text-left">
      <div className="gap-spacing-6xl md:gap-spacing-2xl flex flex-col items-start md:flex-row">
        <div className="gap-spacing-xl flex flex-col items-center md:items-start">
          <div className="gap-spacing-2xl flex flex-col items-center md:items-start">
            <h1 className="text-label-primary text-[80px] font-extralight">
              404 Error
            </h1>
            <div className="gap-spacing-6xs font-body1 text-label-default flex flex-col">
              <span>죄송합니다. 페이지를 찾을 수 없습니다.</span>
              <span>존재하지 않는 주소를 입력하셨거나,{'\n'}</span>
              <span>
                요청하신 페이지의 주소가 변경 또는 삭제되어 찾을 수
                없습니다.
              </span>
            </div>
          </div>

          {/* 버튼 그룹 */}
          <div className="gap-spacing-3xs flex">
            <SquareButton
              size="md"
              variant="secondary"
               onClick={() => router.push('/')}
            >
              메인으로
            </SquareButton>

            <SquareButton
              size="md"
              variant="primary"
              onClick={() => router.back()}
            >
              이전으로
            </SquareButton>
          </div>
        </div>

        <Image
          src="/images/404Bg.png"
          alt="404 Illustration"
          width={420}
          height={420}
          priority
        />
      </div>
    </main>
  )
}
