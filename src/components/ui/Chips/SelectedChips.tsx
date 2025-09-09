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
    <div className="mb-spacing-xs flex min-h-[36px] flex-wrap gap-2">
      {selected.map((chip, idx) => (
        <div
          key={`${chip}-${idx}`}
          className="border-border-subtle text-label-default flex items-center gap-1 rounded-full border px-3 py-1 text-sm"
        >
          {chip}
          <button onClick={() => onRemove(chip)}>
            <X
              size={14}
              className="text-gray-400"
            />
          </button>
        </div>
      ))}
    </div>
  )
}
