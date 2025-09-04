'use client'

import clsx from 'clsx'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useState } from 'react'

interface PaginationProps {
  total: number
  initialPage?: number
  onChange?: (page: number) => void
  className?: string
}

export default function Pagination({
  total,
  initialPage = 1,
  onChange,
  className,
}: PaginationProps) {
  const [current, setCurrent] = useState(initialPage)

  const handleChange = (page: number) => {
    setCurrent(page)
    if (onChange) onChange(page)
  }

  const getPageNumbers = () => {
    const visiblePages = 5
    const start =
      Math.floor((current - 1) / visiblePages) * visiblePages + 1
    const end = Math.min(start + visiblePages - 1, total)
    return Array.from(
      { length: end - start + 1 },
      (_, i) => start + i,
    )
  }

  const pages = getPageNumbers()

  return (
    <div
      className={clsx('gap-spacing-2xs flex items-center', className)}
    >
      <button
        onClick={() => handleChange(Math.max(1, current - 1))}
        disabled={current === 1}
        className="text-label-default p-spacing-6xs hover:text-label-subtler cursor-pointer rounded-full disabled:opacity-40"
      >
        <ChevronsLeft size={20} />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => handleChange(page)}
          className={clsx(
            'font-label4-medium flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full transition-colors',
            page === current
              ? 'bg-fill-primary text-white'
              : 'text-label-deep hover:text-label-subtler',
          )}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => handleChange(Math.min(total, current + 1))}
        disabled={current === total}
        className="text-label-default p-spacing-6xs hover:text-label-subtler cursor-pointer rounded-full disabled:opacity-40"
      >
        <ChevronsRight size={20} />
      </button>
    </div>
  )
}
