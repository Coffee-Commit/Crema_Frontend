'use client'

import CircleTag from '@/components/ui/Tags/CircleTag'

interface OverviewCardItem {
  label: string
  content: string
}

interface OverviewCardProps {
  items: OverviewCardItem[]
}

export default function OverviewCard({ items }: OverviewCardProps) {
  return (
    <div className="border-border-primary bg-fill-selected-orange p-spacing-sm gap-spacing-4xs flex flex-col rounded-sm border">
      {items.map((item, i) => (
        <div
          key={i}
          className="gap-spacing-3xs flex items-center"
        >
          <CircleTag variant="primary">{item.label}</CircleTag>
          <span className="font-caption2-medium text-black">
            {item.content}
          </span>
        </div>
      ))}
    </div>
  )
}
