import Image from 'next/image'

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
    bg: 'bg-[var(--color-google-bg)]',
    text: 'text-[var(--color-label-deep)]',
    border: 'border border-[var(--color-google-border)]',
  },
  kakao: {
    label: '카카오 계정으로 시작하기',
    src: '/icons/kakaoLogo.svg',
    bg: 'bg-[var(--color-kakao-bg)]',
    text: 'text-[var(--color-label-deep)]',
  },
}

export default function SocialButton({
  type,
  onClick,
}: SocialButtonProps) {
  const { label, src, bg, text, border } = CONFIG[type]

  return (
    <button
      onClick={onClick}
      className={`font-label3 flex h-[48px] w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-12)] px-[var(--spacing-10)] py-[var(--spacing-10)] ${bg} ${text} ${border ?? ''}`}
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
