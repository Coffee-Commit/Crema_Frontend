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
      className={`w-[150px] rounded-xl border px-6 py-3 text-center transition-colors ${
        selected
          ? 'border-semantic-accent bg-background-accent-subtle text-semantic-accent'
          : 'border-border-default bg-background-default text-label-primary'
      } `}
    >
      <div className="text-body4-bold">{duration}분</div>
      <div
        className={`text-body5 ${
          selected ? 'text-semantic-accent' : 'text-label-tertiary'
        }`}
      >
        {price.toLocaleString()} P
      </div>
    </button>
  )
}
