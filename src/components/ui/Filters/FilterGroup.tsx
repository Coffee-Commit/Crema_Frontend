'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export interface FilterGroupProps {
  title: string
  options: string[]
  selected: string[]
  onChange: (newSelected: string[]) => void
}

export default function FilterGroup({
  title,
  options,
  selected,
  onChange,
}: FilterGroupProps) {
  const [isOpen, setIsOpen] = useState(true)

  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((v) => v !== option))
    } else {
      onChange([...selected, option])
    }
  }

  return (
    <div className="border-border-subtler py-spacing-4xs">
      <button
        className="font-label4 text-label-default flex w-full items-center justify-between"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {title}
        <ChevronDown
          size={16}
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <ul className="mt-spacing-3xs gap-spacing-4xs pl-spacing-2xs flex flex-col">
          {options.map((option) => (
            <li
              key={option}
              className={`cursor-pointer rounded-sm px-1 py-[2px] text-sm transition-colors ${
                selected.includes(option)
                  ? 'bg-fill-selected-orange text-label-strong'
                  : 'text-label-default hover:bg-gray-100'
              }`}
              onClick={() => toggle(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
