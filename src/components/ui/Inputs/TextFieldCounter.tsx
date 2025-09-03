'use client'

import clsx from 'clsx'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'

type TextFieldStatus = 'default' | 'disabled' | 'error'

interface TextFieldCounterProps {
  placeholder?: string
  maxLength?: number
  status?: TextFieldStatus
  helperText?: string
  className?: string
}

export default function TextFieldCounter({
  placeholder = '닉네임 입력값',
  maxLength = 10,
  status = 'default',
  helperText,
  className,
}: TextFieldCounterProps) {
  const [value, setValue] = useState('')

  const isDisabled = status === 'disabled'
  const isError = status === 'error'

  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {/* 입력 필드 */}
      <div
        className={clsx(
          'px-spacing-2xs py-spacing-2xs flex items-center rounded-md border',
          isDisabled &&
            'bg-fill-disabled text-label-subtler border-border-subtler',
          isError && 'border-label-error bg-fill-white',
          !isDisabled &&
            !isError &&
            'bg-fill-white border-border-subtler',
        )}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={maxLength}
          disabled={isDisabled}
          placeholder={placeholder}
          className={clsx(
            'font-body3 flex-1 bg-transparent focus:outline-none',
            isDisabled
              ? 'text-label-subtler placeholder:text-label-subtler'
              : isError
                ? 'text-label-error placeholder:text-label-subtle'
                : 'text-label-default placeholder:text-label-subtle',
          )}
        />
        {/* 에러일 때 아이콘 */}
        {isError && (
          <AlertCircle
            size={16}
            className="text-label-white fill-label-error ml-1"
          />
        )}
      </div>

      {/* 글자수 카운터 */}
      {maxLength && (
        <div
          className={clsx(
            'font-body3 text-right',
            isError ? 'text-label-error' : 'text-label-subtle',
          )}
        >
          {value.length}/{maxLength}
        </div>
      )}

      {/* 에러 상태일 때만 헬퍼 텍스트 */}
      {isError && helperText && (
        <p className="font-body3 text-label-error">{helperText}</p>
      )}
    </div>
  )
}
