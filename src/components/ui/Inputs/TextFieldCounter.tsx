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
  radiusClassName?: string
  value?: string // 🔹 외부 제어 값
  onChange?: (value: string) => void // 🔹 부모로 전달
}

export default function TextFieldCounter({
  placeholder = '닉네임 입력값',
  maxLength = 10,
  status = 'default',
  helperText,
  className,
  radiusClassName = 'rounded-md',
  value: controlledValue,
  onChange,
}: TextFieldCounterProps) {
  const [internalValue, setInternalValue] = useState('')

  // 외부에서 value가 안 들어오면 내부 state 사용
  const value =
    controlledValue !== undefined ? controlledValue : internalValue

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    onChange?.(newValue) // 🔹 부모 state 업데이트
  }

  const isDisabled = status === 'disabled'
  const isError = status === 'error'

  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {/* 입력 필드 */}
      <div
        className={clsx(
          'px-spacing-2xs py-spacing-2xs flex items-center border',
          radiusClassName,
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
          onChange={handleChange}
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
      </div>

      {/* 에러 상태일 때만 헬퍼 텍스트 */}
      {isError && helperText && (
        <p className="font-body3 text-label-error">{helperText}</p>
      )}
    </div>
  )
}
