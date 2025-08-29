'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'

interface SearchBarMainProps {
  placeholder?: string
  onSubmit?: (value: string) => void
  width?: string | number
  height?: string | number
  className?: string
}

export default function SearchBarMain({
  placeholder = '커피챗 제목이나 태그를 검색해보세요!',
  onSubmit,
  width = '100%',
  height = '56px',
  className = '',
}: SearchBarMainProps) {
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
    rounded-[var(--radius-sm)] 
    text-[var(--color-label-default)] 
    font-label1-regular transition
    px-[var(--spacing-spacing-3xs)]
    gap-[var(--spacing-spacing-3xs)]
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
      <Search
        size={24}
        className="text-[var(--color-border-strong)]"
      />
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
    </div>
  )
}
