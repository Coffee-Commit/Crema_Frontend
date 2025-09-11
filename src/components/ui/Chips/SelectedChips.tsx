'use client'

import { X } from 'lucide-react'

interface SelectedChipsProps {
  selected: string[]
  onRemove: (value: string) => void
}

export default function SelectedChips({
  selected,
  onRemove,
}: SelectedChipsProps) {
  if (selected.length === 0) return null

  return (
    <div className="gap-spacing-4xs flex min-h-[36px] flex-wrap">
      {selected.map((chip, idx) => (
        <div
          key={`${chip}-${idx}`}
          className="text-label-primary bg-fill-selected-orange gap-spacing-6xs px-spacing-4xs font-label4-medium flex items-center rounded-full py-1"
        >
          {chip}
          <button onClick={() => onRemove(chip)}>
            <X
              size={14}
              className="text-label-primary"
            />
          </button>
        </div>
      ))}
    </div>
  )
}
