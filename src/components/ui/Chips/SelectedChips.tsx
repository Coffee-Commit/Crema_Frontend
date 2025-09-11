'use client'

import { X } from 'lucide-react'

import { JOB_NAME_MAP } from '@/constants/map'
import { TOPIC_MAP } from '@/constants/map'

interface SelectedChipsProps {
  selected: string[] // enum 값 배열
  onRemove: (value: string) => void
}

export default function SelectedChips({
  selected,
  onRemove,
}: SelectedChipsProps) {
  if (selected.length === 0) return null

  return (
    <div className="gap-spacing-4xs flex min-h-[36px] flex-wrap">
      {selected.map((chip, idx) => {
        const label = JOB_NAME_MAP[chip] ?? TOPIC_MAP[chip] ?? chip // 한글 라벨로 변환
        return (
          <div
            key={`${chip}-${idx}`}
            className="text-label-primary bg-fill-selected-orange gap-spacing-6xs px-spacing-4xs font-label4-medium flex items-center rounded-full py-1"
          >
            {label}
            <button onClick={() => onRemove(chip)}>
              <X
                size={14}
                className="text-label-primary cursor-pointer"
              />
            </button>
          </div>
        )
      })}
    </div>
  )
}
