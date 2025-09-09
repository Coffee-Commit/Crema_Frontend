'use client'

import { useState, KeyboardEvent } from 'react'
import { useOpenViduStore } from '@/store/useOpenViduStore'

export default function MessageInput() {
  const [message, setMessage] = useState('')
  const { sendChatMessage, isConnected } = useOpenViduStore()

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()

    if (message.trim() && isConnected) {
      sendChatMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-[var(--color-border-subtler)] p-[var(--spacing-spacing-6xs)]">
      <form
        onSubmit={handleSubmit}
        className="flex gap-[var(--spacing-spacing-6xs)]"
      >
        <div className="relative flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isConnected ? '메시지를 입력하세요...' : '연결 중...'
            }
            disabled={!isConnected}
            rows={1}
            className="font-body2 w-full resize-none rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] px-[var(--spacing-spacing-6xs)] py-[var(--spacing-spacing-7xs)] text-[var(--color-label-default)] transition-colors focus:border-[var(--color-border-primary)] focus:outline-none disabled:bg-[var(--color-fill-disabled)] disabled:text-[var(--color-label-subtle)]"
            style={{
              minHeight: '36px',
              maxHeight: '108px',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height =
                Math.min(target.scrollHeight, 108) + 'px'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={!message.trim() || !isConnected}
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-fill-primary)] text-[var(--color-fill-white)] transition-all hover:brightness-110 disabled:bg-[var(--color-fill-disabled)] disabled:text-[var(--color-label-subtle)]"
          aria-label="메시지 전송"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>

      <div className="mt-1">
        <p className="font-caption text-xs text-[var(--color-label-subtle)]">
          Enter로 전송, Shift+Enter로 줄바꿈
        </p>
      </div>
    </div>
  )
}
