'use client'

interface RoleBadgeProps {
  role: 'GUIDE' | 'ROOKIE' | null
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  const isGuide = role === 'GUIDE'

  return (
    <span
      className={`font-label5-medium inline-flex h-[22px] flex-shrink-0 items-center justify-center rounded-[var(--radius-circle)] ${
        isGuide
          ? 'bg-[var(--color-fill-sunbae-yellow)] px-[10px] py-[2px] text-[var(--color-label-white)]'
          : 'bg-[var(--color-fill-hoobae-green)] px-[10px] py-[2px] text-[var(--color-label-white)]'
      } `}
    >
      {isGuide ? '선배' : '후배'}
    </span>
  )
}
