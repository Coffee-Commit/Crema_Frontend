'use client'

interface ProgressBarProps {
  progress: number // 0~100
  colorClass?: string
}

export default function ProgressBar({
  progress,
  colorClass = 'bg-fill-tooltip-orange',
}: ProgressBarProps) {
  return (
    <div className="bg-fill-disabled rounded-2xs h-2 w-full overflow-hidden">
      <div
        className={`${colorClass} rounded-2xs h-full`}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
