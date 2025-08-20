import { InputHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

export const Input = forwardRef<HTMLInputElement, Props>(
  function Input({ className, error, label, ...rest }, ref) {
    return (
      <div className="space-y-1">
        {label && (
          <label className="text-sm font-medium">{label}</label>
        )}
        <input
          ref={ref}
          className={clsx(
            'bg-surface text-text-primary w-full rounded-[var(--radius-xl)] border border-gray-300 px-3 py-2',
            'placeholder:text-text-secondary focus:border-brand focus:ring-0',
            className,
          )}
          {...rest}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    )
  },
)
