'use client'

interface CreditButtonProps {
  duration: number // 30, 60
  price: number // 8000, 15000
  selected: boolean
  onClick?: () => void
}

export default function CreditButton({
  duration,
  price,
  selected,
  onClick,
}: CreditButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xs flex w-[230px] cursor-pointer flex-col gap-[12px] border py-[20px] text-center transition-colors ${
        selected
          ? 'border-border-primary bg-fill-selected-orange text-label-primary'
          : 'border-border-subtle bg-fill-white text-label-strong'
      } `}
    >
      <div
        className={`font-caption1 ${
          selected ? 'text-label-primary' : 'text-label-strong'
        }`}
      >
        {duration}분
      </div>
      <div className="font-label4-medium text-label-subtle">
        {price.toLocaleString()} P
      </div>
    </button>
  )
}
