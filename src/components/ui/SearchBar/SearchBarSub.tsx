'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'

interface SearchBarSubProps {
  placeholder?: string
  onSubmit?: (value: string) => void
  width?: string | number
  height?: string | number
  className?: string
}

export default function SearchBarSub({
  placeholder = '어떤 커리어 고민이 있나요?',
  onSubmit,
  width = '100%',
  height = '48px',
  className = '',
}: SearchBarSubProps) {
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit(value)
    }
  }

  // 상태별 클래스
  const baseClass = `
    flex items-center justify-between 
    rounded-[var(--radius-circle)] 
    text-[var(--color-label-default)] 
    font-caption2-medium transition
    px-[var(--spacing-spacing-3xs)]
  `

  const placeholderClass = `
    bg-[var(--color-fill-input-gray)] 
    border border-transparent
  `

  const focusClass = `
    bg-[var(--color-fill-input-gray)] 
    border border-[var(--color-border-subtle)] 
    focus-within:focus-ring
  `

  const completedClass = `
    bg-[var(--color-fill-input-gray)] 
    border border-[var(--color-border-subtle)]
    text-[var(--color-label-default)]
  `

  const appliedClass = isFocused
    ? focusClass
    : value
      ? completedClass
      : placeholderClass

  return (
    <div
      className={`${baseClass} ${appliedClass} ${className}`}
      style={{ width, height }}
    >
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent outline-none"
      />
      <Search
        size={18}
        className="text-[var(--color-label-default)]"
      />
    </div>
  )
}
