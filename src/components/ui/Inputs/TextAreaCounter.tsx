'use client'

import clsx from 'clsx'
import { useState } from 'react'

interface TextAreaCounterProps {
  placeholder?: string
  maxLength?: number
  className?: string
}

export default function TextAreaCounter({
  placeholder = '내용을 입력해주세요.',
  maxLength = 2000,
  className,
}: TextAreaCounterProps) {
  const [value, setValue] = useState('')

  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        className="border-border-subtler bg-fill-white p-spacing-2xs font-body3 text-label-default placeholder:text-label-subtle focus:border-border-primary min-h-[120px] w-full resize-none rounded-md border focus:outline-none"
      />
      <div className="font-body3 text-label-subtle text-right">
        {value.length}/{maxLength}
      </div>
    </div>
  )
}
