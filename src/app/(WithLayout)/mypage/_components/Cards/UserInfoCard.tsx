'use client'

import SquareButton from '@/components/ui/Buttons/SquareButton'

interface UserInfoCardProps {
  nickname: string
  email: string
  bio: string
}

export default function UserInfoCard({
  nickname,
  email,
  bio,
}: UserInfoCardProps) {
  return (
    <div className="border-border-subtler bg-fill-white p-spacing-xs rounded-sm border">
      <div className="flex items-center justify-between">
        <h2 className="font-heading2 text-label-strong">내 정보</h2>
        <SquareButton
          variant="secondary"
          size="sm"
        >
          편집
        </SquareButton>
      </div>

      <div className="mt-spacing-3xl gap-spacing-lg flex items-start">
        <div className="bg-fill-disabled h-[152px] w-[152px] rounded-full" />
        <div className="gap-spacing-sm flex flex-1 flex-col">
          <div>
            <p className="font-body3 text-label-subtle">닉네임</p>
            <p className="font-body2 text-label-strong">{nickname}</p>
          </div>
          <div>
            <p className="font-body3 text-label-subtle">
              계정 이메일
            </p>
            <p className="font-body2 text-label-strong">{email}</p>
          </div>
          <div>
            <p className="font-body3 text-label-subtle">자기소개</p>
            <p className="font-body2 text-label-strong">{bio}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
