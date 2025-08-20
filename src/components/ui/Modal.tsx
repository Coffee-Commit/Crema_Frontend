'use client'
import { ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="bg-surface relative z-10 w-full max-w-md rounded-[var(--radius-xl)] p-6 shadow-xl"
      >
        {title && (
          <h2 className="mb-3 text-lg font-semibold">{title}</h2>
        )}
        <div className="mb-4">{children}</div>
        <div className="flex justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            닫기
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
