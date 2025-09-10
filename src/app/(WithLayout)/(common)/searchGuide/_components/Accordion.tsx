'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface AccordionProps {
  title: string
  children: React.ReactNode
}

export default function Accordion({
  title,
  children,
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div>
      {/* 헤더 */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="mb-spacing-xs flex w-full items-center justify-between text-left"
      >
        <span className="font-title4 text-label-deep">{title}</span>
        {isOpen ? (
          <ChevronDown className="text-label-strong h-4.5 w-4.5" />
        ) : (
          <ChevronRight className="text-label-strong h-4.5 w-4.5" />
        )}
      </button>

      {/* 컨텐츠 */}
      {isOpen && (
        <div className="gap-spacing-3xs mb-spacing-3xs flex flex-col pl-4">
          {children}
        </div>
      )}
    </div>
  )
}
