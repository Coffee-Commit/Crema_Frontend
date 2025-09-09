'use client'

import React from 'react'
import type { ControlButtonProps } from '../types'

export default function ControlButton({
  icon,
  label,
  active = false,
  loading = false,
  disabled = false,
  destructive = false,
  onClick,
  tooltip
}: ControlButtonProps) {
  const getButtonStyles = () => {
    if (loading || disabled) {
      return 'bg-[var(--color-gray-400)] text-[var(--color-label-subtle)] cursor-not-allowed opacity-60'
    }
    
    if (destructive) {
      return 'bg-[var(--color-label-error)] text-[var(--color-fill-white)] hover:scale-110 hover:brightness-110'
    }
    
    if (active) {
      return 'bg-[var(--color-fill-primary)] text-[var(--color-fill-white)] hover:scale-110'
    }
    
    return 'bg-[var(--color-gray-600)] text-[var(--color-fill-white)] hover:scale-110'
  }

  const handleClick = () => {
    if (loading || disabled) return
    onClick()
  }

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        disabled={loading || disabled}
        className={`
          flex h-12 w-12 items-center justify-center rounded-full 
          transition-all duration-200
          ${getButtonStyles()}
        `}
        aria-label={label}
      >
        {loading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          icon
        )}
      </button>
      
      {/* 툴팁 */}
      {tooltip && !loading && (
        <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="rounded-md bg-black bg-opacity-80 px-2 py-1 text-xs text-white whitespace-nowrap">
            {tooltip}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-2 border-transparent border-t-black border-t-opacity-80" />
          </div>
        </div>
      )}
    </div>
  )
}