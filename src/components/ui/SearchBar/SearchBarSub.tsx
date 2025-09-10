'use client'

import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'

interface SearchBarSubProps {
  placeholder?: string
  defaultValue?: string
  onSubmit?: (value: string) => void
  className?: string
}

export default function SearchBarSub({
  placeholder = '어떤 커리어 고민이 있나요?',
  defaultValue = '',
  onSubmit,
  className = '',
}: SearchBarSubProps) {
  const [value, setValue] = useState(defaultValue)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    setValue(defaultValue || '')
  }, [defaultValue])

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit(value.trim())
    }
  }

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
    <div className={`${baseClass} ${appliedClass} ${className}`}>
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
