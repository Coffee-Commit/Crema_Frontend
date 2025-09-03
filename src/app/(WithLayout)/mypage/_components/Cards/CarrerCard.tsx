'use client'

import SquareButton from '@/components/ui/Buttons/SquareButton'

interface CareerCardProps {
  company: string
  jobTitle: string
  period: string
  verified: boolean
}

export default function CareerCard({
  company,
  jobTitle,
  period,
  verified,
}: CareerCardProps) {
  return (
    <div className="border-border-subtler bg-fill-white p-spacing-xs rounded-sm border">
      <div className="flex items-center justify-between">
        <h2 className="font-heading2 text-label-strong">대표 경력</h2>
        <SquareButton
          variant="secondary"
          size="sm"
        >
          편집
        </SquareButton>
      </div>

      <div className="mt-spacing-3xl gap-spacing-7xl font-body2 text-label-strong flex flex-col">
        <div>
          <p className="font-body3 text-label-subtle">회사명</p>
          <p
            className={
              verified ? 'text-label-strong' : 'text-label-error'
            }
          >
            {verified ? company : '인증 필요'}
          </p>
        </div>
        <div>
          <p className="font-body3 text-label-subtle">직무명</p>
          <p>{jobTitle}</p>
        </div>
        <div>
          <p className="font-body3 text-label-subtle">근무기간</p>
          <p>{period}</p>
        </div>
        <div>
          <p className="font-body3 text-label-subtle">경력 인증</p>
          <p className="text-label-error">
            {verified ? '인증 완료' : '인증 필요'}
          </p>
        </div>
      </div>
    </div>
  )
}
