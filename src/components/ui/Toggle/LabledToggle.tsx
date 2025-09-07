'use client'

import clsx from 'clsx'
import { useState } from 'react'

interface LabeledToggleProps {
  label: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  className?: string
}

export default function LabeledToggle({
  label,
  checked = false,
  onChange,
  className,
}: LabeledToggleProps) {
  const [isOn, setIsOn] = useState(checked)

  const toggle = () => {
    const newValue = !isOn
    setIsOn(newValue)
    onChange?.(newValue)
  }

  return (
    <div
      className={clsx(
        'bg-fill-white pl-spacing-3xs pr-spacing-4xs py-spacing-5xs gap-spacing-5xs flex w-fit items-center rounded-full',
        className,
      )}
    >
      {/* 라벨 */}
      <span className="font-label4-semibold text-label-strong">
        {label}
      </span>

      {/* 토글 */}
      <button
        type="button"
        onClick={toggle}
        className={clsx(
          'relative inline-flex h-5 w-10 cursor-pointer items-center rounded-full transition-colors duration-300',
          isOn ? 'bg-fill-primary' : 'bg-fill-light',
        )}
      >
        <span
          className={clsx(
            'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-300',
            isOn ? 'translate-x-5' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  )
}
