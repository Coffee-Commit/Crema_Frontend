'use client'

import clsx from 'clsx'
import { useState } from 'react'

interface TextAreaCounterProps {
  placeholder?: string
  maxLength?: number
  className?: string
  value?: string
  onChange?: (value: string) => void
}

export default function TextAreaCounter({
  placeholder = '내용을 입력해주세요.',
  maxLength = 2000,
  className,
  value: controlledValue,
  onChange,
}: TextAreaCounterProps) {
  const [internalValue, setInternalValue] = useState('')

  // controlled / uncontrolled 동시 지원
  const value =
    controlledValue !== undefined ? controlledValue : internalValue
  const setValue = (v: string) => {
    if (onChange) onChange(v)
    setInternalValue(v)
  }

  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        className="border-border-subtler bg-fill-white p-spacing-2xs font-body3 text-label-default placeholder:text-label-subtle focus:border-border-primary min-h-[120px] w-full resize-none rounded-md border focus:outline-none"
      />
    </div>
  )
}
