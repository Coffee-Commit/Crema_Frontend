import Image from 'next/image'

import { useAuthStore } from '@/store/useAuthStore'

type SocialType = 'google' | 'kakao'

interface SocialButtonProps {
  type: SocialType
  onClick?: () => void
}

const CONFIG: Record<
  SocialType,
  {
    label: string
    src: string
    bg: string
    text: string
    border?: string
  }
> = {
  google: {
    label: '구글 계정으로 계속하기',
    src: '/icons/googleLogo.svg',
    bg: 'bg-google-bg',
    text: 'text-label-deep',
    border: 'border border-google-border',
  },
  kakao: {
    label: '카카오 계정으로 시작하기',
    src: '/icons/kakaoLogo.svg',
    bg: 'bg-kakao-bg',
    text: 'text-label-deep',
  },
}

export default function SocialButton({ type }: SocialButtonProps) {
  const login = useAuthStore((s) => s.login)
  const { label, src, bg, text, border } = CONFIG[type]

  return (
    <button
      onClick={() => login(type)}
      className={`font-label3-medium gap-spacing-5xs px-spacing-10 py-spacing-10 flex h-12 w-full cursor-pointer items-center justify-center rounded-sm transition duration-150 hover:brightness-95 active:brightness-95 ${bg} ${text} ${border ?? ''} `}
    >
      <Image
        src={src}
        alt={type}
        width={16}
        height={16}
      />
      {label}
    </button>
  )
}
