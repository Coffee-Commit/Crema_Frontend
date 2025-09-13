'use client'

import clsx from 'clsx'
import { useState, useRef, useEffect } from 'react'

interface Option {
  key: string
  label: string
  colorClass?: string
}

interface FilterDropdownProps {
  options: Option[]
  selected: string
  onSelect: (key: string) => void
}

export default function FilterDropdown({
  options,
  selected,
  onSelect,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const current = options.find((o) => o.key === selected)

  // ✅ 바깥 클릭 시 닫히게
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div
      className="relative"
      ref={dropdownRef}
    >
      {/* 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-2xs px-spacing-4xs py-spacing-5xs font-label4-medium text-label-strong border-border-subtler bg-fill-white hover:bg-fill-muted inline-flex min-w-[115px] cursor-pointer items-center justify-between border"
      >
        <span
          className={clsx(
            'h-[6px] w-[6px] rounded-full',
            current?.colorClass ?? 'bg-fill-light',
          )}
        />
        {current?.label}
        <svg
          className="ml-spacing-6xs text-label-default h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* 옵션 목록 */}
      {isOpen && (
        <div className="mt-spacing-3xs rounded-2xs border-border-subtler bg-fill-white px-spacing-4xs py-spacing-5xs absolute left-0 z-20 w-fit border">
          {options.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => {
                onSelect(o.key)
                setIsOpen(false)
              }}
              className={clsx(
                'gap-spacing-2xs rounded-2xs px-spacing-4xs py-spacing-5xs font-label4-medium text-label-deep mb-spacing-5xs hover:bg-fill-selected-orange flex w-full cursor-pointer items-center',
                selected === o.key && 'bg-fill-selected-orange',
              )}
            >
              <span
                className={clsx(
                  'h-[6px] w-[6px] rounded-full',
                  o.colorClass ?? 'bg-fill-light',
                )}
              />
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
